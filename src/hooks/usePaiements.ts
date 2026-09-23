import { useQuery, useQueryClient } from 'react-query';
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

// 🔧 Historique des règlements d'une facture (paiements partiels inclus) —
// corrige l'absence totale de suivi des paiements sur les factures :
// avant, seul un champ `statut` texte libre existait, sans historique ni
// montant réglé / restant dû.
export const usePaiementsFacture = (factureId?: string) => {
  return useQuery<Paiement[], Error>({
    queryKey: ['paiements_facture', factureId],
    queryFn: async () => {
      if (!factureId) return [];
      const { data, error } = await supabase
        .from('paiements')
        .select('*')
        .eq('facture_id', factureId)
        .order('date_paiement', { ascending: false });
      if (error) throw error;
      return data as Paiement[];
    },
    enabled: !!factureId,
    staleTime: 1000 * 60 * 2,
  });
};

export const useCreatePaiement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  // 🔧 venteId OU factureId (jamais les deux). Le contrôle serveur
  // (contrainte CHECK paiements_source_unique) reste la garantie ultime ;
  // ceci ne fait que donner un message d'erreur plus clair côté client.
  const mutationFn = async ({
    venteId,
    factureId,
    paiement,
  }: {
    venteId?: string;
    factureId?: string;
    paiement: PaiementFormData;
  }): Promise<Paiement> => {
    if (!venteId && !factureId) throw new Error('Un paiement doit être rattaché à une vente ou à une facture');
    if (venteId && factureId) throw new Error('Un paiement ne peut pas être rattaché à la fois à une vente et à une facture');

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('paiements')
      .insert([{
        vente_id: venteId || null,
        facture_id: factureId || null,
        moyen: paiement.moyen,
        montant: paiement.montant,
        reference: paiement.reference || null,
      }])
      .select()
      .single();
    if (error) throw error;
    if (userId) {
      try {
        await logAction(userId, factureId ? 'comptabilite' : 'caisse', 'create', 'paiement', inserted.id, null, inserted);
      } catch (e) {}
    }
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: (_data, variables) => {
        queryClient.invalidateQueries('paiements');
        if (variables.factureId) {
          // Le trigger SQL a déjà recalculé montant_regle/statut côté
          // serveur ; on invalide juste le cache client pour le refléter.
          queryClient.invalidateQueries({ queryKey: ['paiements_facture', variables.factureId] });
          queryClient.invalidateQueries({ queryKey: ['factures'] });
        }
        success('Paiement enregistré ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
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
    if (userId && paiement) {
      try {
        await logAction(userId, paiement.facture_id ? 'comptabilite' : 'caisse', 'delete', 'paiement', id, paiement, null);
      } catch (e) {}
    }
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('paiements');
        queryClient.invalidateQueries({ queryKey: ['paiements_facture'] });
        queryClient.invalidateQueries({ queryKey: ['factures'] });
        success('Paiement supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    },
    '/api/paiements',
    'DELETE'
  );
};
