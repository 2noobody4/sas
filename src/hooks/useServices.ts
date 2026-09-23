// ============================================================
// USE SERVICES - Hook CRUD V9
// Version V9 — Robustesse : pas de jointure, filtres tolérants
// ------------------------------------------------------------
// - Charge les services SANS jointures (évite dépendance FK)
// - Enrichit côté client avec catégories chargées à part
// - Tolère disponible = null comme "visible"
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Service, ServiceFormData, ServiceFiltres, ServiceStats } from '../types/services';
import { AttributService } from '../types/attributsService';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';

// ============================================================
// Helpers
// ============================================================

function serializeFiltres(filtres?: ServiceFiltres): string {
  if (!filtres) return '{}';
  return JSON.stringify({
    categorie_id: filtres.categorie_id ?? null,
    categorie_service_id: filtres.categorie_service_id ?? null,
    disponible: filtres.disponible ?? null,
    search: filtres.search ?? null,
  });
}

// ✅ Charge les catégories séparément (1 seule fois, cache 5 min)
async function loadCategoriesMaps() {
  const [catsRes, catsServiceRes] = await Promise.all([
    supabase.from('categories').select('id, nom'),
    supabase.from('categories_service').select('id, nom, couleur'),
  ]);

  const catsMap = new Map<string, { id: string; nom: string }>();
  (catsRes.data || []).forEach((c: any) => catsMap.set(c.id, { id: c.id, nom: c.nom }));

  const catsServiceMap = new Map<string, { id: string; nom: string; couleur?: string }>();
  (catsServiceRes.data || []).forEach((c: any) =>
    catsServiceMap.set(c.id, { id: c.id, nom: c.nom, couleur: c.couleur })
  );

  return { catsMap, catsServiceMap };
}

// ✅ Enrichit les services avec les catégories (côté client)
function enrichServices(rawServices: any[], catsMap: Map<string, any>, catsServiceMap: Map<string, any>): Service[] {
  return rawServices.map((s: any) => ({
    ...s,
    categorie: s.categorie_id ? catsMap.get(s.categorie_id) || null : null,
    categorie_service: s.categorie_service_id ? catsServiceMap.get(s.categorie_service_id) || null : null,
  })) as Service[];
}

// ============================================================
// useServices
// ============================================================
export const useServices = (filtres?: ServiceFiltres) => {
  const { getData } = useDataLoader();
  const filtresKey = serializeFiltres(filtres);

  return useQuery<Service[], Error>({
    queryKey: ['services', filtresKey],
    queryFn: async () => {
      try {
        // 1. Requête simple SANS jointures
        let query = supabase
          .from('services')
          .select('*')
          .order('nom');

        if (filtres?.categorie_id) {
          query = query.eq('categorie_id', filtres.categorie_id);
        }
        if (filtres?.categorie_service_id) {
          query = query.eq('categorie_service_id', filtres.categorie_service_id);
        }

        // ✅ Tolérant sur `disponible` :
        //    - filtre = true  → disponible = true OU disponible IS NULL
        //    - filtre = false → disponible = false
        if (filtres?.disponible === true) {
          query = query.or('disponible.eq.true,disponible.is.null');
        } else if (filtres?.disponible === false) {
          query = query.eq('disponible', false);
        }

        if (filtres?.search) {
          query = query.ilike('nom', `%${filtres.search}%`);
        }

        const { data, error } = await query;
        if (error) {
          console.error('[useServices] Erreur Supabase:', error);
          throw error;
        }

        // 2. Charger catégories (parallèle, cache séparé)
        const { catsMap, catsServiceMap } = await loadCategoriesMaps();

        // 3. Enrichir côté client
        return enrichServices(data || [], catsMap, catsServiceMap);
      } catch (err: any) {
        console.warn('[useServices] Fallback cache:', err?.message);
        const cached = await getData<Service[]>('services');
        if (cached) return cached;
        // ✅ Retourner un tableau vide au lieu de throw (évite page blanche)
        return [];
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

// ============================================================
// useService — Version optimisée (1 requête + enrichissement)
// ============================================================
export const useService = (id?: string) => {
  const queryClient = useQueryClient();

  return useQuery<Service | null, Error>({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) return null;

      // 1. Requête simple
      const { data, error } = await supabase
        .from('services')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;

      // 2. Enrichir avec catégories
      const { catsMap, catsServiceMap } = await loadCategoriesMaps();
      const [enriched] = enrichServices([data], catsMap, catsServiceMap);
      const service = enriched;

      // 3. Charger les attributs (cache partagé)
      let allAttributs: AttributService[] = [];
      try {
        allAttributs = await queryClient.fetchQuery<AttributService[]>(
          ['attributs_service'],
          async () => {
            const { data: attrs, error: attrsError } = await supabase
              .from('attributs_service')
              .select('*')
              .eq('actif', true)
              .order('ordre', { ascending: true });
            if (attrsError) throw attrsError;
            return (attrs || []) as AttributService[];
          },
          { staleTime: 1000 * 60 * 5 }
        );
      } catch (err) {
        console.warn('[useService] Chargement attributs échoué:', err);
        allAttributs = [];
      }

      // 4. Filtrer les attributs du service
      const infos = Array.isArray(service.informations_requises)
        ? service.informations_requises
        : (typeof service.informations_requises === 'string'
            ? JSON.parse(service.informations_requises || '[]')
            : []);

      service.attributs = (allAttributs || [])
        .filter((a) => infos.includes(a.id))
        .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));

      return service;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
    retry: false,
  });
};

// ============================================================
// Mutations (inchangées)
// ============================================================
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async (data: ServiceFormData): Promise<Service> => {
      const imagesArr = (data.images && data.images.length > 0)
        ? data.images
        : (data.image_url ? [data.image_url] : []);

      const { data: inserted, error } = await supabase
        .from('services')
        .insert([{
          nom: data.nom,
          disponible: data.disponible ?? true,
          description: data.description,
          prix: data.prix,
          prix_horaire: data.prix_horaire || 0,
          duree_estimee_heures: data.duree_estimee_heures || 1,
          mode_paiement: data.mode_paiement || 'forfait',
          informations_requises: data.informations_requises || [],
          image_url: imagesArr[0] || null,
          images: imagesArr,
          categorie_id: data.categorie_id || null,
          categorie_service_id: data.categorie_service_id || null,
          duree: data.duree || null,
        }])
        .select()
        .single();
      if (error) throw error;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      success('Service créé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la création');
    },
  });
};

