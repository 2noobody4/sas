-- ============================================================
-- Migration : comptes auxiliaires par tiers (401xxx / 411xxx)
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
-- ============================================================

ALTER TABLE comptes ADD COLUMN IF NOT EXISTS tiers_type text;
DO $$
BEGIN
  IF NOT EXISTS (SELECT 1 FROM pg_constraint WHERE conname = 'comptes_tiers_type_check') THEN
    ALTER TABLE comptes ADD CONSTRAINT comptes_tiers_type_check CHECK (tiers_type IN ('client', 'fournisseur'));
  END IF;
END $$;
ALTER TABLE comptes ADD COLUMN IF NOT EXISTS tiers_id uuid;

CREATE UNIQUE INDEX IF NOT EXISTS idx_comptes_tiers_unique
  ON comptes(tiers_type, tiers_id) WHERE tiers_id IS NOT NULL;

CREATE OR REPLACE FUNCTION get_or_create_compte_auxiliaire(
  p_tiers_type text,
  p_tiers_id uuid,
  p_tiers_nom text
) RETURNS uuid AS $$
DECLARE
  v_compte_id uuid;
  v_parent RECORD;
  v_next_suffixe int;
  v_new_numero text;
BEGIN
  IF p_tiers_type NOT IN ('client', 'fournisseur') THEN
    RAISE EXCEPTION 'tiers_type invalide (attendu client ou fournisseur) : %', p_tiers_type;
  END IF;
  IF p_tiers_id IS NULL THEN
    RETURN NULL;
  END IF;

  SELECT id INTO v_compte_id
  FROM comptes
  WHERE tiers_type = p_tiers_type AND tiers_id = p_tiers_id
  LIMIT 1;

  IF FOUND THEN
    RETURN v_compte_id;
  END IF;

  SELECT * INTO v_parent
  FROM comptes
  WHERE numero = (CASE WHEN p_tiers_type = 'client' THEN '411000' ELSE '401000' END)
  LIMIT 1;

  IF NOT FOUND THEN
    RAISE EXCEPTION 'Compte collectif % introuvable — initialise le plan comptable avant de créer des sous-comptes.',
      (CASE WHEN p_tiers_type = 'client' THEN '411000' ELSE '401000' END);
  END IF;

  SELECT COALESCE(MAX(CAST(RIGHT(numero, 3) AS int)), 0) + 1 INTO v_next_suffixe
  FROM comptes
  WHERE parent_id = v_parent.id
    AND numero ~ ('^' || LEFT(v_parent.numero, 3) || '[0-9]{3}$');

  IF v_next_suffixe > 999 THEN
    RAISE EXCEPTION 'Plus de 999 sous-comptes sous % — numérotation à revoir.', v_parent.numero;
  END IF;

  v_new_numero := LEFT(v_parent.numero, 3) || LPAD(v_next_suffixe::text, 3, '0');

  INSERT INTO comptes (numero, nom, type, parent_id, niveau, solde, actif, tiers_type, tiers_id)
  VALUES (v_new_numero, COALESCE(p_tiers_nom, 'Tiers'), v_parent.type, v_parent.id, v_parent.niveau + 1, 0, true, p_tiers_type, p_tiers_id)
  RETURNING id INTO v_compte_id;

  RETURN v_compte_id;
END;
$$ LANGUAGE plpgsql;

-- Note de portée : les factures déjà comptabilisées sur le compte
-- collectif ne sont pas rejouées vers un sous-compte automatiquement.
