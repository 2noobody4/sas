-- ============================================================
-- Migration : écritures manquantes pour les commandes de service
-- (SYSCOHADA) — acompte / solde
-- À exécuter une seule fois dans Supabase (SQL editor)
-- ============================================================

-- 1) Compte SYSCOHADA "Clients, avances et acomptes reçus" (passif)
INSERT INTO comptes (numero, nom, type, niveau, solde, actif)
SELECT '419100', 'Clients, avances et acomptes reçus', 'passif', 1, 0, true
WHERE NOT EXISTS (SELECT 1 FROM comptes WHERE numero = '419100');

-- 2) Colonne pour tracer l'écriture de solde (distincte de l'acompte)
ALTER TABLE demandes_service
  ADD COLUMN IF NOT EXISTS transaction_solde_id uuid REFERENCES transactions_comptables(id);
