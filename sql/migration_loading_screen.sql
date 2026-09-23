-- Migration : ajout de la colonne loading_screen_url a la table config
-- Permet de choisir une image / GIF / video pour l'ecran de chargement initial.
-- A executer dans le SQL editor de Supabase.

ALTER TABLE config
  ADD COLUMN IF NOT EXISTS loading_screen_url text DEFAULT '';

-- Optionnel : creer le bucket de stockage dedie si vous utilisez le Storage
-- Supabase (sinon, un bucket "loading-screens" peut aussi etre cree manuellement
-- depuis l'onglet Storage du tableau de bord Supabase, en public).
insert into storage.buckets (id, name, public)
values ('loading-screens', 'loading-screens', true)
on conflict (id) do nothing;
