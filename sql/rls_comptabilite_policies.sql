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
