import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Magasin, MagasinFormData } from '../types/magasins';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';

export const useMagasins = () => {
  const { getData } = useDataLoader();
  return useQuery<Magasin[], Error>({
    queryKey: ['magasins'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('magasins').select('*').order('nom');
        if (error) throw error;
        return data as Magasin[];
      } catch {
        const cached = await getData<Magasin[]>('magasins');
        if (cached) return cached;
        throw new Error('Impossible de charger les magasins');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useMagasin = (id?: string) => {
  return useQuery<Magasin | null, Error>({
    queryKey: ['magasin', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('magasins').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Magasin;
    },
    enabled: !!id,
  });
};

export const useCreateMagasin = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: MagasinFormData): Promise<Magasin> => {
    if (data.est_defaut) { await supabase.from('magasins').update({ est_defaut: false }).neq('id', '00000000-0000-0000-0000-000000000000'); }
    const { data: inserted, error } = await supabase.from('magasins').insert([{ ...data, actif: data.actif !== undefined ? data.actif : true }]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('magasins'); success('Magasin créé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/magasins',
    'POST'
  );
};

export const useUpdateMagasin = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, data }: { id: string; data: Partial<MagasinFormData> }): Promise<Magasin> => {
    if (data.est_defaut) { await supabase.from('magasins').update({ est_defaut: false }).neq('id', id); }
    const { data: updated, error } = await supabase.from('magasins').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('magasins'); success('Magasin mis à jour ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/magasins',
    'PUT'
  );
};

export const useDeleteMagasin = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('magasins').delete().eq('id', id);
    if (error) throw error;
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('magasins'); success('Magasin supprimé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/magasins',
    'DELETE'
  );
};

export const useMagasinDefaut = () => {
  return useQuery<Magasin | null, Error>({
    queryKey: ['magasin_defaut'],
    queryFn: async () => {
      const { data, error } = await supabase.from('magasins').select('*').eq('est_defaut', true).maybeSingle();
      if (error) throw error;
      return data as Magasin | null;
    },
    staleTime: 1000 * 60 * 5,
  });
};
