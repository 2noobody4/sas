// ============================================================
// USE SERVICES - Hook CRUD
// Version V3 - Compatible React 16
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Service, ServiceFormData, ServiceFiltres, ServiceStats } from '../types/services';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';

// ============================================================
// RÉCUPÉRER TOUS LES SERVICES
// ============================================================
export const useServices = (filtres?: ServiceFiltres) => {
  const { getData } = useDataLoader();

  return useQuery<Service[], Error>({
    queryKey: ['services', filtres],
    queryFn: async () => {
      try {
        let query = supabase
          .from('services')
          .select('*, categorie:categories(id, nom)')
          .order('nom');

        if (filtres?.categorie_id) {
          query = query.eq('categorie_id', filtres.categorie_id);
        }
        if (filtres?.disponible !== undefined) {
          query = query.eq('disponible', filtres.disponible);
        }
        if (filtres?.search) {
          query = query.ilike('nom', `%${filtres.search}%`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Service[];
      } catch {
        const cached = await getData<Service[]>('services');
        if (cached) return cached;
        throw new Error('Impossible de charger les services');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

// ============================================================
// RÉCUPÉRER UN SERVICE PAR ID
// ============================================================
export const useService = (id?: string) => {
  return useQuery<Service | null, Error>({
    queryKey: ['service', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('services')
        .select('*, categorie:categories(id, nom)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Service;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================
// CRÉER UN SERVICE
// ============================================================
export const useCreateService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: ServiceFormData): Promise<Service> => {
    const { data: inserted, error } = await supabase
      .from('services')
      .insert([{
        nom: data.nom,
        disponible: data.disponible,
        descriptif: data.descriptif,
        prix: data.prix,
        informations_requises: data.informations_requises || [],
        image_url: data.image_url || null,
        categorie_id: data.categorie_id || null,
        duree: data.duree || null,
      }])
      .select()
      .single();
    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      success('Service créé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la création');
    },
  });
};

// ============================================================
// METTRE À JOUR UN SERVICE
// ============================================================
export const useUpdateService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ 
    id, 
    data 
  }: { 
    id: string; 
    data: Partial<ServiceFormData> 
  }): Promise<Service> => {
    const { data: updated, error } = await supabase
      .from('services')
      .update({
        nom: data.nom,
        disponible: data.disponible,
        descriptif: data.descriptif,
        prix: data.prix,
        informations_requises: data.informations_requises || [],
        image_url: data.image_url || null,
        categorie_id: data.categorie_id || null,
        duree: data.duree || null,
        updated_at: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  };

  return useMutation(mutationFn, {
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

// ============================================================
// SUPPRIMER UN SERVICE
// ============================================================
export const useDeleteService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('services')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('services');
      success('Service supprimé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la suppression');
    },
  });
};

// ============================================================
// STATISTIQUES DES SERVICES
// ============================================================
export const useServiceStats = () => {
  return useQuery<ServiceStats, Error>({
    queryKey: ['service_stats'],
    queryFn: async () => {
      const { data: services, error } = await supabase
        .from('services')
        .select('disponible, prix');
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
