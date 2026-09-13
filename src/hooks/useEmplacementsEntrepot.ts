import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { EmplacementEntrepot, EmplacementEntrepotFormData } from '../types/emplacementEntrepot';
import { useToast } from './useToast';
import { useOfflineMutation } from './useOfflineMutation';

export const useEmplacementsEntrepot = (entrepotId?: string) => {
  return useQuery<EmplacementEntrepot[], Error>({
    queryKey: ['emplacements_entrepot', entrepotId],
    queryFn: async () => {
      if (!entrepotId) return [];
      const { data, error } = await supabase.from('emplacements_entrepot').select('*').eq('entrepot_id', entrepotId).order('salle', { ascending: true }).order('etage', { ascending: true });
      if (error) throw error;
      return data as EmplacementEntrepot[];
    },
    enabled: !!entrepotId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreateEmplacementEntrepot = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: EmplacementEntrepotFormData): Promise<EmplacementEntrepot> => {
    const { data: inserted, error } = await supabase.from('emplacements_entrepot').insert([{ ...data, actif: data.actif !== undefined ? data.actif : true }]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('emplacements_entrepot'); success('Emplacement créé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/emplacements',
    'POST'
  );
};

export const useUpdateEmplacementEntrepot = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, data }: { id: string; data: Partial<EmplacementEntrepotFormData> }): Promise<EmplacementEntrepot> => {
    const { data: updated, error } = await supabase.from('emplacements_entrepot').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('emplacements_entrepot'); success('Emplacement mis à jour ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/emplacements',
    'PUT'
  );
};

export const useDeleteEmplacementEntrepot = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('emplacements_entrepot').delete().eq('id', id);
    if (error) throw error;
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('emplacements_entrepot'); success('Emplacement supprimé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/emplacements',
    'DELETE'
  );
};
