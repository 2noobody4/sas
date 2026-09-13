import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Paiement, PaiementFormData } from '../types/caisse';
import { useToast } from './useToast';
import { logAction } from './useHistorique';
import { useOfflineMutation } from './useOfflineMutation';

export const usePaiements = (venteId?: string) => {
  return useQuery<Paiement[], Error>({
    queryKey: ['paiements', venteId],
    queryFn: async () => {
      let query = supabase.from('paiements').select('*').order('date_paiement', { ascending: false });
      if (venteId) query = query.eq('vente_id', venteId);
      const { data, error } = await query;
      if (error) throw error;
      return data as Paiement[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreatePaiement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ venteId, paiement }: { venteId: string; paiement: PaiementFormData }): Promise<Paiement> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase.from('paiements').insert([{ vente_id: venteId, moyen: paiement.moyen, montant: paiement.montant, reference: paiement.reference || null }]).select().single();
    if (error) throw error;
    if (userId) { try { await logAction(userId, 'caisse', 'create', 'paiement', inserted.id, null, inserted); } catch (e) {} }
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('paiements'); success('Paiement enregistré ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/paiements',
    'POST'
  );
};

export const useDeletePaiement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { data: paiement } = await supabase.from('paiements').select('*').eq('id', id).single();
    const { error } = await supabase.from('paiements').delete().eq('id', id);
    if (error) throw error;
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (userId && paiement) { try { await logAction(userId, 'caisse', 'delete', 'paiement', id, paiement, null); } catch (e) {} }
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('paiements'); success('Paiement supprimé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/paiements',
    'DELETE'
  );
};
