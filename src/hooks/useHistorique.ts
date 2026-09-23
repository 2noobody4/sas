/**
 * useHistorique – Hooks pour l'historique d'actions
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { HistoriqueAction, HistoriqueFilter } from '../types/historique';
import { finDeJournee } from '../lib/dates';

export const useHistorique = (filters?: HistoriqueFilter) => {
  // Sérialisation stable du queryKey
  const filtersKey = JSON.stringify(filters || {});

  return useQuery<HistoriqueAction[], Error>(
    ['historique', filtersKey],
    async () => {
      let query = supabase
        .from('historique_actions')
        .select('*')  // ← PLUS DE JOINTURE (voir fix ci-dessous)
        .order('created_at', { ascending: false })
        .limit(200);

      if (filters?.module) query = query.eq('module', filters.module);
      if (filters?.action) query = query.eq('action', filters.action);
      if (filters?.entity_type) query = query.eq('entity_type', filters.entity_type);
      if (filters?.user_id) query = query.eq('user_id', filters.user_id);
      if (filters?.entity_id) query = query.eq('entity_id', filters.entity_id);
      if (filters?.date_debut) query = query.gte('created_at', filters.date_debut);
      if (filters?.date_fin) query = query.lte('created_at', finDeJournee(filters.date_fin));

      const { data, error } = await query;

      console.log('[useHistorique] Filtres:', filters);
      console.log('[useHistorique] Lignes reçues:', data?.length);
      console.log('[useHistorique] Modules:', Array.from(new Set((data || []).map((d: any) => d.module))));
      console.log('[useHistorique] Actions:', Array.from(new Set((data || []).map((d: any) => d.action))));

      if (error) throw error;

      // Charger les users séparément (jointure manuelle)
      const userIds = Array.from(new Set((data || []).map((d: any) => d.user_id).filter(Boolean)));
      let usersMap: Record<string, any> = {};

      if (userIds.length > 0) {
        const { data: users } = await supabase
          .from('users')
          .select('id, nom, prenom, email')
          .in('id', userIds);
        (users || []).forEach((u: any) => { usersMap[u.id] = u; });
      }

      return (data || []).map((row: any) => ({
        ...row,
        user: usersMap[row.user_id] || null,
      })) as HistoriqueAction[];
    },
    {
      staleTime: 0,                    // ← Toujours considérer comme périmé
      cacheTime: 1000 * 60 * 5,        // ← Garder 5 min en mémoire
      refetchOnMount: 'always',        // ← Refetch à chaque montage
      refetchOnWindowFocus: true,      // ← Refetch au focus
    }
  );
};

export const useCreateHistorique = () => {
  const queryClient = useQueryClient();

  const mutationFn = async (data: Omit<HistoriqueAction, 'id' | 'created_at' | 'user'>): Promise<HistoriqueAction> => {
    const { data: inserted, error } = await supabase
      .from('historique_actions')
      .insert([{
        user_id: data.user_id,
        module: data.module,
        action: data.action,
        entity_type: data.entity_type,
        entity_id: data.entity_id,
        old_data: data.old_data || null,
        new_data: data.new_data || null,
        ip_address: data.ip_address || null,
        user_agent: data.user_agent || null,
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('historique');
    },
    onError: (err: any) => {
      console.error('[Historique] Erreur insert:', err);
    },
  });
};

export const logAction = async (
  userId: string,
  module: string,
  action: string,
  entityType: string,
  entityId: string,
  oldData?: any,
  newData?: any
): Promise<void> => {
  let ipAddress: string | null = null;
  let userAgent: string | null = null;

  try {
    const response = await fetch('https://api.ipify.org?format=json');
    const data = await response.json();
    ipAddress = data.ip || null;
  } catch {}

  try {
    userAgent = navigator.userAgent;
  } catch {}

  const payload = {
    user_id: userId,
    module,
    action,
    entity_type: entityType,
    entity_id: entityId,
    old_data: oldData || null,
    new_data: newData || null,
    ip_address: ipAddress,
    user_agent: userAgent,
  };

  console.log('📝 [Historique] Insert:', payload);

  const { data, error } = await supabase
    .from('historique_actions')
    .insert([payload])
    .select()
    .single();

  if (error) {
    console.error('❌ [Historique] Insert error:', error);
    throw new Error(`${error.message} (${error.code})`);
  }

  console.log('✅ [Historique] Insert OK:', data);
};
