-- ============================================================
-- AUDIT RLS — module comptabilité
-- À coller dans Supabase → SQL Editor et exécuter.
-- Objectif : voir quelles tables ont RLS activé et quelles
-- policies existent déjà, avant de toucher à quoi que ce soit.
-- ============================================================

-- 1) RLS activé/forcé par table
select
  c.relname        as table_name,
  c.relrowsecurity as rls_enabled,
  c.relforcerowsecurity as rls_forced
from pg_class c
join pg_namespace n on n.oid = c.relnamespace
where n.nspname = 'public'
  and c.relname in (
    'comptes',
    'transactions_comptables',
    'saisies_comptables',
    'charges_usuelles',
    'fiches_paie',
    'factures'
  )
order by c.relname;

-- 2) Policies existantes (vide = aucune policy définie)
select
  tablename,
  policyname,
  cmd        as commande,
  roles,
  qual       as using_clause,
  with_check
from pg_policies
where schemaname = 'public'
  and tablename in (
    'comptes',
    'transactions_comptables',
    'saisies_comptables',
    'charges_usuelles',
    'fiches_paie',
    'factures'
  )
order by tablename, policyname;
