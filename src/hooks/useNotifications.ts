import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Notification, NotificationFilter } from '../types/notification';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

// ============================================================
// RÉCUPÉRER LES NOTIFICATIONS
// ============================================================
export const useNotifications = (filters?: NotificationFilter) => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<Notification[], Error>({
    queryKey: ['notifications', userId, filters],
    queryFn: async () => {
      if (!userId) return [];

      let query = supabase
        .from('notifications')
        .select('*')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.read !== undefined) query = query.eq('read', filters.read);
      if (filters?.date_debut) query = query.gte('created_at', filters.date_debut);
      if (filters?.date_fin) query = query.lte('created_at', filters.date_fin);
      if (filters?.search) {
        query = query.or(`title.ilike.%${filters.search}%,content.ilike.%${filters.search}%`);
      }

      if (filters?.limit) query = query.limit(filters.limit);
      if (filters?.page && filters?.limit) {
        const offset = (filters.page - 1) * filters.limit;
        query = query.range(offset, offset + filters.limit - 1);
      }

      const { data, error } = await query;
      if (error) throw error;
      return data as Notification[];
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: !!userId,
  });
};

// ============================================================
// MARQUER UNE NOTIFICATION COMME LUE
// ============================================================
export const useMarkNotificationRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation(
    async (id: string) => {
      if (!user) throw new Error('Utilisateur non connecté');
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    }
  );
};

// ============================================================
// MARQUER TOUTES LES NOTIFICATIONS COMME LUES
// ============================================================
export const useMarkAllNotificationsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation(
    async () => {
      if (!user) throw new Error('Utilisateur non connecté');
      const { error } = await supabase
        .from('notifications')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('user_id', user.id)
        .eq('read', false);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        success('Toutes les notifications ont été marquées comme lues ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    }
  );
};

// ============================================================
// SUPPRIMER UNE NOTIFICATION
// ============================================================
export const useDeleteNotification = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation(
    async (id: string) => {
      if (!user) throw new Error('Utilisateur non connecté');
      const { error } = await supabase
        .from('notifications')
        .delete()
        .eq('id', id)
        .eq('user_id', user.id);
      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('notifications');
        success('Notification supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message);
      },
    }
  );
};

// ============================================================
// COMPTER LES NOTIFICATIONS NON LUES
// ============================================================
export const useUnreadCount = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery({
    queryKey: ['notifications_unread_count', userId],
    queryFn: async () => {
      if (!userId) return 0;
      const { count, error } = await supabase
        .from('notifications')
        .select('*', { count: 'exact', head: true })
        .eq('user_id', userId)
        .eq('read', false);
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 5,
    enabled: !!userId,
  });
};
