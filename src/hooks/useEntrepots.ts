import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Entrepot, EntrepotFormData, TransfertEntrepot, TransfertFormData } from '../types/entrepot';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';

export const useEntrepots = (magasinId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Entrepot[], Error>({
    queryKey: ['entrepots', magasinId],
    queryFn: async () => {
      try {
        let query = supabase.from('entrepots').select('*').order('nom');
        if (magasinId) query = query.eq('magasin_id', magasinId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Entrepot[];
      } catch {
        const cached = await getData<Entrepot[]>('entrepots');
        if (cached) return magasinId ? cached.filter((e: any) => e.magasin_id === magasinId) : cached;
        throw new Error('Impossible de charger les entrepôts');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useEntrepot = (id?: string) => {
  return useQuery<Entrepot | null, Error>({
    queryKey: ['entrepot', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('entrepots').select('*').eq('id', id).single();
      if (error) throw error;
      return data as Entrepot;
    },
    enabled: !!id,
  });
};

export const useCreateEntrepot = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: EntrepotFormData): Promise<Entrepot> => {
    const { data: inserted, error } = await supabase.from('entrepots').insert([{ ...data, actif: data.actif !== undefined ? data.actif : true }]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('entrepots'); success('Entrepôt créé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/entrepots',
    'POST'
  );
};

export const useUpdateEntrepot = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, data }: { id: string; data: Partial<EntrepotFormData> }): Promise<Entrepot> => {
    const { data: updated, error } = await supabase.from('entrepots').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('entrepots'); success('Entrepôt mis à jour ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/entrepots',
    'PUT'
  );
};

export const useDeleteEntrepot = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('entrepots').delete().eq('id', id);
    if (error) throw error;
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('entrepots'); success('Entrepôt supprimé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/entrepots',
    'DELETE'
  );
};

export const useTransferts = (produitId?: string) => {
  return useQuery<TransfertEntrepot[], Error>({
    queryKey: ['transferts', produitId],
    queryFn: async () => {
      let query = supabase.from('transferts_entrepot').select('*, produit:produits(*), origine:origine_entrepot_id(*), destination:destination_entrepot_id(*)').order('date_transfert', { ascending: false });
      if (produitId) query = query.eq('produit_id', produitId);
      const { data, error } = await query;
      if (error) throw error;
      return data as TransfertEntrepot[];
    },
    staleTime: 1000 * 60 * 2,
  });
};
