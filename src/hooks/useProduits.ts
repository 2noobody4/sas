import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Produit, Categorie, ProduitFormData } from '../types/stock';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useLocalStorage } from './useLocalStorage';
import { useOfflineMutation } from './useOfflineMutation';

export const useProduits = (showInactifs: boolean = false) => {
  const { getData } = useDataLoader();
  return useQuery<Produit[], Error>({
    queryKey: ['produits', showInactifs],
    queryFn: async () => {
      try {
        let query = supabase.from('produits').select('*, categorie:categories(*)').order('nom');
        if (!showInactifs) query = query.eq('actif', true);
        const { data, error } = await query;
        if (error) throw error;
        return data as Produit[];
      } catch {
        const cached = await getData<Produit[]>('produits');
        if (cached) return cached.filter((p: Produit) => showInactifs ? true : p.actif);
        throw new Error('Impossible de charger les produits');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useProduit = (id?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Produit | null, Error>({
    queryKey: ['produit', id],
    queryFn: async () => {
      if (!id) return null;
      try {
        const { data, error } = await supabase.from('produits').select('*, categorie:categories(*)').eq('id', id).single();
        if (error) throw error;
        return data as Produit;
      } catch {
        const cached = await getData<Produit[]>('produits');
        if (cached) return cached.find((p: Produit) => p.id === id) || null;
        throw new Error('Produit introuvable');
      }
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCategories = () => {
  const { getData } = useDataLoader();
  return useQuery<Categorie[], Error>({
    queryKey: ['categories'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase.from('categories').select('*').order('nom');
        if (error) throw error;
        return data as Categorie[];
      } catch {
        const cached = await getData<Categorie[]>('categories');
        if (cached) return cached;
        throw new Error('Impossible de charger les catégories');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

const createMouvement = async (data: any) => {
  const userId = (await supabase.auth.getUser()).data.user?.id;
  const { error } = await supabase.from('mouvements_stock').insert([{ ...data, utilisateur_id: userId }]);
  if (error) throw error;
};

export const useCreateProduit = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: ProduitFormData): Promise<Produit> => {
    const { data: inserted, error } = await supabase.from('produits').insert([{ ...data, actif: true }]).select().single();
    if (error) throw error;
    if (data.quantite > 0) {
      await createMouvement({
        produit_id: inserted.id,
        type: 'entree',
        quantite: data.quantite,
        ancienne_quantite: 0,
        nouvelle_quantite: data.quantite,
        motif: 'Création du produit',
        magasin_id: data.magasin_id || undefined,
        entrepot_id: data.entrepot_id || undefined,
      });
    }
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('produits');
        queryClient.invalidateQueries('produit');
        success('Produit créé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de création');
      },
    },
    '/api/produits',
    'POST'
  );
};

export const useUpdateProduit = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<ProduitFormData> }): Promise<Produit> => {
    const { data: oldProduit } = await supabase.from('produits').select('quantite, magasin_id, entrepot_id').eq('id', id).single();
    const { data: updated, error } = await supabase.from('produits').update(data).eq('id', id).select().single();
    if (error) throw error;
    if (oldProduit) {
      if (data.quantite !== undefined && data.quantite !== oldProduit.quantite) {
        const diff = data.quantite - oldProduit.quantite;
        await createMouvement({
          produit_id: id,
          type: diff > 0 ? 'entree' : 'sortie',
          quantite: Math.abs(diff),
          ancienne_quantite: oldProduit.quantite,
          nouvelle_quantite: data.quantite,
          motif: 'Modification de quantité',
          magasin_id: data.magasin_id || undefined,
          entrepot_id: data.entrepot_id || undefined,
        });
      }
      if (data.magasin_id !== undefined && data.magasin_id !== oldProduit.magasin_id) {
        await createMouvement({
          produit_id: id,
          type: 'transfert_magasin',
          quantite: updated.quantite,
          ancienne_quantite: oldProduit.quantite,
          nouvelle_quantite: updated.quantite,
          motif: `Transfert magasin: ${oldProduit.magasin_id || 'aucun'} -> ${data.magasin_id || 'aucun'}`,
          magasin_id: data.magasin_id || undefined,
          entrepot_id: data.entrepot_id || undefined,
        });
      }
      if (data.entrepot_id !== undefined && data.entrepot_id !== oldProduit.entrepot_id) {
        await createMouvement({
          produit_id: id,
          type: 'transfert_entrepot',
          quantite: updated.quantite,
          ancienne_quantite: oldProduit.quantite,
          nouvelle_quantite: updated.quantite,
          motif: `Transfert entrepôt: ${oldProduit.entrepot_id || 'aucun'} -> ${data.entrepot_id || 'aucun'}`,
          magasin_id: data.magasin_id || undefined,
          entrepot_id: data.entrepot_id || undefined,
        });
      }
    }
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('produits');
        queryClient.invalidateQueries('produit');
        success('Produit mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de mise à jour');
      },
    },
    '/api/produits',
    'PUT'
  );
};

export const useRetirerProduit = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { data: produit } = await supabase.from('produits').select('quantite, magasin_id, entrepot_id').eq('id', id).single();
    const { error } = await supabase.from('produits').update({ actif: false }).eq('id', id);
    if (error) throw error;
    if (produit && produit.quantite > 0) {
      await createMouvement({
        produit_id: id,
        type: 'sortie',
        quantite: produit.quantite,
        ancienne_quantite: produit.quantite,
        nouvelle_quantite: 0,
        motif: 'Produit retiré du catalogue',
        magasin_id: produit.magasin_id || undefined,
        entrepot_id: produit.entrepot_id || undefined,
      });
    }
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('produits');
        queryClient.invalidateQueries('produit');
        success('Produit retiré ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors du retrait');
      },
    },
    '/api/produits',
    'PATCH'
  );
};

