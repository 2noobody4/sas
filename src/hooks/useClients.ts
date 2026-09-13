import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Client, ClientFormData, Interaction, InteractionFormData, TransactionClient, ClientStats } from '../types/clients';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';

export const useClients = (filters?: { segment?: string; niveau?: string; actif?: boolean }) => {
  const { getData } = useDataLoader();
  return useQuery<Client[], Error>({
    queryKey: ['clients', filters],
    queryFn: async () => {
      try {
        let query = supabase.from('clients').select('*, user:users(*)').order('nom');
        if (filters?.segment) query = query.eq('segment', filters.segment);
        if (filters?.niveau) query = query.eq('niveau_fidelite', filters.niveau);
        if (filters?.actif !== undefined) query = query.eq('actif', filters.actif);
        const { data, error } = await query;
        if (error) throw error;
        return data as Client[];
      } catch {
        const cached = await getData<Client[]>('clients');
        if (cached) return cached;
        throw new Error('Impossible de charger les clients');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useClient = (id?: string) => {
  return useQuery<Client | null, Error>({
    queryKey: ['client', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase.from('clients').select('*, user:users(*)').eq('id', id).single();
      if (error) throw error;
      return data as Client;
    },
    enabled: !!id,
  });
};

export const useCreateClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: ClientFormData): Promise<Client> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('clients')
      .insert([{ ...data, user_id: userId, actif: true, points_fidelite: 0, niveau_fidelite: 'bronze', pays: data.pays || 'Sénégal' }])
      .select('*, user:users(*)')
      .single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('clients'); success('Client créé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/clients',
    'POST'
  );
};
export const useUpdateClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, data }: { id: string; data: Partial<ClientFormData> }): Promise<Client> => {
    const { data: updated, error } = await supabase.from('clients').update(data).eq('id', id).select('*, user:users(*)').single();
    if (error) throw error;
    return updated;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('clients'); success('Client mis à jour ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/clients',
    'PUT'
  );
};

export const useDeleteClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('clients').update({ actif: false }).eq('id', id);
    if (error) throw error;
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('clients'); success('Client désactivé ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/clients',
    'PATCH'
  );
};

export const useRestoreClient = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('clients').update({ actif: true }).eq('id', id);
    if (error) throw error;
    return id;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('clients'); success('Client restauré ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/clients',
    'PATCH'
  );
};

export const useInteractions = (clientId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Interaction[], Error>({
    queryKey: ['interactions', clientId],
    queryFn: async () => {
      try {
        let query = supabase.from('interactions_client').select('*, client:client_id(*), user:user_id(*)').order('date_interaction', { ascending: false });
        if (clientId) query = query.eq('client_id', clientId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Interaction[];
      } catch {
        const cached = await getData<Interaction[]>('interactions');
        if (cached) return cached;
        throw new Error('Impossible de charger les interactions');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateInteraction = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: InteractionFormData): Promise<Interaction> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('interactions_client')
      .insert([{ ...data, user_id: userId, date_interaction: data.date_interaction || new Date().toISOString() }])
      .select('*, client:client_id(*), user:user_id(*)')
      .single();
    if (error) throw error;
    return inserted;
  };
  return useOfflineMutation(
    { mutationFn, onSuccess: () => { queryClient.invalidateQueries('interactions'); success('Interaction enregistrée ✅'); }, onError: (err: any) => { toastError(err.message); } },
    '/api/interactions',
    'POST'
  );
};

export const useFideliteConfig = () => {
  return useQuery({
    queryKey: ['fidelite_config'],
    queryFn: async () => {
      const { data, error } = await supabase.from('niveaux_fidelite').select('*').order('points_min');
      if (error) throw error;
      return data;
    },
    staleTime: 1000 * 60 * 60,
  });
};

export const useTransactionsClient = (clientId?: string) => {
  return useQuery<TransactionClient[], Error>({
    queryKey: ['transactions_client', clientId],
    queryFn: async () => {
      if (!clientId) return [];
      const { data, error } = await supabase.from('transactions_client').select('*, client:client_id(*)').eq('client_id', clientId).order('date_transaction', { ascending: false });
      if (error) throw error;
      return data as TransactionClient[];
    },
    enabled: !!clientId,
  });
};

export const useClientStats = () => {
  return useQuery<ClientStats, Error>({
    queryKey: ['client_stats'],
    queryFn: async () => {
      const { data: clients } = await supabase.from('clients').select('*');
      if (!clients) throw new Error('Impossible de charger les clients');
      const total = clients.length;
      const actifs = clients.filter((c: any) => c.actif).length;
      const inactifs = total - actifs;
      const segments: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
      const niveaux: Record<string, number> = { bronze: 0, argent: 0, or: 0, platine: 0, diamant: 0 };
      clients.forEach((c: any) => {
        if (c.segment) segments[c.segment] = (segments[c.segment] || 0) + 1;
        if (c.niveau_fidelite) niveaux[c.niveau_fidelite] = (niveaux[c.niveau_fidelite] || 0) + 1;
      });
      return { total_clients: total, actifs, inactifs, total_depenses: 0, panier_moyen: 0, clients_par_segment: segments as any, clients_par_niveau: niveaux as any };
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const getNiveauFidelite = (points: number): 'bronze' | 'argent' | 'or' | 'platine' | 'diamant' => {
  if (points >= 5000) return 'diamant';
  if (points >= 3000) return 'platine';
  if (points >= 1500) return 'or';
  if (points >= 500) return 'argent';
  return 'bronze';
};
