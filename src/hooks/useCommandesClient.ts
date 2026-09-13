import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { CommandeClient, CommandeClientFormData, StatutCommandeClient } from '../types/commandeClient';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';

export const useCommandesClient = (filters?: { client_id?: string; statut?: StatutCommandeClient }) => {
  const { getData } = useDataLoader();
  
  return useQuery<CommandeClient[], Error>({
    queryKey: ['commandes_client', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('commandes_client')
          .select('*, client:client_id(*), user:user_id(*)')
          .order('date_commande', { ascending: false });
        
        if (filters?.client_id) query = query.eq('client_id', filters.client_id);
        if (filters?.statut) query = query.eq('statut', filters.statut);
        
        const { data, error } = await query;
        if (error) {
          console.error('[useCommandesClient] Erreur Supabase:', error);
          // ✅ Retourner un tableau vide au lieu de throw pour éviter le freeze
          return [];
        }
        return data as CommandeClient[];
      } catch (err) {
        console.error('[useCommandesClient] Erreur:', err);
        // ✅ Essayer de récupérer depuis le cache
        const cached = await getData<CommandeClient[]>('commandes_client');
        if (cached) return cached;
        // ✅ Retourner un tableau vide au lieu de throw
        return [];
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
    // ✅ Important : ne pas refaire la requête en cas d'erreur
    retry: false,
    // ✅ Ne pas refaire la requête au focus
    refetchOnWindowFocus: false,
    // ✅ Gérer le chargement initial
    initialData: [],
  });
};

export const useCommandeClient = (id?: string) => {
  return useQuery<CommandeClient | null, Error>({
    queryKey: ['commande_client', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data, error } = await supabase
          .from('commandes_client')
          .select('*, client:client_id(*), user:user_id(*)')
          .eq('id', id)
          .single();
        
        if (error) {
          console.error('[useCommandeClient] Erreur:', error);
          return null;
        }
        return data as CommandeClient;
      } catch (err) {
        console.error('[useCommandeClient] Erreur:', err);
        return null;
      }
    },
    enabled: !!id,
    retry: false,
    refetchOnWindowFocus: false,
  });
};

export const useCreateCommandeClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  
  const mutationFn = async (data: CommandeClientFormData): Promise<CommandeClient> => {
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Utilisateur non authentifié');
      
      const sous_total = data.lignes.reduce((acc, l) => acc + (l.prix_unitaire * l.quantite), 0);
      const remise = data.remise || 0;
      const frais_livraison = data.frais_livraison || 0;
      const montant_total = sous_total - remise + frais_livraison;
      
      const now = new Date();
      const dateStr = now.toISOString().slice(0, 10).replace(/-/g, '');
      const numero = `CMD-${dateStr}-${Math.random().toString(36).slice(2, 6).toUpperCase()}`;
      
      const { data: inserted, error } = await supabase
        .from('commandes_client')
        .insert([{
          numero,
          client_id: data.client_id,
          date_commande: new Date().toISOString(),
          date_livraison_prevue: data.date_livraison_prevue || null,
          lignes: data.lignes,
          sous_total,
          remise,
          frais_livraison,
          montant_total,
          statut: 'en_attente',
          notes: data.notes || null,
          adresse_livraison: data.adresse_livraison || null,
          mode_paiement: data.mode_paiement || null,
          user_id: userId,
        }])
        .select()
        .single();
      
      if (error) throw error;
      return inserted;
    } catch (err: any) {
      console.error('[useCreateCommandeClient] Erreur:', err);
      throw err;
    }
  };
  
  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['commandes_client'] });
        success('Commande créée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la création');
      },
    },
    '/api/commandes_client',
    'POST'
  );
};

export const useUpdateCommandeClientStatut = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  
  const mutationFn = async ({ id, statut }: { id: string; statut: StatutCommandeClient }): Promise<CommandeClient> => {
    try {
      const { data: updated, error } = await supabase
        .from('commandes_client')
        .update({ statut, updated_at: new Date().toISOString() })
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    } catch (err: any) {
      console.error('[useUpdateCommandeClientStatut] Erreur:', err);
      throw err;
    }
  };
  
  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['commandes_client'] });
        success('Statut mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la mise à jour');
      },
    },
    '/api/commandes_client',
    'PUT'
  );
};

export const useDeleteCommandeClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  
  const mutationFn = async (id: string): Promise<string> => {
    try {
      const { error } = await supabase
        .from('commandes_client')
        .delete()
        .eq('id', id);
      
      if (error) throw error;
      return id;
    } catch (err: any) {
      console.error('[useDeleteCommandeClient] Erreur:', err);
      throw err;
    }
  };
  
  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['commandes_client'] });
        success('Commande supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la suppression');
      },
    },
    '/api/commandes_client',
    'DELETE'
  );
};

export const useUpdateCommandeClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  
  const mutationFn = async ({ id, data }: { id: string; data: Partial<CommandeClientFormData> }): Promise<CommandeClient> => {
    try {
      let updateData: any = { ...data, updated_at: new Date().toISOString() };
      
      if (data.lignes) {
        const sous_total = data.lignes.reduce((acc, l) => acc + (l.prix_unitaire * l.quantite), 0);
        const remise = data.remise || 0;
        const frais_livraison = data.frais_livraison || 0;
        updateData.sous_total = sous_total;
        updateData.montant_total = sous_total - remise + frais_livraison;
        updateData.lignes = data.lignes;
      }
      
      const { data: updated, error } = await supabase
        .from('commandes_client')
        .update(updateData)
        .eq('id', id)
        .select()
        .single();
      
      if (error) throw error;
      return updated;
    } catch (err: any) {
      console.error('[useUpdateCommandeClient] Erreur:', err);
      throw err;
    }
  };
  
  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['commandes_client'] });
        success('Commande mise à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la mise à jour');
      },
    },
    '/api/commandes_client',
    'PUT'
  );
};