export const useRestaurerProduit = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('produits').update({ actif: true }).eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('produits');
        queryClient.invalidateQueries('produit');
        success('Produit restauré ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la restauration');
      },
    },
    '/api/produits',
    'PATCH'
  );
};

export const useSupprimerProduit = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (produit: Produit): Promise<string> => {
    if (produit.image_url) {
      try {
        const url = new URL(produit.image_url);
        const path = url.pathname.split('/').slice(3).join('/');
        if (path) await supabase.storage.from('logos').remove([path]);
      } catch {}
    }
    // ⚠️ FIX : la table "tarifications" référence produits.id via
    // tarifications_produit_id_fkey. Sans ça, Postgres refuse la
    // suppression du produit avec :
    // "update or delete on table "produits" violates foreign key
    //  constraint "tarifications_produit_id_fkey" on table "tarifications""
    const { error: tarifError } = await supabase.from('tarifications').delete().eq('produit_id', produit.id);
    if (tarifError) throw tarifError;

    const { error } = await supabase.from('produits').delete().eq('id', produit.id);
    if (error) throw error;
    return produit.id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries('produits');
        queryClient.invalidateQueries('produit');
        // Les tarifications du produit ont été supprimées en base (voir
        // mutationFn ci-dessus) : on invalide aussi leur cache React Query
        // pour que les pages Négociation/Promotions ne gardent pas les
        // anciennes lignes affichées.
        queryClient.invalidateQueries('tarifications');
        success('Produit supprimé définitivement ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la suppression définitive');
      },
    },
    '/api/produits',
    'DELETE'
  );
};

export const useCreateCategorie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (data: Partial<Categorie>): Promise<Categorie> => {
    const { data: inserted, error } = await supabase.from('categories').insert([data]).select().single();
    if (error) throw error;
    return inserted;
  };
  return useMutation(mutationFn, {
    onSuccess: () => { queryClient.invalidateQueries('categories'); success('Catégorie créée ✅'); },
    onError: (err: any) => { toastError(err.message || 'Erreur de création'); },
  });
};

export const useUpdateCategorie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async ({ id, data }: { id: string; data: Partial<Categorie> }): Promise<Categorie> => {
    const { data: updated, error } = await supabase.from('categories').update(data).eq('id', id).select().single();
    if (error) throw error;
    return updated;
  };
  return useMutation(mutationFn, {
    onSuccess: () => { queryClient.invalidateQueries('categories'); success('Catégorie mise à jour ✅'); },
    onError: (err: any) => { toastError(err.message || 'Erreur de mise à jour'); },
  });
};

export const useDeleteCategorie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase.from('categories').delete().eq('id', id);
    if (error) throw error;
    return id;
  };
  return useMutation(mutationFn, {
    onSuccess: () => { queryClient.invalidateQueries('categories'); success('Catégorie supprimée ✅'); },
    onError: (err: any) => { toastError(err.message || 'Erreur de suppression'); },
  });
};

export const useProduitsFilters = () => {
  const { value: filters, setValue: setFilters } = useLocalStorage<{ categorie?: string; search?: string }>('produits_filters', {});
  return { filters, setFilters };
};
