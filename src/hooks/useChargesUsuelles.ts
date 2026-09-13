import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { ChargeUsuelle, ChargeUsuelleFormData, CHARGES_USUELLES_PAR_DEFAUT, COMPTES_CHARGES, COMPTES_CREDIT } from '../types/charge';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';

// ============================================================
// RÉCUPÉRER LES CHARGES USUELLES
// ============================================================

export const useChargesUsuelles = () => {
  const { getData } = useDataLoader();
  return useQuery<ChargeUsuelle[], Error>({
    queryKey: ['charges_usuelles'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('charges_usuelles')
          .select('*, compte_debit:compte_debit_id(*), compte_credit:compte_credit_id(*)')
          .eq('actif', true)
          .order('nom');
        if (error) throw error;
        return data as ChargeUsuelle[];
      } catch {
        const cached = await getData<ChargeUsuelle[]>('charges_usuelles');
        if (cached) return cached;
        throw new Error('Impossible de charger les charges usuelles');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

// ============================================================
// CRÉER UNE CHARGE USUELLE
// ============================================================

export const useCreateChargeUsuelle = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: ChargeUsuelleFormData): Promise<ChargeUsuelle> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('charges_usuelles')
      .insert([{
        ...data,
        actif: data.actif !== undefined ? data.actif : true,
        user_id: userId,
        tva: data.tva || false,
        taux_tva: data.taux_tva || 18,
      }])
      .select('*, compte_debit:compte_debit_id(*), compte_credit:compte_credit_id(*)')
      .single();
    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges_usuelles'] });
      success('Charge usuelle créée ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de création');
    },
  });
};

// ============================================================
// METTRE À JOUR UNE CHARGE USUELLE
// ============================================================

export const useUpdateChargeUsuelle = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<ChargeUsuelleFormData> }): Promise<ChargeUsuelle> => {
    const { data: updated, error } = await supabase
      .from('charges_usuelles')
      .update({ ...data, updated_at: new Date().toISOString() })
      .eq('id', id)
      .select('*, compte_debit:compte_debit_id(*), compte_credit:compte_credit_id(*)')
      .single();
    if (error) throw error;
    return updated;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges_usuelles'] });
      success('Charge usuelle mise à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de mise à jour');
    },
  });
};

// ============================================================
// SUPPRIMER UNE CHARGE USUELLE
// ============================================================

export const useDeleteChargeUsuelle = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('charges_usuelles').delete().eq('id', id);
    if (error) throw error;
    return id;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['charges_usuelles'] });
      success('Charge usuelle supprimée ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de suppression');
    },
  });
};

// ============================================================
// INITIALISER LES CHARGES USUELLES PAR DÉFAUT
// ============================================================

export const useInitChargesUsuelles = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (): Promise<ChargeUsuelle[]> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const inserted: ChargeUsuelle[] = [];

    // Récupérer les comptes par défaut
    const { data: comptes } = await supabase
      .from('comptes')
      .select('id, numero')
      .in('numero', [
        '641000', '521000', '431000', '441000',
        '621000', '622000', '623000', '624000',
        '625000', '626000', '627000', '671000',
        '651000', '645000', '445000', '571000',
        '401000'
      ]);

    const getCompteId = (numero: string): string | undefined => {
      return comptes?.find((c: any) => c.numero === numero)?.id;
    };

    for (const chargeDefaut of CHARGES_USUELLES_PAR_DEFAUT) {
      // Déterminer les comptes à utiliser
      const compteDebitNum = COMPTES_CHARGES[chargeDefaut.type]?.numero || '651000';
      const compteCreditNum = chargeDefaut.nom.includes('sociales') ? '431000'
        : chargeDefaut.nom.includes('Impôt') || chargeDefaut.nom.includes('TVA') ? '441000'
        : '521000';

      const compteDebitId = getCompteId(compteDebitNum);
      const compteCreditId = getCompteId(compteCreditNum);

      if (!compteDebitId || !compteCreditId) {
        console.warn(`Comptes manquants pour ${chargeDefaut.nom}`);
        continue;
      }

      const { data: insertedCharge, error } = await supabase
        .from('charges_usuelles')
        .insert([{
          ...chargeDefaut,
          compte_debit_id: compteDebitId,
          compte_credit_id: compteCreditId,
          user_id: userId,
          actif: true,
        }])
        .select()
        .single();

      if (!error && insertedCharge) {
        inserted.push(insertedCharge);
      }
    }

    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: (data) => {
      queryClient.invalidateQueries({ queryKey: ['charges_usuelles'] });
      success(`${data.length} charges usuelles initialisées ✅`);
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de l\'initialisation');
    },
  });
};