export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<ServiceFormData> }): Promise<Service> => {
      const updates: any = { updated_at: new Date().toISOString() };
      if (data.nom !== undefined) updates.nom = data.nom;
      if (data.disponible !== undefined) updates.disponible = data.disponible;
      if (data.description !== undefined) updates.description = data.description;
      if (data.prix !== undefined) updates.prix = data.prix;
      if (data.prix_horaire !== undefined) updates.prix_horaire = data.prix_horaire;
      if (data.duree_estimee_heures !== undefined) updates.duree_estimee_heures = data.duree_estimee_heures;
      if (data.mode_paiement !== undefined) updates.mode_paiement = data.mode_paiement;
      if (data.informations_requises !== undefined) updates.informations_requises = data.informations_requises;
      if (data.categorie_id !== undefined) updates.categorie_id = data.categorie_id;
      if (data.categorie_service_id !== undefined) updates.categorie_service_id = data.categorie_service_id;
      if (data.duree !== undefined) updates.duree = data.duree;

      if (data.images !== undefined) {
        updates.images = data.images;
        updates.image_url = data.images[0] || null;
      } else if (data.image_url !== undefined) {
        updates.image_url = data.image_url;
        updates.images = data.image_url ? [data.image_url] : [];
      }

      const { data: updated, error } = await supabase
        .from('services')
        .update(updates)
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      queryClient.invalidateQueries(['service']);
      success('Service mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la mise à jour');
    },
  });
};

export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError, info } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { data: demandes, error: checkError } = await supabase
        .from('demandes_service')
        .select('id, statut')
        .eq('service_id', id)
        .in('statut', ['en_attente', 'confirmee', 'en_cours']);

      if (checkError) {
        console.warn('[useDeleteService] Check demandes échoué:', checkError);
      }

      const nbDemandesActives = demandes?.length || 0;

      const { error } = await supabase
        .from('services')
        .update({
          disponible: false,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return String(nbDemandesActives);
    },
    onSuccess: (nbDemandesActives) => {
      queryClient.invalidateQueries('services');
      queryClient.invalidateQueries(['service']);

      const count = parseInt(nbDemandesActives, 10) || 0;
      if (count > 0) {
        info(`Service désactivé. ⚠️ ${count} demande(s) active(s) y sont encore liées.`);
      } else {
        success('Service désactivé ✅');
      }
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la désactivation');
    },
  });
};

export const useServiceStats = () => {
  return useQuery<ServiceStats, Error>({
    queryKey: ['service_stats'],
    queryFn: async () => {
      const { data: services, error } = await supabase.from('services').select('disponible, prix');
      if (error) throw error;
      const stats: ServiceStats = {
        total: services.length,
        disponibles: services.filter((s: any) => s.disponible).length,
        indisponibles: services.filter((s: any) => !s.disponible).length,
        prix_moyen: 0,
        prix_min: 0,
        prix_max: 0,
      };
      if (services.length > 0) {
        const prix = services.map((s: any) => s.prix);
        stats.prix_moyen = prix.reduce((a: number, b: number) => a + b, 0) / prix.length;
        stats.prix_min = Math.min(...prix);
        stats.prix_max = Math.max(...prix);
      }
      return stats;
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================
// useToggleServiceDisponible — Toggle rapide disponible/non dispo
// Version V1 — Optimisé (une seule requête UPDATE)
// ============================================================
export const useToggleServiceDisponible = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async ({ id, disponible, nom }: { id: string; disponible: boolean; nom?: string }): Promise<{ id: string; disponible: boolean }> => {
      const { error } = await supabase
        .from('services')
        .update({
          disponible,
          updated_at: new Date().toISOString(),
        })
        .eq('id', id);

      if (error) throw error;
      return { id, disponible };
    },
    onSuccess: ({ disponible, id }) => {
      // Invalider toutes les clés 'services' et le détail
      queryClient.invalidateQueries('services');
      queryClient.invalidateQueries(['service', id]);

      success(disponible ? 'Service activé ✅' : 'Service désactivé ⏸️');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors du changement de statut');
    },
  });
};
