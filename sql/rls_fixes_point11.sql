-- ============================================================
-- RLS — module comptabilité + durcissement employes
-- ⚠️ À RELIRE avant exécution (rôles autorisés à adapter).
--
-- Confirmé par audit du schéma :
--   - comptes, transactions_comptables, saisies_comptables,
--     charges_usuelles, fiches_paie, factures → 0 policy RLS.
--   - employes → RLS activé mais 5 policies en `true`/`true`
--     (accès total à TOUT utilisateur authentifié, salaire inclus).
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

-- ============================================================
-- employes — durcissement (⚠️ contient salaire_base)
-- Retire les 5 policies "true"/"true" et les remplace par :
--   - lecture : admin/gestionnaire/comptable, OU l'employé lui-même
--   - écriture : admin/gestionnaire uniquement
-- ============================================================
drop policy if exists "Allow all for authenticated users" on public.employes;
drop policy if exists "Allow delete for authenticated users" on public.employes;
drop policy if exists "Allow insert for authenticated users" on public.employes;
drop policy if exists "Allow select for authenticated users" on public.employes;
drop policy if exists "Allow update for authenticated users" on public.employes;

alter table public.employes enable row level security;

create policy "employes_select"
on public.employes for select
to authenticated
using (
  public.current_role_nom() in ('admin', 'gestionnaire', 'comptable')
  or auth.uid() = user_id
);

create policy "employes_write"
on public.employes for all
to authenticated
using (public.current_role_nom() in ('admin', 'gestionnaire'))
with check (public.current_role_nom() in ('admin', 'gestionnaire'));
