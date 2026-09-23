-- ============================================================
-- Migration : clôture d'exercice bloquante + suivi des paiements
-- sur factures + unicité de factures.numero
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
-- ============================================================

-- ------------------------------------------------------------
-- 1. 🔴 CLÔTURE D'EXERCICE BLOQUANTE
-- ------------------------------------------------------------
ALTER TABLE transactions_comptables
  ADD COLUMN IF NOT EXISTS exercice_id uuid REFERENCES exercices(id);

CREATE INDEX IF NOT EXISTS idx_transactions_comptables_exercice_id
  ON transactions_comptables(exercice_id);

UPDATE transactions_comptables t
SET exercice_id = e.id
FROM exercices e
WHERE t.exercice_id IS NULL
  AND t.date_transaction::date BETWEEN e.date_debut AND e.date_fin;

CREATE OR REPLACE FUNCTION fn_check_exercice_ouvert()
RETURNS TRIGGER AS $$
DECLARE
  v_new_exercice RECORD;
  v_old_exercice RECORD;
BEGIN
  IF TG_OP IN ('INSERT', 'UPDATE') THEN
    SELECT * INTO v_new_exercice
    FROM exercices
    WHERE NEW.date_transaction::date BETWEEN date_debut AND date_fin
    ORDER BY date_debut DESC
    LIMIT 1;

    IF FOUND AND v_new_exercice.cloture THEN
      RAISE EXCEPTION 'Exercice "%" clôturé : impossible d''enregistrer une écriture datée du %.',
        v_new_exercice.nom, NEW.date_transaction::date
        USING ERRCODE = '23514';
    END IF;

    NEW.exercice_id := v_new_exercice.id;
  END IF;

  IF TG_OP IN ('UPDATE', 'DELETE') THEN
    SELECT * INTO v_old_exercice
    FROM exercices
    WHERE OLD.date_transaction::date BETWEEN date_debut AND date_fin
    ORDER BY date_debut DESC
    LIMIT 1;

    IF FOUND AND v_old_exercice.cloture THEN
      RAISE EXCEPTION 'Exercice "%" clôturé : impossible de modifier ou supprimer cette écriture (%).',
        v_old_exercice.nom, OLD.date_transaction::date
        USING ERRCODE = '23514';
    END IF;
  END IF;

  IF TG_OP = 'DELETE' THEN
    RETURN OLD;
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_check_exercice_ouvert ON transactions_comptables;
CREATE TRIGGER trg_check_exercice_ouvert
BEFORE INSERT OR UPDATE OR DELETE ON transactions_comptables
FOR EACH ROW EXECUTE FUNCTION fn_check_exercice_ouvert();

-- ------------------------------------------------------------
-- 2. 🔴 SUIVI DES PAIEMENTS SUR FACTURES
-- ------------------------------------------------------------
ALTER TABLE paiements ADD COLUMN IF NOT EXISTS facture_id uuid REFERENCES factures(id) ON DELETE CASCADE;
ALTER TABLE paiements ALTER COLUMN vente_id DROP NOT NULL;

DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'paiements_source_unique') THEN
    ALTER TABLE paiements ADD CONSTRAINT paiements_source_unique CHECK (
      (vente_id IS NOT NULL AND facture_id IS NULL) OR
      (vente_id IS NULL AND facture_id IS NOT NULL)
    );
  END IF;
END $$;

ALTER TABLE factures ADD COLUMN IF NOT EXISTS montant_regle numeric NOT NULL DEFAULT 0;
ALTER TABLE factures ADD COLUMN IF NOT EXISTS montant_restant numeric GENERATED ALWAYS AS (montant_ttc - montant_regle) STORED;

CREATE OR REPLACE FUNCTION fn_recalculer_montant_regle_facture(p_facture_id uuid)
RETURNS void AS $$
DECLARE
  v_total numeric;
  v_facture RECORD;
  v_nouveau_statut text;
BEGIN
  IF p_facture_id IS NULL THEN
    RETURN;
  END IF;

  SELECT COALESCE(SUM(montant), 0) INTO v_total FROM paiements WHERE facture_id = p_facture_id;
  SELECT * INTO v_facture FROM factures WHERE id = p_facture_id;
  IF NOT FOUND THEN
    RETURN;
  END IF;

  IF v_facture.statut = 'brouillon' THEN
    v_nouveau_statut := v_facture.statut;
  ELSIF v_facture.montant_ttc > 0 AND v_total >= v_facture.montant_ttc THEN
    v_nouveau_statut := 'payee';
  ELSIF v_facture.date_echeance IS NOT NULL AND v_facture.date_echeance < CURRENT_DATE THEN
    v_nouveau_statut := 'en_retard';
  ELSE
    v_nouveau_statut := 'envoyee';
  END IF;

  UPDATE factures
  SET montant_regle = v_total,
      statut = v_nouveau_statut,
      updated_at = now()
  WHERE id = p_facture_id;
END;
$$ LANGUAGE plpgsql;

CREATE OR REPLACE FUNCTION fn_trg_paiement_facture()
RETURNS TRIGGER AS $$
BEGIN
  IF TG_OP = 'DELETE' THEN
    PERFORM fn_recalculer_montant_regle_facture(OLD.facture_id);
    RETURN OLD;
  END IF;

  PERFORM fn_recalculer_montant_regle_facture(NEW.facture_id);
  IF TG_OP = 'UPDATE' AND OLD.facture_id IS DISTINCT FROM NEW.facture_id THEN
    PERFORM fn_recalculer_montant_regle_facture(OLD.facture_id);
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_paiement_facture ON paiements;
CREATE TRIGGER trg_paiement_facture
AFTER INSERT OR UPDATE OR DELETE ON paiements
FOR EACH ROW EXECUTE FUNCTION fn_trg_paiement_facture();

UPDATE factures SET montant_regle = montant_ttc WHERE statut = 'payee' AND montant_regle = 0;

-- ------------------------------------------------------------
-- 3. 🟡 UNICITÉ DE factures.numero (par type émise/reçue)
-- ------------------------------------------------------------
DO $$
BEGIN
  IF EXISTS (
    SELECT type, numero FROM factures GROUP BY type, numero HAVING COUNT(*) > 1
  ) THEN
    RAISE NOTICE 'Doublons détectés sur (type, numero) dans factures : contrainte NON appliquée. Corrige les doublons puis relance ce script.';
  ELSIF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'factures_type_numero_unique') THEN
    ALTER TABLE factures ADD CONSTRAINT factures_type_numero_unique UNIQUE (type, numero);
  END IF;
END $$;
