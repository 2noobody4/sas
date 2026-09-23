// ============================================================
// USE REORDER HOME BLOCKS — Réordonner les blocs de la home
// Version V3 — Compatible React 16
// ============================================================

import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './useToast';

export const useReorderHomeBlocks = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (blockIds: string[]): Promise<void> => {
    // Mettre à jour l'ordre de chaque bloc
    const updates = blockIds.map((id, index) =>
      supabase
        .from('home_blocks')
        .update({ order: index, ordre: index })
        .eq('id', id)
    );

    const results = await Promise.all(updates);
    const error = results.find((r) => r.error)?.error;
    if (error) throw error;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('home_config');
      success('Ordre des blocs mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de réorganisation');
    },
  });
};
