// ============================================================
// USE USER CONFIG — Configuration personnelle par utilisateur
// Version V3 — Compatible React 16
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

export interface UserConfig {
  id: string;
  user_id: string;
  sidebar_shortcuts: string[];
  theme_mode?: string | null;
  font_family?: string | null;
  created_at?: string;
  updated_at?: string;
}

export const useUserConfig = () => {
  const { user } = useAuth();

  return useQuery<UserConfig | null, Error>({
    queryKey: ['user_config', user?.id],
    queryFn: async () => {
      if (!user?.id) return null;

      const { data, error } = await supabase
        .from('user_config')
        .select('*')
        .eq('user_id', user.id)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      return (data as UserConfig) || null;
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 60,
  });
};

export const useUpdateUserConfig = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  const mutationFn = async (partial: Partial<UserConfig>): Promise<UserConfig> => {
    if (!user?.id) throw new Error('Utilisateur non connecté');

    // Vérifier si une config existe
    const { data: existing } = await supabase
      .from('user_config')
      .select('id')
      .eq('user_id', user.id)
      .maybeSingle();

    let result;
    if (existing) {
      const { data, error } = await supabase
        .from('user_config')
        .update({ ...partial, updated_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .select()
        .single();
      if (error) throw error;
      result = data;
    } else {
      const { data, error } = await supabase
        .from('user_config')
        .insert({ ...partial, user_id: user.id })
        .select()
        .single();
      if (error) throw error;
      result = data;
    }

    return result as UserConfig;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries(['user_config', user?.id]);
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur de sauvegarde');
    },
  });
};
