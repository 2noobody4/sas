// ============================================================
// USE USER MODULES — Gestion des modules assignés
// Version V3 — Compatible React 16
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './useToast';

export interface UserModule {
  id: string;
  user_id: string;
  module_id: string;
  actif: boolean;
  created_at?: string;
  created_by?: string;
}

// ============================================================
// RÉCUPÉRER LES MODULES D'UN UTILISATEUR
// ============================================================
export const useUserModules = (userId?: string) => {
  return useQuery<string[], Error>({
    queryKey: ['user_modules', userId],
    queryFn: async () => {
      if (!userId) return [];
      const { data, error } = await supabase
        .from('user_modules')
        .select('module_id')
        .eq('user_id', userId)
        .eq('actif', true);
      if (error) throw error;
      return (data || []).map((row: any) => row.module_id);
    },
    enabled: !!userId,
    staleTime: 1000 * 60 * 60,
    cacheTime: 1000 * 60 * 60,
  });
};

// ============================================================
// RÉCUPÉRER TOUS LES user_modules (pour admin)
// ============================================================
export const useAllUserModules = () => {
  return useQuery<UserModule[], Error>({
    queryKey: ['user_modules', 'all'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('user_modules')
        .select('*')
        .eq('actif', true);
      if (error) throw error;
      return data as UserModule[];
    },
    staleTime: 1000 * 60 * 60,
  });
};

// ============================================================
// METTRE À JOUR LES MODULES D'UN UTILISATEUR
// (remplace toute la liste)
// ============================================================
export const useUpdateUserModules = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    userId,
    moduleIds,
  }: {
    userId: string;
    moduleIds: string[];
  }): Promise<void> => {
    // 1. Désactiver tous les modules actuels
    const { error: disableError } = await supabase
      .from('user_modules')
      .update({ actif: false })
      .eq('user_id', userId);

    if (disableError) throw disableError;

    if (moduleIds.length === 0) return;

    // 2. Récupérer l'utilisateur admin actuel
    const { data: { user: currentUser } } = await supabase.auth.getUser();

    // 3. Upsert chaque module (actif = true)
    const rows = moduleIds.map((moduleId) => ({
      user_id: userId,
      module_id: moduleId,
      actif: true,
      created_by: currentUser?.id || null,
    }));

    const { error: upsertError } = await supabase
      .from('user_modules')
      .upsert(rows, { onConflict: 'user_id,module_id' });

    if (upsertError) throw upsertError;
  };

  return useMutation(mutationFn, {
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries(['user_modules', variables.userId]);
      queryClient.invalidateQueries(['user_modules', 'all']);
      success('Modules mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de la mise à jour');
    },
  });
};
