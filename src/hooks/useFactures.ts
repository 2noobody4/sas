import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Facture, FactureFormData } from '../types/facture';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';
import { useComptabiliserFacture } from './useComptabilisation';

export const useFactures = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  return useQuery<Facture[], Error>({
    queryKey: ['factures', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('factures').select('*').order('date_emission', { ascending: false });
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut', filters.statut);
        const { data, error } = await query;
        if (error) throw error;
        return data as Facture[];
      } catch {
        const cached = await getData<Facture[]>('factures');
        if (cached) return cached;
        throw new Error('Impossible de charger les factures');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateFacture = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const comptabiliserFacture = useComptabiliserFacture();

  const mutationFn = async (data: FactureFormData): Promise<Facture> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    // 1. Créer la facture
    const { data: inserted, error } = await supabase
      .from('factures')
      .insert([{ 
        ...data, 
        user_id: userId,
        rappel_envoye: false,
      }])
      .select()
      .single();
    
    if (error) throw error;

    // 2. 🔥 COMPTABILISATION
    try {
      let compteDebitId = (data as any).compte_debit_id;
      let compteCreditId = (data as any).compte_credit_id;

      if (!compteDebitId || !compteCreditId) {
        // Récupérer les comptes par défaut
        const { data: comptes } = await supabase
          .from('comptes')
          .select('id, numero')
          .in('numero', ['411000', '401000', '701000']);

        if (data.type === 'emise') {
          // Facture client : Débit Client, Crédit Vente
          const compteClient = comptes?.find((c: any) => c.numero === '411000');
          const compteVente = comptes?.find((c: any) => c.numero === '701000');
          if (compteClient) compteDebitId = compteClient.id;
          if (compteVente) compteCreditId = compteVente.id;
        } else {
          // Facture fournisseur : Débit Charge, Crédit Fournisseur
          const compteCharge = comptes?.find((c: any) => c.numero === '611000');
          const compteFournisseur = comptes?.find((c: any) => c.numero === '401000');
          if (compteCharge) compteDebitId = compteCharge.id;
          if (compteFournisseur) compteCreditId = compteFournisseur.id;
        }
      }

      if (compteDebitId && compteCreditId) {
        await comptabiliserFacture.mutateAsync({
          factureId: inserted.id,
          montant: data.montant_ttc,
          compteDebitId,
          compteCreditId,
          type: data.type,
          libelle: `N°${data.numero} - ${data.fournisseur_client_nom || 'Sans bénéficiaire'}`,
          userId: userId,
        });
      }
    } catch (comptaError) {
      console.error('[useCreateFacture] Erreur comptabilisation:', comptaError);
    }

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['factures'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Facture créée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de création');
      },
    },
    '/api/factures',
    'POST'
  );
};

export const useUpdateFacture = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<FactureFormData> }): Promise<Facture> => {
    const { data: updated, error } = await supabase
      .from('factures')
      .update(data)
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['factures'] });
        success('Facture mise à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de mise à jour');
      },
    },
    '/api/factures',
    'PUT'
  );
};

export const useDeleteFacture = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    // Annuler la transaction comptable
    await supabase
      .from('transactions_comptables')
      .update({ annulee: true, annulee_le: new Date().toISOString() })
      .eq('reference', id)
      .in('type', ['facture_client', 'facture_fournisseur']);

    const { error } = await supabase.from('factures').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['factures'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Facture supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de suppression');
      },
    },
    '/api/factures',
    'DELETE'
  );
};

export const useFacturesARegler = () => {
  return useQuery<Facture[], Error>({
    queryKey: ['factures_a_regler'],
    queryFn: async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 26);
      const dateStr = nextMonth.toISOString().split('T')[0];
      const { data, error } = await supabase
        .from('factures')
        .select('*')
        .eq('type', 'recue')
        .in('statut', ['envoyee', 'en_retard'])
        .lte('date_echeance', dateStr)
        .order('date_echeance', { ascending: true });
      if (error) throw error;
      return data as Facture[];
    },
    staleTime: 1000 * 60 * 5,
  });
};
