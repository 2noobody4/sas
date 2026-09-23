import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Promotion, PromotionFormData, Negociation, NegociationFormData } from '../types/promotion';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';

export const usePromotions = (produitId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Promotion[], Error>({
    queryKey: ['promotions', produitId],
    queryFn: async () => {
      try {
        let query = supabase.from('promotions').select('*, produit:produit_id(*), tarification:tarification_id(*)').eq('actif', true).order('date_debut', { ascending: false });
        if (produitId) query = query.eq('produit_id', produitId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Promotion[];
      } catch {
        const cached = await getData<Promotion[]>('promotions');
        if (cached) return cached;
        throw new Error('Impossible de charger les promotions');
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreatePromotion = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: PromotionFormData): Promise<Promotion> => {
    const { data: inserted, error } = await supabase.from('promotions').insert([{ ...data, actif: true }]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('promotions'); queryClient.invalidateQueries('produits'); success('Promotion créée ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/promotions',
    'POST'
  );
};

export const useDeletePromotion = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('promotions').update({ actif: false }).eq('id', id);
    if (error) throw error;
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('promotions'); success('Promotion supprimée ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/promotions',
    'PATCH'
  );
};

export const useNegociations = (produitId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Negociation[], Error>({
    queryKey: ['negociations', produitId],
    queryFn: async () => {
      try {
        let query = supabase.from('negociations').select('*, produit:produit_id(*), client:client_id(*), user:user_id(*)').order('created_at', { ascending: false });
        if (produitId) query = query.eq('produit_id', produitId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Negociation[];
      } catch {
        const cached = await getData<Negociation[]>('negociations');
        if (cached) return cached;
        throw new Error('Impossible de charger les négociations');
      }
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateNegociation = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: NegociationFormData): Promise<Negociation> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase.from('negociations').insert([{ ...data, user_id: userId, statut: 'en_cours' }]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('negociations'); success('Négociation créée ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/negociations',
    'POST'
  );
};

export const useUpdateNegociation = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, statut }: { id: string; statut: string }): Promise<Negociation> => {
    const { data: updated, error } = await supabase.from('negociations').update({ statut }).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('negociations'); success('Négociation mise à jour ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/negociations',
    'PUT'
  );
};

export const useTarifications = (produitId?: string) => {
  const { getData } = useDataLoader();
  return useQuery({
    queryKey: ['tarifications', produitId],
    queryFn: async () => {
      let query = supabase.from('tarifications').select('*').order('date_debut', { ascending: false });
      if (produitId) query = query.eq('produit_id', produitId);
      const { data, error } = await query;
      if (error) throw error;
      return data;
    },
  });
};

export const useCreateTarification = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: any): Promise<any> => {
    const { data: inserted, error } = await supabase.from('tarifications').insert([data]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('tarifications'); queryClient.invalidateQueries('produits'); success('Tarification créée ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/tarifications',
    'POST'
  );
};
