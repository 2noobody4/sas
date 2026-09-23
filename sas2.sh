#!/data/data/com.termux/files/usr/bin/bash
# ============================================================
# Fix point 11 — RLS sur comptes, transactions_comptables,
# saisies_comptables, charges_usuelles, fiches_paie, factures
#
# Ce script NE TOUCHE PAS ta base. Il génère 2 fichiers .sql :
#   1. sql/audit_rls_comptabilite.sql  → à coller dans le SQL
#      Editor de Supabase pour voir l'état actuel des RLS.
#   2. sql/rls_comptabilite_policies.sql → template de policies,
#      À LIRE ET ADAPTER avant de l'exécuter (rôles autorisés,
#      granularité SELECT/INSERT/UPDATE/DELETE selon tes besoins).
#
# À lancer depuis la racine du projet (là où se trouve package.json)
# ============================================================
set -e

if [ ! -f "package.json" ]; then
  echo "❌ Lance ce script depuis la racine du projet (package.json introuvable ici)."
  exit 1
fi

mkdir -p sql

echo "→ Génération de sql/audit_rls_comptabilite.sql"
cat > sql/audit_rls_comptabilite.sql << 'EOF'
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
EOF

echo "→ Génération de sql/rls_comptabilite_policies.sql (TEMPLATE — à relire avant exécution)"
cat > sql/rls_comptabilite_policies.sql << 'EOF'
-- ============================================================
-- TEMPLATE de politiques RLS — module comptabilité
-- ⚠️ NE PAS EXÉCUTER TEL QUEL SANS RELIRE.
--
-- Hypothèses reprises du code (src/hooks/useAuth.ts) :
--   - table public.users(id uuid references auth.users, role_id uuid, ...)
--   - table public.roles(id uuid, nom text, ...)
--   - rôles observés côté routing : admin, gestionnaire, comptable
--     (+ cashier, client ailleurs dans l'app)
--
-- Politique par défaut proposée ici :
--   - SELECT : ouvert à tout utilisateur authentifié, SAUF
--     fiches_paie (données de paie → restreint à admin/comptable)
--   - INSERT/UPDATE/DELETE : restreint à admin/gestionnaire/comptable
--
-- Adapte selon tes besoins réels avant d'exécuter (ex: est-ce
-- qu'un "gestionnaire" doit pouvoir modifier des fiches_paie ?
-- Est-ce qu'un "cashier" doit voir le plan comptable ?).
-- ============================================================

-- ---- Fonction utilitaire : rôle de l'utilisateur courant ----
create or replace function public.current_role_nom()
returns text
language sql
security definer
stable
as $$
  select r.nom
  from public.users u
  join public.roles r on r.id = u.role_id
  where u.id = auth.uid()
$$;

-- ============================================================
-- comptes
-- ============================================================
alter table public.comptes enable row level security;

drop policy if exists "comptes_select" on public.comptes;
create policy "comptes_select"
on public.comptes for select
to authenticated
using (true);

drop policy if exists "comptes_write" on public.comptes;
create policy "comptes_write"
on public.comptes for all
to authenticated
using (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'))
with check (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'));

-- ============================================================
-- transactions_comptables
-- ============================================================
alter table public.transactions_comptables enable row level security;

drop policy if exists "transactions_comptables_select" on public.transactions_comptables;
create policy "transactions_comptables_select"
on public.transactions_comptables for select
to authenticated
using (true);

drop policy if exists "transactions_comptables_write" on public.transactions_comptables;
create policy "transactions_comptables_write"
on public.transactions_comptables for all
to authenticated
using (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'))
with check (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'));

-- ============================================================
-- saisies_comptables
-- ============================================================
alter table public.saisies_comptables enable row level security;

drop policy if exists "saisies_comptables_select" on public.saisies_comptables;
create policy "saisies_comptables_select"
on public.saisies_comptables for select
to authenticated
using (true);

drop policy if exists "saisies_comptables_write" on public.saisies_comptables;
create policy "saisies_comptables_write"
on public.saisies_comptables for all
to authenticated
using (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'))
with check (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'));

-- ============================================================
-- charges_usuelles
-- ============================================================
alter table public.charges_usuelles enable row level security;

drop policy if exists "charges_usuelles_select" on public.charges_usuelles;
create policy "charges_usuelles_select"
on public.charges_usuelles for select
to authenticated
using (true);

drop policy if exists "charges_usuelles_write" on public.charges_usuelles;
create policy "charges_usuelles_write"
on public.charges_usuelles for all
to authenticated
using (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'))
with check (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'));

-- ============================================================
-- fiches_paie  (⚠️ données sensibles — SELECT restreint aussi)
-- ============================================================
alter table public.fiches_paie enable row level security;

drop policy if exists "fiches_paie_select" on public.fiches_paie;
create policy "fiches_paie_select"
on public.fiches_paie for select
to authenticated
using (public.current_role_nom() in ('admin', 'comptable'));

drop policy if exists "fiches_paie_write" on public.fiches_paie;
create policy "fiches_paie_write"
on public.fiches_paie for all
to authenticated
using (public.current_role_nom() in ('admin', 'comptable'))
with check (public.current_role_nom() in ('admin', 'comptable'));

-- ============================================================
-- factures
-- ============================================================
alter table public.factures enable row level security;

drop policy if exists "factures_select" on public.factures;
create policy "factures_select"
on public.factures for select
to authenticated
using (true);

drop policy if exists "factures_write" on public.factures;
create policy "factures_write"
on public.factures for all
to authenticated
using (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'))
with check (public.current_role_nom() in ('admin', 'gestionnaire', 'comptable'));
EOF

echo ""
echo "============================================================"
echo "Terminé — 2 fichiers générés dans sql/ :"
echo "  1. sql/audit_rls_comptabilite.sql"
echo "     → exécute-le en premier dans Supabase SQL Editor pour"
echo "       voir l'état actuel (RLS activé ? policies existantes ?)"
echo "  2. sql/rls_comptabilite_policies.sql"
echo "     → TEMPLATE à relire et adapter (rôles, granularité)"
echo "       avant de l'exécuter. Ne l'exécute pas les yeux fermés."
echo "============================================================"
