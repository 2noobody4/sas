-- ============================================================
-- Correctif : ANNULATION et MODIFICATION des écritures multi-lignes
-- ------------------------------------------------------------
-- 🔧 Bug corrigé dans la migration initiale : le trigger d'équilibre
-- (trg_valider_equilibre_ecriture) exigeait AU MOINS 2 lignes après
-- CHAQUE suppression. Or supprimer une écriture entière (DELETE FROM
-- ecritures ...) supprime ses lignes en cascade une par une, et le
-- trigger se déclenchait alors sur un total de 0 ligne restante =>
-- il levait "une écriture doit comporter au moins 2 lignes" et rendait
-- la suppression d'une écriture IMPOSSIBLE. Corrigé : 0 ligne restante
-- (écriture entièrement supprimée) est maintenant un cas valide.
--
-- Ajouts :
--   - annuler_ecriture(uuid)            : contre-passe les soldes et
--                                          supprime une écriture (par id)
--   - annuler_ecritures_par_reference()  : idem, pour toutes les écritures
--                                          partageant une référence donnée
--   - modifier_ecriture_multiligne(...) : annule l'ancienne écriture et
--                                          en recrée une nouvelle avec les
--                                          lignes fournies (atomique)
--
-- Idempotent, à exécuter APRÈS migration_ecritures_multilignes.sql.
-- ============================================================

-- ------------------------------------------------------------
-- 1. Correction du trigger d'équilibre
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_valider_equilibre_ecriture()
RETURNS TRIGGER AS $$
DECLARE
  v_ecriture_id uuid;
  v_total_debit numeric;
  v_total_credit numeric;
  v_nb_lignes int;
BEGIN
  v_ecriture_id := COALESCE(NEW.ecriture_id, OLD.ecriture_id);

  SELECT
    COALESCE(SUM(montant) FILTER (WHERE sens = 'debit'), 0),
    COALESCE(SUM(montant) FILTER (WHERE sens = 'credit'), 0),
    COUNT(*)
  INTO v_total_debit, v_total_credit, v_nb_lignes
  FROM ecritures_lignes
  WHERE ecriture_id = v_ecriture_id;

  -- Écriture entièrement supprimée (ex: DELETE FROM ecritures qui
  -- cascade sur ses lignes) : rien à équilibrer, c'est valide.
  IF v_nb_lignes = 0 THEN
    RETURN NULL;
  END IF;

  IF v_nb_lignes < 2 THEN
    RAISE EXCEPTION 'Une écriture doit comporter au moins 2 lignes (trouvé : %).', v_nb_lignes
      USING ERRCODE = '23514';
  END IF;

  IF v_total_debit <> v_total_credit THEN
    RAISE EXCEPTION 'Écriture déséquilibrée : total débit % ≠ total crédit % (écriture %).',
      v_total_debit, v_total_credit, v_ecriture_id
      USING ERRCODE = '23514';
  END IF;

  RETURN NULL;
END;
$$ LANGUAGE plpgsql;

-- ------------------------------------------------------------
-- 2. Annulation d'une écriture (contre-passation des soldes + suppression)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION annuler_ecriture(p_ecriture_id uuid)
RETURNS void AS $$
DECLARE
  v_ligne RECORD;
BEGIN
  FOR v_ligne IN
    SELECT compte_id, sens, montant FROM ecritures_lignes WHERE ecriture_id = p_ecriture_id
  LOOP
    -- Contre-passe : on inverse le montant sur le même sens, ce qui
    -- annule l'effet initial (voir update_compte_solde, déjà utilisé
    -- par transactions_comptables pour la même logique).
    PERFORM update_compte_solde(v_ligne.compte_id, -v_ligne.montant, v_ligne.sens);
  END LOOP;

  DELETE FROM ecritures WHERE id = p_ecriture_id; -- cascade sur ecritures_lignes
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 3. Annulation de toutes les écritures d'une référence donnée
--    (pendant de annulerTransactionsParReference côté transactions_comptables)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION annuler_ecritures_par_reference(p_reference text)
RETURNS void AS $$
DECLARE
  v_ecriture RECORD;
BEGIN
  FOR v_ecriture IN SELECT id FROM ecritures WHERE reference = p_reference LOOP
    PERFORM annuler_ecriture(v_ecriture.id);
  END LOOP;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 4. Modification d'une écriture multi-lignes
--    Implémentée comme "annuler puis recréer" plutôt que de corriger
--    les lignes une par une : plus simple, et évite tout risque de
--    déséquilibre transitoire sur les soldes des comptes. L'écriture
--    obtient un NOUVEL id après modification (l'ancien disparaît).
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION modifier_ecriture_multiligne(
  p_ecriture_id uuid,
  p_date_ecriture date,
  p_libelle text,
  p_type text,
  p_user_id uuid,
  p_lignes jsonb,
  p_reference text DEFAULT NULL,
  p_magasin_id uuid DEFAULT NULL
)
RETURNS uuid AS $$
DECLARE
  v_new_id uuid;
BEGIN
  PERFORM annuler_ecriture(p_ecriture_id);
  v_new_id := creer_ecriture_multiligne(
    p_date_ecriture, p_libelle, p_type, p_user_id, p_lignes, p_reference, p_magasin_id
  );
  RETURN v_new_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ============================================================
-- FIN
-- ============================================================
