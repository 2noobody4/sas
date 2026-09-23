-- ============================================================
-- Migration : ÉCRITURES COMPTABLES MULTI-LIGNES
-- ------------------------------------------------------------
-- Objectif : permettre une écriture avec N lignes (débit/crédit
-- sur plusieurs comptes), en plus de transactions_comptables
-- (2 comptes) qui reste utilisée telle quelle pour tout le code
-- existant (ventes, achats, salaires, services...).
--
-- Nouveau moteur, additif :
--   - ecritures         : l'en-tête (date, libellé, référence, type...)
--   - ecritures_lignes  : le détail (compte, sens, montant) — 2 à N lignes
--
-- Rien n'est renommé ni supprimé. transactions_comptables continue
-- de fonctionner. Une fois le nouveau moteur validé en usage réel,
-- une migration ultérieure pourra rebasculer les écritures simples
-- dessus (hors périmètre de ce fichier).
--
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE ecritures (en-tête)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecritures (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  date_ecriture date NOT NULL DEFAULT CURRENT_DATE,
  libelle text NOT NULL,
  reference text,
  type text NOT NULL DEFAULT 'autre',
  user_id uuid NOT NULL,
  magasin_id uuid,
  exercice_id uuid REFERENCES exercices(id),
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecritures_date ON ecritures(date_ecriture);
CREATE INDEX IF NOT EXISTS idx_ecritures_exercice_id ON ecritures(exercice_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_reference ON ecritures(reference);

-- ------------------------------------------------------------
-- 2. TABLE ecritures_lignes (détail — 2 à N lignes par écriture)
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS ecritures_lignes (
  id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  ecriture_id uuid NOT NULL REFERENCES ecritures(id) ON DELETE CASCADE,
  compte_id uuid NOT NULL REFERENCES comptes(id),
  sens text NOT NULL CHECK (sens IN ('debit', 'credit')),
  montant numeric NOT NULL CHECK (montant > 0),
  libelle_ligne text,
  ordre int NOT NULL DEFAULT 0,
  created_at timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_ecritures_lignes_ecriture_id ON ecritures_lignes(ecriture_id);
CREATE INDEX IF NOT EXISTS idx_ecritures_lignes_compte_id ON ecritures_lignes(compte_id);

-- ------------------------------------------------------------
-- 3. Exercice clôturé => écriture bloquée (même règle que
--    transactions_comptables, adaptée à date_ecriture)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION fn_check_exercice_ouvert_ecriture()
RETURNS TRIGGER AS $$
DECLARE
  v_exercice RECORD;
BEGIN
  SELECT * INTO v_exercice
  FROM exercices
  WHERE NEW.date_ecriture BETWEEN date_debut AND date_fin
  ORDER BY date_debut DESC
  LIMIT 1;

  IF FOUND AND v_exercice.cloture THEN
    RAISE EXCEPTION 'Exercice "%" clôturé : impossible d''enregistrer une écriture datée du %.',
      v_exercice.nom, NEW.date_ecriture
      USING ERRCODE = '23514';
  END IF;

  NEW.exercice_id := v_exercice.id;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_exercice_ouvert_ecriture ON ecritures;
CREATE TRIGGER trg_check_exercice_ouvert_ecriture
BEFORE INSERT OR UPDATE ON ecritures
FOR EACH ROW EXECUTE FUNCTION fn_check_exercice_ouvert_ecriture();

-- ------------------------------------------------------------
-- 4. Équilibre obligatoire : total débit = total crédit par écriture
--    (contrainte différée : vérifiée à la fin de la transaction,
--    donc valide même si les lignes sont insérées une par une)
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

DROP TRIGGER IF EXISTS trg_valider_equilibre_ecriture ON ecritures_lignes;
CREATE CONSTRAINT TRIGGER trg_valider_equilibre_ecriture
AFTER INSERT OR UPDATE OR DELETE ON ecritures_lignes
DEFERRABLE INITIALLY DEFERRED
FOR EACH ROW EXECUTE FUNCTION fn_valider_equilibre_ecriture();

-- ------------------------------------------------------------
-- 5. Fonction atomique de création (en-tête + N lignes + soldes)
--    p_lignes : jsonb, ex.
--    '[{"compte_id":"...","sens":"debit","montant":1000,"libelle_ligne":"..."},
--      {"compte_id":"...","sens":"credit","montant":600},
--      {"compte_id":"...","sens":"credit","montant":400}]'
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION creer_ecriture_multiligne(
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
  v_ecriture_id uuid;
  v_ligne jsonb;
  v_ordre int := 0;
BEGIN
  IF jsonb_array_length(p_lignes) < 2 THEN
    RAISE EXCEPTION 'Une écriture doit comporter au moins 2 lignes.' USING ERRCODE = '23514';
  END IF;

  INSERT INTO ecritures (date_ecriture, libelle, reference, type, user_id, magasin_id)
  VALUES (p_date_ecriture, p_libelle, p_reference, p_type, p_user_id, p_magasin_id)
  RETURNING id INTO v_ecriture_id;

  FOR v_ligne IN SELECT * FROM jsonb_array_elements(p_lignes)
  LOOP
    IF (v_ligne->>'sens') NOT IN ('debit', 'credit') THEN
      RAISE EXCEPTION 'Sens invalide pour une ligne : % (attendu debit ou credit).', v_ligne->>'sens'
        USING ERRCODE = '23514';
    END IF;

    INSERT INTO ecritures_lignes (ecriture_id, compte_id, sens, montant, libelle_ligne, ordre)
    VALUES (
      v_ecriture_id,
      (v_ligne->>'compte_id')::uuid,
      v_ligne->>'sens',
      (v_ligne->>'montant')::numeric,
      v_ligne->>'libelle_ligne',
      v_ordre
    );

    -- Réutilise la RPC déjà existante dans le projet pour mettre à jour
    -- le solde de chaque compte (même fonction que transactions_comptables).
    PERFORM update_compte_solde(
      (v_ligne->>'compte_id')::uuid,
      (v_ligne->>'montant')::numeric,
      v_ligne->>'sens'
    );

    v_ordre := v_ordre + 1;
  END LOOP;

  -- Force la vérification de l'équilibre immédiatement (au lieu d'attendre
  -- le commit) pour renvoyer l'erreur dans le même appel côté client.
  SET CONSTRAINTS trg_valider_equilibre_ecriture IMMEDIATE;

  RETURN v_ecriture_id;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER;

-- ------------------------------------------------------------
-- 6. Vue de lecture (grand livre multi-lignes)
-- ------------------------------------------------------------
CREATE OR REPLACE VIEW v_ecritures_detail AS
SELECT
  e.id AS ecriture_id,
  e.date_ecriture,
  e.libelle,
  e.reference,
  e.type,
  e.user_id,
  e.magasin_id,
  e.exercice_id,
  l.id AS ligne_id,
  l.compte_id,
  c.numero AS compte_numero,
  c.nom AS compte_nom,
  l.sens,
  l.montant,
  l.libelle_ligne,
  l.ordre
FROM ecritures e
JOIN ecritures_lignes l ON l.ecriture_id = e.id
JOIN comptes c ON c.id = l.compte_id
ORDER BY e.date_ecriture DESC, e.created_at DESC, l.ordre ASC;

-- ------------------------------------------------------------
-- 7. RLS — même politique que transactions_comptables
-- ------------------------------------------------------------
ALTER TABLE ecritures ENABLE ROW LEVEL SECURITY;
ALTER TABLE ecritures_lignes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "ecritures_select" ON ecritures;
CREATE POLICY "ecritures_select"
ON ecritures FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "ecritures_write" ON ecritures;
CREATE POLICY "ecritures_write"
ON ecritures FOR ALL
TO authenticated
USING (public.current_role_nom() IN ('admin', 'gestionnaire', 'comptable'))
WITH CHECK (public.current_role_nom() IN ('admin', 'gestionnaire', 'comptable'));

DROP POLICY IF EXISTS "ecritures_lignes_select" ON ecritures_lignes;
CREATE POLICY "ecritures_lignes_select"
ON ecritures_lignes FOR SELECT
TO authenticated
USING (true);

DROP POLICY IF EXISTS "ecritures_lignes_write" ON ecritures_lignes;
CREATE POLICY "ecritures_lignes_write"
ON ecritures_lignes FOR ALL
TO authenticated
USING (public.current_role_nom() IN ('admin', 'gestionnaire', 'comptable'))
WITH CHECK (public.current_role_nom() IN ('admin', 'gestionnaire', 'comptable'));

-- ============================================================
-- FIN — vérifie ensuite dans Supabase que :
--  - la fonction public.current_role_nom() existe déjà (sql/rls_comptabilite_policies.sql)
--  - la RPC update_compte_solde(uuid, numeric, text) existe déjà
--    (utilisée par src/hooks/useComptabilisation.ts)
-- ============================================================
