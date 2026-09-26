-- ============================================================
-- Migration : table `commandes` (boutique en ligne)
-- ------------------------------------------------------------
-- Corrige l'erreur :
--   "Could not find the table 'public.commandes' in the schema cache"
-- → la table n'existe pas encore dans la base (ou le cache
--   PostgREST n'a pas été rechargé après sa création).
--
-- Colonnes alignées sur src/hooks/useBoutique.ts et
-- src/types/boutique.ts (Commande / CommandeItem).
--
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
-- ============================================================

-- ------------------------------------------------------------
-- 1. TABLE commandes
-- ------------------------------------------------------------
CREATE TABLE IF NOT EXISTS public.commandes (
  id                     uuid PRIMARY KEY DEFAULT gen_random_uuid(),
  client_id              uuid REFERENCES public.clients(id) ON DELETE SET NULL,
  client_nom             text,
  client_email           text,
  client_telephone       text,
  client_adresse         text,
  items                  jsonb NOT NULL DEFAULT '[]'::jsonb,
  montant_total          numeric NOT NULL DEFAULT 0,
  frais_livraison        numeric NOT NULL DEFAULT 0,
  statut                 text NOT NULL DEFAULT 'en_attente'
                           CHECK (statut IN ('brouillon', 'en_attente', 'payee', 'preparation', 'expediee', 'livree', 'annulee')),
  date_commande          timestamptz NOT NULL DEFAULT now(),
  date_livraison_prevue  timestamptz,
  mode_paiement          text,
  reference_paiement     text,
  notes                  text,
  user_id                uuid NOT NULL REFERENCES public.users(id) ON DELETE CASCADE,
  created_at             timestamptz NOT NULL DEFAULT now(),
  updated_at             timestamptz NOT NULL DEFAULT now()
);

CREATE INDEX IF NOT EXISTS idx_commandes_user_id       ON public.commandes(user_id);
CREATE INDEX IF NOT EXISTS idx_commandes_client_id      ON public.commandes(client_id);
CREATE INDEX IF NOT EXISTS idx_commandes_statut         ON public.commandes(statut);
CREATE INDEX IF NOT EXISTS idx_commandes_date_commande  ON public.commandes(date_commande);

-- ------------------------------------------------------------
-- 2. updated_at automatique
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.fn_commandes_set_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at := now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_commandes_set_updated_at ON public.commandes;
CREATE TRIGGER trg_commandes_set_updated_at
BEFORE UPDATE ON public.commandes
FOR EACH ROW EXECUTE FUNCTION public.fn_commandes_set_updated_at();

-- ------------------------------------------------------------
-- 3. Fonction utilitaire rôle courant (créée ici si absente —
--    déjà utilisée par d'autres migrations du projet)
-- ------------------------------------------------------------
CREATE OR REPLACE FUNCTION public.current_role_nom()
RETURNS text
LANGUAGE sql
SECURITY DEFINER
STABLE
AS $$
  SELECT r.nom
  FROM public.users u
  JOIN public.roles r ON r.id = u.role_id
  WHERE u.id = auth.uid()
$$;

-- ------------------------------------------------------------
-- 4. RLS
--    - un client authentifié voit / crée / modifie SES commandes
--    - admin/gestionnaire/cashier voient et gèrent tout
-- ------------------------------------------------------------
ALTER TABLE public.commandes ENABLE ROW LEVEL SECURITY;

DROP POLICY IF EXISTS "commandes_select" ON public.commandes;
CREATE POLICY "commandes_select"
ON public.commandes FOR SELECT
TO authenticated
USING (
  user_id = auth.uid()
  OR public.current_role_nom() IN ('admin', 'gestionnaire', 'cashier')
);

DROP POLICY IF EXISTS "commandes_insert" ON public.commandes;
CREATE POLICY "commandes_insert"
ON public.commandes FOR INSERT
TO authenticated
WITH CHECK (
  user_id = auth.uid()
  OR public.current_role_nom() IN ('admin', 'gestionnaire', 'cashier')
);

DROP POLICY IF EXISTS "commandes_update" ON public.commandes;
CREATE POLICY "commandes_update"
ON public.commandes FOR UPDATE
TO authenticated
USING (
  user_id = auth.uid()
  OR public.current_role_nom() IN ('admin', 'gestionnaire', 'cashier')
)
WITH CHECK (
  user_id = auth.uid()
  OR public.current_role_nom() IN ('admin', 'gestionnaire', 'cashier')
);

DROP POLICY IF EXISTS "commandes_delete" ON public.commandes;
CREATE POLICY "commandes_delete"
ON public.commandes FOR DELETE
TO authenticated
USING (
  public.current_role_nom() IN ('admin', 'gestionnaire')
);

-- ------------------------------------------------------------
-- 5. Recharger le cache de schéma PostgREST
--    (indispensable : c'est ce qui déclenche l'erreur
--    "Could not find the table ... in the schema cache")
-- ------------------------------------------------------------
NOTIFY pgrst, 'reload schema';

-- ============================================================
-- FIN — vérifie ensuite dans Supabase que :
--  - public.clients(id) et public.users(id) existent bien
--  - public.roles contient les rôles admin/gestionnaire/cashier/client
--  - Settings → API → "Reload schema" a bien été pris en compte
--    (le NOTIFY ci-dessus le fait automatiquement dans la plupart
--    des cas ; sinon, clique sur ce bouton dans le dashboard Supabase)
-- ============================================================
