import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { SessionCaisse, SessionFormData } from '../types/caisse';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { logAction } from './useHistorique';
import { useOfflineMutation } from './useOfflineMutation';
import { useMagasinActif } from '../contexts/MagasinActifContext';

export const useSessions = () => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<SessionCaisse[], Error>({
    queryKey: ['sessions_caisse', magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('sessions_caisse')
          .select('*, user:users(id, nom, prenom, email)')
          .order('date_ouverture', { ascending: false });
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }
        const { data, error } = await query;
        if (error) throw error;
        return data as SessionCaisse[];
      } catch {
        const cached = await getData<SessionCaisse[]>('sessions_caisse');
        if (cached) return cached;
        throw new Error('Impossible de charger les sessions');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useSessionActive = () => {
  const queryClient = useQueryClient();
  return useQuery<SessionCaisse | null, Error>({
    queryKey: ['session_caisse_active'],
    queryFn: async () => {
      // Forcer un rafraîchissement depuis la base
      const { data, error } = await supabase
        .from('sessions_caisse')
        .select('*, user:users(id, nom, prenom, email)')
        .eq('statut', 'ouverte')
        .maybeSingle();
      
      if (error && error.code !== 'PGRST116') throw error;
      
      // Mettre à jour le cache avec le résultat frais
      if (data) {
        queryClient.setQueryData(['session_caisse_active'], data);
      } else {
        queryClient.setQueryData(['session_caisse_active'], null);
      }
      
      return data as SessionCaisse | null;
    },
    staleTime: 0, // Ne pas utiliser le cache, toujours aller chercher en base
    cacheTime: 1000 * 60 * 5,
    refetchOnMount: true,
    refetchOnWindowFocus: true,
    refetchInterval: 30000, // Rafraîchir toutes les 30 secondes
  });
};

export const useCreateSession = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: SessionFormData): Promise<SessionCaisse> => {
    // 1. Invalider le cache pour être sûr d'avoir des données fraîches
    await queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });
    await queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });

    // 2. Vérifier en direct dans la base s'il y a une session ouverte
    const { data: existing, error: checkError } = await supabase
      .from('sessions_caisse')
      .select('id, statut, date_ouverture, user_id, fond_ouverture')
      .eq('statut', 'ouverte')
      .maybeSingle();

    // 3. Gérer l'erreur "aucune ligne trouvée" (PGRST116)
    if (checkError && checkError.code !== 'PGRST116') {
      throw new Error('Erreur lors de la vérification des sessions: ' + checkError.message);
    }

    // 4. Si une session existe, on lève une erreur avec ses détails
    if (existing) {
      const dateOuverture = new Date(existing.date_ouverture).toLocaleString();
      throw new Error(
        `Une session est déjà ouverte (ID: ${existing.id.slice(0, 8)}...)\n` +
        `Ouverte le: ${dateOuverture}\n` +
        `Fond initial: ${existing.fond_ouverture.toLocaleString()} FCFA\n` +
        `Veuillez la fermer avant d'en ouvrir une nouvelle.`
      );
    }

    // 5. Aucune session ouverte, on peut créer
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    const { data: inserted, error: insertError } = await supabase
      .from('sessions_caisse')
      .insert([{ 
        fond_ouverture: data.fond_ouverture, 
        user_id: userId,
        statut: 'ouverte',
        date_ouverture: new Date().toISOString(),
      }])
      .select('*, user:users(id, nom, prenom, email)')
      .single();

    if (insertError) throw insertError;

    // 6. Mettre à jour le cache avec la nouvelle session
    queryClient.setQueryData(['session_caisse_active'], inserted);
    await queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });

    try { 
      await logAction(userId, 'caisse', 'open', 'session', inserted.id, null, inserted); 
    } catch (e) {}

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: (data) => {
        queryClient.setQueryData(['session_caisse_active'], data);
        queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });
        success('Session ouverte avec succès ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de l\'ouverture de la session');
      },
    },
    '/api/sessions',
    'POST'
  );
};

export const useCloseSession = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, fond_fermeture }: { id: string; fond_fermeture: number }): Promise<SessionCaisse> => {
    // 1. Récupérer la session
    const { data: session, error: sessionError } = await supabase
      .from('sessions_caisse')
      .select('fond_ouverture, user_id')
      .eq('id', id)
      .single();
    if (sessionError) throw sessionError;

    // 2. Récupérer le total des ventes de la session
    const { data: ventes, error: ventesError } = await supabase
      .from('ventes')
      .select('montant_total')
      .eq('session_id', id)
      .eq('statut', 'validee');
    if (ventesError) throw ventesError;

    const totalVentes = ventes.reduce((acc: number, v: any) => acc + v.montant_total, 0);

    // 3. Calculer l'écart : fond_fermeture - (fond_ouverture + total_ventes)
    const ecart = fond_fermeture - (session.fond_ouverture + totalVentes);

    // 4. Mettre à jour la session
    const { data: updated, error: updateError } = await supabase
      .from('sessions_caisse')
      .update({
        fond_fermeture,
        ecart,
        statut: 'fermee',
        date_fermeture: new Date().toISOString(),
      })
      .eq('id', id)
      .select('*, user:users(id, nom, prenom, email)')
      .single();
    if (updateError) throw updateError;

    // 5. Invalider les caches
    queryClient.setQueryData(['session_caisse_active'], null);
    queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });
    queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });

    if (session.user_id) {
      try { await logAction(session.user_id, 'caisse', 'close', 'session', updated.id, session, updated); } catch (e) {}
    }
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.setQueryData(['session_caisse_active'], null);
        queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });
        queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });
        success('Session fermée avec succès ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la fermeture de la session');
      },
    },
    '/api/sessions',
    'PUT'
  );
};

export const useDeleteSession = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { data: session } = await supabase
      .from('sessions_caisse')
      .select('user_id')
      .eq('id', id)
      .single();

    const { error } = await supabase
      .from('sessions_caisse')
      .delete()
      .eq('id', id);

    if (error) throw error;
    
    queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });
    queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });

    if (session?.user_id) {
      try { await logAction(session.user_id, 'caisse', 'delete', 'session', id, session, null); } catch (e) {}
    }
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions_caisse'] });
        queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });
        success('Session supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la suppression');
      },
    },
    '/api/sessions',
    'DELETE'
  );
};

// Hook pour forcer le rafraîchissement de la session active
export const useRefreshSessionActive = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const refresh = async (): Promise<SessionCaisse | null> => {
    try {
      // Forcer l'invalidation du cache
      await queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });
      
      // Récupérer directement depuis la base
      const { data, error } = await supabase
        .from('sessions_caisse')
        .select('*, user:users(id, nom, prenom, email)')
        .eq('statut', 'ouverte')
        .maybeSingle();

      if (error && error.code !== 'PGRST116') throw error;
      
      // Mettre à jour le cache
      if (data) {
        queryClient.setQueryData(['session_caisse_active'], data);
      } else {
        queryClient.setQueryData(['session_caisse_active'], null);
      }
      
      return data as SessionCaisse | null;
    } catch (err: any) {
      toastError(err.message || 'Erreur lors du rafraîchissement');
      return null;
    }
  };

  return { refresh };
};
