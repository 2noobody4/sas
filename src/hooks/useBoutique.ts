
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Panier, Commande, CommandeFormData, StatutCommande } from '../types/boutique';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useLocalStorage } from './useLocalStorage';

export const usePanier = () => {
  const { value: panier, setValue: setPanier } = useLocalStorage<Panier>('panier', { items: [], total: 0 });

  const calculerTotal = (items: any[]): number => {
    return items.reduce((acc, item) => acc + (item.prix_unitaire * item.quantite), 0);
  };

  const ajouter = (produit_id: string, prix: number, quantite: number = 1) => {
    setPanier((prev) => {
      const existing = prev.items.find((item) => item.produit_id === produit_id);
      let newItems;
      if (existing) {
        newItems = prev.items.map((item) =>
          item.produit_id === produit_id ? { ...item, quantite: item.quantite + quantite } : item
        );
      } else {
        newItems = [...prev.items, { produit_id, quantite, prix_unitaire: prix }];
      }
      return { items: newItems, total: calculerTotal(newItems) };
    });
  };

  const retirer = (produit_id: string) => {
    setPanier((prev) => {
      const newItems = prev.items.filter((item) => item.produit_id !== produit_id);
      return { items: newItems, total: calculerTotal(newItems) };
    });
  };

  const modifierQuantite = (produit_id: string, quantite: number) => {
    setPanier((prev) => {
      if (quantite <= 0) {
        const newItems = prev.items.filter((item) => item.produit_id !== produit_id);
        return { items: newItems, total: calculerTotal(newItems) };
      }
      const newItems = prev.items.map((item) =>
        item.produit_id === produit_id ? { ...item, quantite } : item
      );
      return { items: newItems, total: calculerTotal(newItems) };
    });
  };

  const vider = () => {
    setPanier({ items: [], total: 0 });
  };

  return { panier, ajouter, retirer, modifierQuantite, vider };
};

export const useCommandes = (filters?: { statut?: StatutCommande; client_id?: string }) => {
  const { getData } = useDataLoader();
  return useQuery<Commande[], Error>({
    queryKey: ['commandes', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('commandes')
          .select('*, user:users(id, nom, prenom, email)')
          .order('date_commande', { ascending: false });

        if (filters?.statut) query = query.eq('statut', filters.statut);
        if (filters?.client_id) query = query.eq('client_id', filters.client_id);

        const { data, error } = await query;
        if (error) throw error;
        return data as Commande[];
      } catch {
        const cached = await getData<Commande[]>('commandes');
        if (cached) return cached;
        throw new Error('Impossible de charger les commandes');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCommande = (id?: string) => {
  return useQuery<Commande | null, Error>({
    queryKey: ['commande', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('commandes')
        .select('*, user:users(id, nom, prenom, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Commande;
    },
    enabled: !!id,
  });
};

export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: CommandeFormData): Promise<Commande> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    const { data: client } = await supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, adresse')
      .eq('user_id', userId)
      .maybeSingle();

    const montant_total = data.items.reduce((acc, item) => acc + (item.prix_unitaire * item.quantite), 0) + (data.frais_livraison || 0);

    const { data: inserted, error } = await supabase
      .from('commandes')
      .insert([{
        client_id: client?.id || null,
        client_nom: data.client_nom || client?.nom || null,
        client_email: data.client_email || client?.email || null,
        client_telephone: data.client_telephone || client?.telephone || null,
        client_adresse: data.client_adresse || client?.adresse || null,
        items: data.items,
        montant_total,
        frais_livraison: data.frais_livraison || 0,
        statut: 'en_attente',
        mode_paiement: data.mode_paiement || null,
        notes: data.notes || null,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('commandes');
      success('Commande créée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useUpdateCommandeStatut = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, statut }: { id: string; statut: StatutCommande }): Promise<Commande> => {
    const { data: updated, error } = await supabase
      .from('commandes')
      .update({ statut })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('commandes');
      success('Statut mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useDeleteCommande = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('commandes');
      success('Commande supprimée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};
