// ============================================================
// USE ATTRIBUTS SERVICE - Hook CRUD
// Version V3 - Compatible React 16
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { AttributService, AttributServiceFormData } from '../types/attributsService';
import { useToast } from './useToast';

// ============================================================
// RÉCUPÉRER TOUS LES ATTRIBUTS
// ============================================================
export const useAttributsService = () => {
  return useQuery<AttributService[], Error>({
    queryKey: ['attributs_service'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('attributs_service')
        .select('*')
        .eq('actif', true)
        .order('ordre', { ascending: true });
      if (error) throw error;
      return data as AttributService[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================
// CRÉER UN ATTRIBUT
// ============================================================
export const useCreateAttributService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: AttributServiceFormData): Promise<AttributService> => {
    // Récupérer le dernier ordre
    const { data: existing } = await supabase
      .from('attributs_service')
      .select('ordre')
      .order('ordre', { ascending: false })
      .limit(1);

    const nextOrder = (existing && existing.length > 0) ? (existing[0].ordre || 0) + 1 : 0;

    const { data: inserted, error } = await supabase
      .from('attributs_service')
      .insert([{ 
        ...data, 
        ordre: nextOrder,
        actif: true 
      }])
      .select()
      .single();
    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('attributs_service');
      success('Attribut créé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la création');
    },
  });
};

// ============================================================
// METTRE À JOUR UN ATTRIBUT
// ============================================================
export const useUpdateAttributService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ 
    id, 
    data 
  }: { 
    id: string; 
    data: Partial<AttributServiceFormData> 
  }): Promise<AttributService> => {
    const { data: updated, error } = await supabase
      .from('attributs_service')
      .update({ 
        ...data,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('attributs_service');
      success('Attribut mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la mise à jour');
    },
  });
};

// ============================================================
// SUPPRIMER UN ATTRIBUT (soft delete)
// ============================================================
export const useDeleteAttributService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('attributs_service')
      .update({ actif: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return id;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('attributs_service');
      success('Attribut supprimé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la suppression');
    },
  });
};

// ============================================================
// RÉORDONNER LES ATTRIBUTS
// ============================================================
export const useReorderAttributsService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (ids: string[]): Promise<void> => {
    for (let i = 0; i < ids.length; i++) {
      const { error } = await supabase
        .from('attributs_service')
        .update({ ordre: i })
        .eq('id', ids[i]);
      if (error) throw error;
    }
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('attributs_service');
      success('Ordre mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors du réordonnancement');
    },
  });
};
