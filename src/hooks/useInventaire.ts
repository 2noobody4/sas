import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { SessionInventaire, SessionInventaireFormData, LigneInventaire, Produit, StatutInventaire } from '../types/stock';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';

// ============================================================
// SESSIONS INVENTAIRE
// ============================================================

export const useSessionsInventaire = () => {
  const { getData } = useDataLoader();
  return useQuery<SessionInventaire[], Error>({
    queryKey: ['sessions_inventaire'],
    queryFn: async () => {
      try {
        const { data, error } = await supabase
          .from('sessions_inventaire')
          .select('*, utilisateur:utilisateur_id(id, nom, prenom, email)')
          .order('date_debut', { ascending: false });
        if (error) throw error;
        return data as SessionInventaire[];
      } catch {
        const cached = await getData<SessionInventaire[]>('sessions_inventaire');
        if (cached) return cached;
        throw new Error('Impossible de charger les sessions');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useSessionInventaire = (id?: string) => {
  return useQuery<SessionInventaire | null, Error>({
    queryKey: ['session_inventaire', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('sessions_inventaire')
        .select('*, utilisateur:utilisateur_id(id, nom, prenom, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as SessionInventaire;
    },
    enabled: !!id,
  });
};

export const useSessionInventaireActive = () => {
  return useQuery<SessionInventaire | null, Error>({
    queryKey: ['session_inventaire_active'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('sessions_inventaire')
        .select('*, utilisateur:utilisateur_id(id, nom, prenom, email)')
        .in('statut', ['ouverte', 'en_cours'])
        .maybeSingle();
      if (error && error.code !== 'PGRST116') throw error;
      return data as SessionInventaire | null;
    },
    staleTime: 1000 * 30,
    cacheTime: 1000 * 60 * 60,
  });
};

export const useCreateSessionInventaire = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: SessionInventaireFormData): Promise<SessionInventaire> => {
    // Vérifier s'il y a une session en cours
    const { data: existing } = await supabase
      .from('sessions_inventaire')
      .select('id')
      .in('statut', ['ouverte', 'en_cours'])
      .maybeSingle();

    if (existing) {
      throw new Error('Une session d\'inventaire est déjà en cours. Veuillez la fermer d\'abord.');
    }

    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('sessions_inventaire')
      .insert([{
        nom: data.nom || `Inventaire du ${new Date().toLocaleDateString()}`,
        statut: 'ouverte',
        date_debut: new Date().toISOString(),
        utilisateur_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions_inventaire'] });
        queryClient.invalidateQueries({ queryKey: ['session_inventaire_active'] });
        success('Session d\'inventaire créée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la création');
      },
    },
    '/api/sessions_inventaire',
    'POST'
  );
};

export const useCloseSessionInventaire = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<SessionInventaire> => {
    const { data: updated, error } = await supabase
      .from('sessions_inventaire')
      .update({
        statut: 'validee',
        date_fin: new Date().toISOString(),
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions_inventaire'] });
        queryClient.invalidateQueries({ queryKey: ['session_inventaire_active'] });
        success('Session d\'inventaire fermée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la fermeture');
      },
    },
    '/api/sessions_inventaire',
    'PUT'
  );
};

export const useDeleteSessionInventaire = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('sessions_inventaire')
      .delete()
      .eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['sessions_inventaire'] });
        queryClient.invalidateQueries({ queryKey: ['session_inventaire_active'] });
        success('Session supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la suppression');
      },
    },
    '/api/sessions_inventaire',
    'DELETE'
  );
};

// ============================================================
// LIGNES INVENTAIRE
// ============================================================

export const useLignesInventaire = (sessionId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<LigneInventaire[], Error>({
    queryKey: ['lignes_inventaire', sessionId],
    queryFn: async () => {
      if (!sessionId) return [];
      try {
        const { data, error } = await supabase
          .from('lignes_inventaire')
          .select('*, produit:produit_id(*)')
          .eq('session_id', sessionId)
          .order('created_at', { ascending: true });
        if (error) throw error;
        return data as LigneInventaire[];
      } catch {
        const cached = await getData<LigneInventaire[]>('lignes_inventaire');
        if (cached) return cached.filter(l => l.session_id === sessionId);
        throw new Error('Impossible de charger les lignes');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
    enabled: !!sessionId,
  });
};

export const useCreateLigneInventaire = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    sessionId,
    produitId,
    quantiteTheorique,
  }: {
    sessionId: string;
    produitId: string;
    quantiteTheorique: number;
  }): Promise<LigneInventaire> => {
    const { data: inserted, error } = await supabase
      .from('lignes_inventaire')
      .insert([{
        session_id: sessionId,
        produit_id: produitId,
        quantite_theorique: quantiteTheorique,
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lignes_inventaire'] });
        success('Ligne créée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la création');
      },
    },
    '/api/lignes_inventaire',
    'POST'
  );
};

export const useUpdateLigneInventaire = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    ligneId,
    quantiteReelle,
  }: {
    ligneId: string;
    quantiteReelle: number;
  }): Promise<LigneInventaire> => {
    // Récupérer la ligne pour calculer l'écart
    const { data: ligne } = await supabase
      .from('lignes_inventaire')
      .select('quantite_theorique')
      .eq('id', ligneId)
      .single();

    if (!ligne) throw new Error('Ligne introuvable');

    const ecart = ligne.quantite_theorique - quantiteReelle;

    const { data: updated, error } = await supabase
      .from('lignes_inventaire')
      .update({
        quantite_reelle: quantiteReelle,
        ecart: ecart,
        updated_at: new Date().toISOString(),
      })
      .eq('id', ligneId)
      .select()
      .single();

    if (error) throw error;
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['lignes_inventaire'] });
        success('Quantité mise à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la mise à jour');
      },
    },
    '/api/lignes_inventaire',
    'PUT'
  );
};

// ============================================================
// PRODUITS NON ENCORE INVENTORIÉS
// ============================================================

export const useProduitsNonInventories = (sessionId?: string) => {
  const { data: allProduits = [], isLoading: produitsLoading } = useQuery<Produit[], Error>({
    queryKey: ['produits'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('produits')
        .select('*, categorie:categories(*)')
        .eq('actif', true)
        .order('nom');
      if (error) throw error;
      return data as Produit[];
    },
    staleTime: 1000 * 60 * 5,
  });

  const { data: lignes = [], isLoading: lignesLoading } = useLignesInventaire(sessionId);

  const produitsNonInventories = allProduits.filter((p: Produit) => {
    return !lignes.some((l: LigneInventaire) => l.produit_id === p.id);
  });

  return {
    data: produitsNonInventories,
    isLoading: produitsLoading || lignesLoading,
  };
};

// ============================================================
// RAPPORT D'INVENTAIRE
// ============================================================

export const useRapportInventaire = (sessionId?: string) => {
  const { data: session, isLoading: sessionLoading } = useSessionInventaire(sessionId);
  const { data: lignes = [], isLoading: lignesLoading } = useLignesInventaire(sessionId);

  const totalProduits = lignes.length;
  const comptes = lignes.filter(l => l.quantite_reelle !== null && l.quantite_reelle !== undefined).length;
  const avecEcart = lignes.filter(l => l.ecart !== null && l.ecart !== undefined && l.ecart !== 0).length;
  const sansEcart = lignes.filter(l => l.ecart === 0).length;
  const ecartTotal = lignes.reduce((acc, l) => acc + (l.ecart || 0), 0);

  return {
    session,
    lignes,
    totalProduits,
    comptes,
    avecEcart,
    sansEcart,
    ecartTotal,
    isLoading: sessionLoading || lignesLoading,
  };
};
