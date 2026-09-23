import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Facture, FactureFormData } from '../types/facture';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';
import { useComptabiliserFacture } from './useComptabilisation';
import { annulerTransactionsParReference } from './useAnnulationTransaction';
import { useMagasinActif } from '../contexts/MagasinActifContext';

export const useFactures = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<Facture[], Error>({
    queryKey: ['factures', filters, magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase.from('factures').select('*').order('date_emission', { ascending: false });
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut', filters.statut);
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }
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

    // 1. Résoudre les comptes débit/crédit AVANT de créer la facture, pour
    // que factures.compte_debit_id/compte_credit_id reflète exactement les
    // comptes utilisés par l'écriture comptable (§3).
    let compteDebitId = (data as any).compte_debit_id;
    let compteCreditId = (data as any).compte_credit_id;

    const { data: comptesParDefaut } = await supabase
      .from('comptes')
      .select('id, numero')
      .in('numero', ['411000', '401000', '701000', '611000']);

    const compteClientCollectif = comptesParDefaut?.find((c: any) => c.numero === '411000');
    const compteFournisseurCollectif = comptesParDefaut?.find((c: any) => c.numero === '401000');

    if (!compteDebitId || !compteCreditId) {
      if (data.type === 'emise') {
        // Facture client : Débit Client, Crédit Vente
        const compteVente = comptesParDefaut?.find((c: any) => c.numero === '701000');
        if (compteClientCollectif) compteDebitId = compteDebitId || compteClientCollectif.id;
        if (compteVente) compteCreditId = compteCreditId || compteVente.id;
      } else {
        // Facture fournisseur : Débit Charge, Crédit Fournisseur
        const compteCharge = comptesParDefaut?.find((c: any) => c.numero === '611000');
        if (compteCharge) compteDebitId = compteDebitId || compteCharge.id;
        if (compteFournisseurCollectif) compteCreditId = compteCreditId || compteFournisseurCollectif.id;
      }
    }

    // 2. 🔧 Comptes auxiliaires par tiers : si un tiers précis est
    // sélectionné, on route l'écriture vers son sous-compte 411xxx/401xxx
    // plutôt que vers le compte collectif générique — corrige la
    // déconnexion entre le solde "je dois à X" (recalculé en sommant les
    // factures) et le grand livre. On ne remplace que si le compte est
    // encore le compte collectif par défaut : un choix manuel de
    // l'utilisateur dans le formulaire reste prioritaire.
    if ((data as any).fournisseur_client_id) {
      try {
        const tiersType = data.type === 'emise' ? 'client' : 'fournisseur';
        const { data: compteAuxId, error: auxError } = await supabase.rpc('get_or_create_compte_auxiliaire', {
          p_tiers_type: tiersType,
          p_tiers_id: (data as any).fournisseur_client_id,
          p_tiers_nom: data.fournisseur_client_nom || 'Tiers',
        });
        if (auxError) throw auxError;
        if (compteAuxId) {
          if (data.type === 'emise' && (!compteDebitId || compteDebitId === compteClientCollectif?.id)) {
            compteDebitId = compteAuxId;
          }
          if (data.type === 'recue' && (!compteCreditId || compteCreditId === compteFournisseurCollectif?.id)) {
            compteCreditId = compteAuxId;
          }
        }
      } catch (auxError) {
        console.error('[useCreateFacture] Erreur compte auxiliaire tiers:', auxError);
      }
    }

    // 3. Créer la facture avec les comptes déjà résolus
    const { data: inserted, error } = await supabase
      .from('factures')
      .insert([{
        ...data,
        compte_debit_id: compteDebitId,
        compte_credit_id: compteCreditId,
        user_id: userId,
        rappel_envoye: false,
      }])
      .select()
      .single();

    if (error) throw error;

    // 4. 🔥 COMPTABILISATION
    try {
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
    // Annuler les transactions comptables liées (contre-passation + delete)
    await annulerTransactionsParReference(id, ['facture_client', 'facture_fournisseur']);

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
  const { magasinActifId } = useMagasinActif();
  return useQuery<Facture[], Error>({
    queryKey: ['factures_a_regler', magasinActifId],
    queryFn: async () => {
      const now = new Date();
      const nextMonth = new Date(now.getFullYear(), now.getMonth() + 1, 26);
      const dateStr = nextMonth.toISOString().split('T')[0];
      let query = supabase
        .from('factures')
        .select('*')
        .eq('type', 'recue')
        .in('statut', ['envoyee', 'en_retard'])
        .lte('date_echeance', dateStr)
        .order('date_echeance', { ascending: true });
      // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
      if (magasinActifId) {
        query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
      }
      const { data, error } = await query;
      if (error) throw error;
      return data as Facture[];
    },
    staleTime: 1000 * 60 * 5,
  });
};
