/**
 * useFournisseurs – Hooks pour la gestion des fournisseurs
 * Compatible React 16.14
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Fournisseur } from '../types/stock';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';

export const useFournisseurs = () => {
  const { getData } = useDataLoader();
  return useQuery<Fournisseur[], Error>({
    queryKey: ['fournisseurs'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('fournisseurs').select('*').order('nom');
        if (error) throw error;
        return data as Fournisseur[];
      } catch {
        const cached = await getData<Fournisseur[]>('fournisseurs');
        if (cached) return cached;
        throw new Error('Impossible de charger les fournisseurs');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateFournisseur = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: Partial<Fournisseur>): Promise<Fournisseur> => {
    const { data: inserted, error } = await supabase
      .from('fournisseurs')
      .insert([{ ...data, actif: true }])
      .select()
      .single();
    if (error) throw error;
    return inserted;
  };
  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('fournisseurs');
      success('Fournisseur créé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de création');
    },
  });
};

export const useUpdateFournisseur = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, data }: { id: string; data: Partial<Fournisseur> }): Promise<Fournisseur> => {
    const { data: updated, error } = await supabase
      .from('fournisseurs')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  };
  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('fournisseurs');
      success('Fournisseur mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de mise à jour');
    },
  });
};

export const useDeleteFournisseur = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('fournisseurs').update({ actif: false }).eq('id', id);
    if (error) throw error;
    return id;
  };
  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('fournisseurs');
      success('Fournisseur supprimé ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de suppression');
    },
  });
};
