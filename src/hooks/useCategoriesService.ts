// ============================================================
// USE CATEGORIES SERVICE - CRUD
// Version V1.1 - Compatible React 16
// Fix : syntaxe objet useMutation
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { CategorieService, CategorieServiceFormData } from '../types/services';
import { useToast } from './useToast';

export const useCategoriesService = () => {
  return useQuery<CategorieService[], Error>({
    queryKey: ['categories_service'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('categories_service')
        .select('*')
        .order('ordre', { ascending: true });
      if (error) throw error;
      return (data || []) as CategorieService[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateCategorieService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async (data: CategorieServiceFormData): Promise<CategorieService> => {
      const { data: existing } = await supabase
        .from('categories_service')
        .select('ordre')
        .order('ordre', { ascending: false })
        .limit(1);

      const nextOrder = existing && existing.length > 0 ? (existing[0].ordre || 0) + 1 : 0;

      const { data: inserted, error } = await supabase
        .from('categories_service')
        .insert([{ ...data, ordre: nextOrder, actif: data.actif !== false }])
        .select()
        .single();
      if (error) throw error;
      return inserted;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('categories_service');
      success('Catégorie créée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useUpdateCategorieService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async ({ id, data }: { id: string; data: Partial<CategorieServiceFormData> }) => {
      const { data: updated, error } = await supabase
        .from('categories_service')
        .update({ ...data, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('categories_service');
      success('Catégorie mise à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useDeleteCategorieService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { error } = await supabase.from('categories_service').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('categories_service');
      success('Catégorie supprimée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};
