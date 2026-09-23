/**
 * useInitPlanComptable
 * ------------------------------------------------------------
 * 🆕 Hook manquant : jusqu'ici, rien dans l'application ne créait les
 * comptes du plan comptable. `PlanComptablePage` était purement en
 * lecture seule. Or TOUTES les comptabilisations automatiques
 * (ventes, achats, factures, charges usuelles, paie, services) cherchent
 * des comptes par numéro (571000, 521000, 701000...) et échouent
 * silencieusement si ces comptes n'existent pas encore.
 *
 * Ce hook crée en une fois les comptes de base manquants (idempotent :
 * les numéros déjà présents ne sont pas dupliqués).
 */

import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './useToast';
import { PLAN_COMPTABLE_OHADA_BASE } from '../data/planComptableOhada';

export const useInitPlanComptable = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (): Promise<{ crees: number; existants: number }> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;

    const { data: existants, error: fetchError } = await supabase
      .from('comptes')
      .select('numero');
    if (fetchError) throw fetchError;

    const numerosExistants = new Set((existants || []).map((c: any) => c.numero));

    const aCreer = PLAN_COMPTABLE_OHADA_BASE.filter((c) => !numerosExistants.has(c.numero));

    if (aCreer.length === 0) {
      return { crees: 0, existants: numerosExistants.size };
    }

    const { error: insertError } = await supabase
      .from('comptes')
      .insert(
        aCreer.map((c) => ({
          numero: c.numero,
          nom: c.nom,
          type: c.type,
          niveau: c.niveau,
          solde: 0,
          actif: true,
          user_id: userId,
        }))
      );

    if (insertError) throw insertError;

    return { crees: aCreer.length, existants: numerosExistants.size };
  };

  return useMutation(mutationFn, {
    onSuccess: (result) => {
      queryClient.invalidateQueries({ queryKey: ['comptes'] });
      if (result.crees > 0) {
        success(`${result.crees} compte(s) OHADA créé(s) ✅`);
      } else {
        success('Le plan comptable est déjà à jour ✅');
      }
    },
    onError: (err: any) => {
      toastError(err.message || "Erreur lors de l'initialisation du plan comptable");
    },
  });
};
