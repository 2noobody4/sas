// ============================================================
// USE DEMANDES SERVICE - CRUD complet
// Version V1.3 - Notifications : création + changement statut
// ============================================================

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import {
  DemandeService,
  DemandeServiceFormData,
  DemandeServiceFiltres,
  StatutDemandeService,
} from '../types/demandesService';
import { useToast } from './useToast';
import { useAuth } from './useAuth';
import { notifyAdmins, notifyUser } from './useNotificationActions';
import { finDeJournee } from '../lib/dates';

function serializeFiltres(filtres?: DemandeServiceFiltres): string {
  if (!filtres) return '{}';
  return JSON.stringify({
    statut: filtres.statut ?? null,
    client_id: filtres.client_id ?? null,
    service_id: filtres.service_id ?? null,
    date_debut: filtres.date_debut ?? null,
    date_fin: filtres.date_fin ?? null,
  });
}

export const useDemandesService = (filtres?: DemandeServiceFiltres) => {
  const filtresKey = serializeFiltres(filtres);

  return useQuery<DemandeService[], Error>({
    queryKey: ['demandes_service', filtresKey],
    queryFn: async () => {
      let query = supabase
        .from('demandes_service')
        .select(`
          *,
          service:service_id(*),
          client:client_id(*),
          user:user_id(id, nom, prenom, email)
        `)
        .order('created_at', { ascending: false });

      if (filtres?.statut) query = query.eq('statut', filtres.statut);
      if (filtres?.client_id) query = query.eq('client_id', filtres.client_id);
      if (filtres?.service_id) query = query.eq('service_id', filtres.service_id);
      if (filtres?.date_debut) query = query.gte('created_at', filtres.date_debut);
      if (filtres?.date_fin) query = query.lte('created_at', finDeJournee(filtres.date_fin));

      const { data, error } = await query;
      if (error) throw error;
      return (data || []) as DemandeService[];
    },
    staleTime: 1000 * 60 * 2,
  });
};

export const useMesDemandesService = () => {
  const { user } = useAuth();
  return useQuery<DemandeService[], Error>({
    queryKey: ['demandes_service', 'me', user?.id],
    queryFn: async () => {
      if (!user?.id) return [];
      const { data, error } = await supabase
        .from('demandes_service')
        .select(`
          *,
          service:service_id(*),
          client:client_id(*)
        `)
        .eq('user_id', user.id)
        .order('created_at', { ascending: false });
      if (error) throw error;
      return (data || []) as DemandeService[];
    },
    enabled: !!user?.id,
    staleTime: 1000 * 60 * 2,
  });
};

export const useDemandeService = (id?: string) => {
  return useQuery<DemandeService | null, Error>({
    queryKey: ['demande_service', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('demandes_service')
        .select(`
          *,
          service:service_id(*),
          client:client_id(*),
          user:user_id(id, nom, prenom, email)
        `)
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as DemandeService;
    },
    enabled: !!id,
  });
};

export const useDemandesEnAttenteCount = () => {
  return useQuery<number, Error>({
    queryKey: ['demandes_service', 'count_en_attente'],
    queryFn: async () => {
      const { count, error } = await supabase
        .from('demandes_service')
        .select('id', { count: 'exact', head: true })
        .eq('statut', 'en_attente');
      if (error) throw error;
      return count || 0;
    },
    staleTime: 1000 * 60,
  });
};

export const useCreateDemandeService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const { user } = useAuth();

  return useMutation({
    mutationFn: async (data: DemandeServiceFormData): Promise<DemandeService> => {
      const payload = {
        service_id: data.service_id,
        client_id: data.client_id || null,
        user_id: user?.id || null,
        informations: data.informations || {},
        date_souhaitee: data.date_souhaitee || null,
        notes: data.notes || null,
        type_facturation: data.type_facturation || 'forfait',
        mode_paiement: data.mode_paiement || 'total',
        montant_acompte: data.mode_paiement === 'acompte' ? (data.montant_acompte || 0) : null,
        statut: 'en_attente' as StatutDemandeService,
      };

      const { data: inserted, error } = await supabase
        .from('demandes_service')
        .insert([payload])
        .select(`
          *,
          service:service_id(nom)
        `)
        .single();
      if (error) throw error;
      return inserted;
    },
    onSuccess: async (demande) => {
      queryClient.invalidateQueries('demandes_service');
      success('Demande de service envoyée ✅');

      // 🔔 Notifier les admins
      try {
        const clientName = user?.prenom
          ? `${user.prenom} ${user.nom || ''}`.trim()
          : (user?.email || 'Un client');
        const serviceName = (demande as any).service?.nom || 'un service';

        await notifyAdmins({
          type: 'system',
          title: '📋 Nouvelle demande de service',
          content: `${clientName} a demandé "${serviceName}"`,
          link: '/gestion/services/demandes',
          metadata: { demande_id: demande.id, service_id: demande.service_id },
        });
      } catch (e) {
        console.warn('[useCreateDemandeService] Notif admins échouée:', e);
      }
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors de l\'envoi');
    },
  });
};

export const useUpdateDemandeServiceStatut = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async ({
      id,
      statut,
      notes_admin,
      prix_convenu,
      date_confirmee,
    }: {
      id: string;
      statut: StatutDemandeService;
      notes_admin?: string;
      prix_convenu?: number;
      date_confirmee?: string;
    }): Promise<DemandeService> => {
      const updates: any = {
        statut,
        updated_at: new Date().toISOString(),
      };
      if (notes_admin !== undefined) updates.notes_admin = notes_admin;
      if (prix_convenu !== undefined) updates.prix_convenu = prix_convenu;
      if (date_confirmee !== undefined) updates.date_confirmee = date_confirmee;

      const { data: updated, error } = await supabase
        .from('demandes_service')
        .update(updates)
        .eq('id', id)
        .select(`
          *,
          service:service_id(nom)
        `)
        .single();
      if (error) throw error;
      return updated;
    },
    onSuccess: async (demande) => {
      queryClient.invalidateQueries('demandes_service');
      success('Statut mis à jour ✅');

      // 🔔 Notifier le client
      try {
        if (!demande.user_id) return;

        const statutLabels: Record<StatutDemandeService, string> = {
          en_attente: '⏳ En attente',
          confirmee: '✅ Confirmée',
          en_cours: '🔧 En cours',
          terminee: '🏁 Terminée',
          annulee: '❌ Annulée',
          refusee: '🚫 Refusée',
        };
        const label = statutLabels[demande.statut] || demande.statut;
        const serviceName = (demande as any).service?.nom || 'votre service';
        const prixInfo = demande.prix_convenu
          ? ` — Prix : ${demande.prix_convenu.toLocaleString()} FCFA`
          : '';

        await notifyUser(demande.user_id, {
          type: 'system',
          title: `📢 Demande ${label}`,
          content: `"${serviceName}" : statut mis à jour${prixInfo}`,
          link: '/mes-demandes-service',
          metadata: { demande_id: demande.id },
        });
      } catch (e) {
        console.warn('[useUpdateDemandeServiceStatut] Notif client échouée:', e);
      }
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useDeleteDemandeService = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  return useMutation({
    mutationFn: async (id: string): Promise<string> => {
      const { error } = await supabase.from('demandes_service').delete().eq('id', id);
      if (error) throw error;
      return id;
    },
    onSuccess: () => {
      queryClient.invalidateQueries('demandes_service');
      success('Demande supprimée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};
