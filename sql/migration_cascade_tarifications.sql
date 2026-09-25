-- ============================================================
-- Migration : ON DELETE CASCADE sur tarifications_produit_id_fkey
-- À exécuter dans Supabase → SQL Editor (idempotent, relançable).
--
-- CONTEXTE :
--   La suppression définitive d'un produit (useSupprimerProduit,
--   src/hooks/useProduits.ts) supprime déjà les lignes liées dans
--   "tarifications" côté application avant de supprimer le produit.
--   Cette migration ajoute la même garantie au niveau de la base :
--   si un produit est supprimé par un autre chemin (SQL Editor,
--   script, autre client), les tarifications liées sont supprimées
--   automatiquement au lieu de bloquer la suppression avec :
--     "update or delete on table "produits" violates foreign key
--      constraint "tarifications_produit_id_fkey" on table
--      "tarifications""
-- ============================================================

ALTER TABLE tarifications
  DROP CONSTRAINT IF EXISTS tarifications_produit_id_fkey;

ALTER TABLE tarifications
  ADD CONSTRAINT tarifications_produit_id_fkey
  FOREIGN KEY (produit_id) REFERENCES produits(id) ON DELETE CASCADE;
