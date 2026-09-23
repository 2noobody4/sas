import { useQuery, useMutation, useQueryClient, useInfiniteQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Message, MessageFormData, Conversation } from '../types/messages';
import { useToast } from './useToast';
import { useAuth } from './useAuth';

// ============================================================
// RÉCUPÉRER LES CONVERSATIONS
// ============================================================
export const useConversations = () => {
  const { user } = useAuth();
  const userId = user?.id;

  return useQuery<Conversation[], Error>({
    queryKey: ['conversations', userId],
    queryFn: async () => {
      if (!userId) return [];

      // Récupérer les derniers messages par utilisateur
      const { data, error } = await supabase
        .from('messages')
        .select(`
          id,
          sender_id,
          receiver_id,
          subject,
          content,
          read,
          read_at,
          created_at,
          sender:sender_id(id, nom, prenom, email, role_id, role:roles(nom)),
          receiver:receiver_id(id, nom, prenom, email, role_id, role:roles(nom))
        `)
        .or(`sender_id.eq.${userId},receiver_id.eq.${userId}`)
        .order('created_at', { ascending: false });

      if (error) throw error;

      // Grouper par interlocuteur
      const conversationsMap = new Map<string, Conversation>();
      const unreadCountMap = new Map<string, number>();

      (data || []).forEach((msg: any) => {
        const otherUserId = msg.sender_id === userId ? msg.receiver_id : msg.sender_id;
        const otherUser = msg.sender_id === userId ? msg.receiver : msg.sender;

        // Compter les non-lus
        if (!msg.read && msg.receiver_id === userId) {
          unreadCountMap.set(otherUserId, (unreadCountMap.get(otherUserId) || 0) + 1);
        }

        // Garder le dernier message
        if (!conversationsMap.has(otherUserId)) {
          conversationsMap.set(otherUserId, {
            user_id: otherUserId,
            user: otherUser,
            last_message: msg,
            unread_count: unreadCountMap.get(otherUserId) || 0,
            last_message_at: msg.created_at,
          });
        }
      });

      return Array.from(conversationsMap.values())
        .sort((a, b) => new Date(b.last_message_at).getTime() - new Date(a.last_message_at).getTime());
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

// ============================================================
// RÉCUPÉRER LES MESSAGES D'UNE CONVERSATION
// ============================================================
export const useMessages = (userId: string) => {
  const { user } = useAuth();
  const currentUserId = user?.id;

  return useQuery<Message[], Error>({
    queryKey: ['messages', currentUserId, userId],
    queryFn: async () => {
      if (!currentUserId || !userId) return [];

      const { data, error } = await supabase
        .from('messages')
        .select(`
          *,
          sender:sender_id(id, nom, prenom, email, role_id, role:roles(nom)),
          receiver:receiver_id(id, nom, prenom, email, role_id, role:roles(nom))
        `)
        .or(`and(sender_id.eq.${currentUserId},receiver_id.eq.${userId}),and(sender_id.eq.${userId},receiver_id.eq.${currentUserId})`)
        .order('created_at', { ascending: true });

      if (error) throw error;
      return data as Message[];
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: !!currentUserId && !!userId,
  });
};

// ============================================================
// ENVOYER UN MESSAGE
// ============================================================
export const useSendMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation(
    async (data: MessageFormData) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const { data: inserted, error } = await supabase
        .from('messages')
        .insert([{
          sender_id: user.id,
          receiver_id: data.receiver_id,
          subject: data.subject || null,
          content: data.content,
          parent_id: data.parent_id || null,
        }])
        .select(`
          *,
          sender:sender_id(id, nom, prenom, email, role_id, role:roles(nom)),
          receiver:receiver_id(id, nom, prenom, email, role_id, role:roles(nom))
        `)
        .single();

      if (error) throw error;
      return inserted;
    },
    {
      onSuccess: (data) => {
        queryClient.invalidateQueries('conversations');
        queryClient.invalidateQueries(['messages', data.sender_id, data.receiver_id]);
        queryClient.invalidateQueries(['messages', data.receiver_id, data.sender_id]);
        success('Message envoyé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de l\'envoi');
      },
    }
  );
};

// ============================================================
// MARQUER UN MESSAGE COMME LU
// ============================================================
export const useMarkAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async (messageId: string) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('id', messageId)
        .eq('receiver_id', user.id);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conversations');
        queryClient.invalidateQueries('messages');
      },
    }
  );
};

// ============================================================
// MARQUER TOUS LES MESSAGES D'UNE CONVERSATION COMME LUS
// ============================================================
export const useMarkAllAsRead = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();

  return useMutation(
    async (senderId: string) => {
      if (!user) throw new Error('Utilisateur non connecté');

      const { error } = await supabase
        .from('messages')
        .update({ read: true, read_at: new Date().toISOString() })
        .eq('sender_id', senderId)
        .eq('receiver_id', user.id)
        .eq('read', false);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conversations');
        queryClient.invalidateQueries('messages');
      },
    }
  );
};

// ============================================================
// SUPPRIMER UN MESSAGE
// ============================================================
export const useDeleteMessage = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const { success, error: toastError } = useToast();

  return useMutation(
    async (messageId: string) => {
      if (!user) throw new Error('Utilisateur non connecté');

      // Vérifier que l'utilisateur est l'expéditeur ou le destinataire
      const { data: message } = await supabase
        .from('messages')
        .select('sender_id, receiver_id')
        .eq('id', messageId)
        .single();

      if (!message) throw new Error('Message introuvable');
      if (message.sender_id !== user.id && message.receiver_id !== user.id) {
        throw new Error('Vous n\'êtes pas autorisé à supprimer ce message');
      }

      const { error } = await supabase
        .from('messages')
        .delete()
        .eq('id', messageId);

      if (error) throw error;
    },
    {
      onSuccess: () => {
        queryClient.invalidateQueries('conversations');
        queryClient.invalidateQueries('messages');
        success('Message supprimé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la suppression');
      },
    }
  );
};

// ============================================================
// RÉCUPÉRER LES UTILISATEURS POUR LA COMPOSITION
// ============================================================
export const useMessageRecipients = () => {
  const { user } = useAuth();
  const role = user?.role?.nom || 'client';

  return useQuery({
    queryKey: ['message_recipients', role],
    queryFn: async () => {
      // Si client, ne voir que les employés (et admin/gestionnaire)
      // Si employé, voir les clients et autres employés
      let roleFilter: string[];
      if (role === 'client') {
        roleFilter = ['admin', 'gestionnaire', 'employe'];
      } else {
        // Employé, admin, gestionnaire : voir les clients et autres employés
        roleFilter = ['client', 'admin', 'gestionnaire', 'employe', 'cashier', 'magasinier', 'comptable'];
      }

      const { data, error } = await supabase
        .from('users')
        .select('id, nom, prenom, email, role_id, role:roles(nom)')
        .eq('actif', true)
        .neq('id', user?.id); // Exclure soi-même

      if (error) throw error;

      // Filtrer par rôle
      return (data || []).filter((u: any) => {
        const userRole = u.role?.nom || '';
        // Si client, ne voir que les employés
        if (role === 'client') {
          return ['admin', 'gestionnaire', 'employe'].includes(userRole);
        }
        // Si employé/admin, voir les clients et autres employés (sauf admin)
        if (role === 'admin' || role === 'gestionnaire' || role === 'employe') {
          return roleFilter.includes(userRole) || userRole === 'client';
        }
        return true;
      });
    },
    staleTime: 1000 * 60 * 5,
  });
};
