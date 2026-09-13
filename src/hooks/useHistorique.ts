/**
 * useHistorique – Hooks pour l'historique d'actions
 * Compatible React 16.14
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { HistoriqueAction, HistoriqueFilter } from '../types/historique';
import { useToast } from './useToast';

export const useHistorique = (filters?: HistoriqueFilter) => {
  return useQuery<HistoriqueAction[], Error>({
    queryKey: ['historique', filters],
    queryFn: async () => {
      let query = supabase
        .from('historique_actions')
        .select('*, user:users(id, nom, prenom, email)')
        .order('created_at', { ascending: false })
        .limit(100);

      if (filters?.module) {
        query = query.eq('module', filters.module);
      }
      if (filters?.action) {
        query = query.eq('action', filters.action);
      }
      if (filters?.entity_type) {
        query = query.eq('entity_type', filters.entity_type);
      }
      if (filters?.user_id) {
        query = query.eq('user_id', filters.user_id);
      }
      if (filters?.entity_id) {
        query = query.eq('entity_id', filters.entity_id);
      }
      if (filters?.date_debut) {
        query = query.gte('created_at', filters.date_debut);
      }
      if (filters?.date_fin) {
        query = query.lte('created_at', filters.date_fin);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as HistoriqueAction[];
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60,
  });
};

export const useCreateHistorique = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

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
      console.error('[Historique] Erreur d\'enregistrement:', err);
      // On ne notifie pas l'utilisateur pour ne pas polluer l'interface
    },
  });
};

// Fonction utilitaire pour enregistrer une action facilement
export const logAction = async (
  userId: string,
  module: string,
  action: string,
  entityType: string,
  entityId: string,
  oldData?: any,
  newData?: any
) => {
  try {
    // Récupérer l'IP et l'User-Agent
    let ipAddress = '';
    let userAgent = '';
    try {
      const response = await fetch('https://api.ipify.org?format=json');
      const data = await response.json();
      ipAddress = data.ip;
    } catch {}
    userAgent = navigator.userAgent;

    await supabase
      .from('historique_actions')
      .insert([{
        user_id: userId,
        module,
        action,
        entity_type: entityType,
        entity_id: entityId,
        old_data: oldData || null,
        new_data: newData || null,
        ip_address: ipAddress || null,
        user_agent: userAgent || null,
      }]);
  } catch (err) {
    console.error('[Historique] Erreur:', err);
  }
};
