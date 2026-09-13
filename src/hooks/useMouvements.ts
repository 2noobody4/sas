import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { MouvementStock } from '../types/stock';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useOfflineMutation } from './useOfflineMutation';
import { useComptabiliserAchat } from './useComptabilisation';

export const useMouvements = (filters?: { produit_id?: string; type?: string; date_debut?: string; date_fin?: string }) => {
  const { getData } = useDataLoader();
  return useQuery<MouvementStock[], Error>({
    queryKey: ['mouvements', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('mouvements_stock')
          .select('*, produit:produits(*)')
          .order('date_mouvement', { ascending: false });
        if (filters?.produit_id) query = query.eq('produit_id', filters.produit_id);
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.date_debut) query = query.gte('date_mouvement', filters.date_debut);
        if (filters?.date_fin) query = query.lte('date_mouvement', filters.date_fin);
        const { data, error } = await query;
        if (error) throw error;
        return data as MouvementStock[];
      } catch {
        const cached = await getData<MouvementStock[]>('mouvements');
        if (cached) {
          let filtered = cached;
          if (filters?.produit_id) filtered = filtered.filter((m: MouvementStock) => m.produit_id === filters.produit_id);
          if (filters?.type) filtered = filtered.filter((m: MouvementStock) => m.type === filters.type);
          return filtered;
        }
        throw new Error('Impossible de charger les mouvements');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateMouvement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const comptabiliserAchat = useComptabiliserAchat();

  const mutationFn = async (data: {
    produit_id: string;
    type: MouvementStock['type'];
    quantite: number;
    ancienne_quantite?: number;
    nouvelle_quantite?: number;
    motif?: string;
    magasin_id?: string;
    entrepot_id?: string;
    provenance_id?: string;
    destination_id?: string;
    provenance_type?: 'magasin' | 'entrepot';
    destination_type?: 'magasin' | 'entrepot';
    reference_id?: string;
    reference_type?: string;
    date_mouvement?: string;
    prix_achat?: number; // pour la comptabilisation
  }): Promise<MouvementStock> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    
    const { data: inserted, error } = await supabase
      .from('mouvements_stock')
      .insert([{
        produit_id: data.produit_id,
        type: data.type,
        quantite: data.quantite,
        ancienne_quantite: data.ancienne_quantite || 0,
        nouvelle_quantite: data.nouvelle_quantite || 0,
        motif: data.motif || null,
        magasin_id: data.magasin_id || null,
        entrepot_id: data.entrepot_id || null,
        provenance_id: data.provenance_id || null,
        destination_id: data.destination_id || null,
        provenance_type: data.provenance_type || null,
        destination_type: data.destination_type || null,
        reference_id: data.reference_id || null,
        reference_type: data.reference_type || null,
        date_mouvement: data.date_mouvement || new Date().toISOString(),
        utilisateur_id: userId,
      }])
      .select()
      .single();
    
    if (error) throw error;

    // 🔥 COMPTABILISATION : Si c'est une entrée (achat/réapprovisionnement)
    if (data.type === 'entree' && userId) {
      try {
        // Récupérer le produit pour avoir son nom et prix
        const { data: produit } = await supabase
          .from('produits')
          .select('nom, prix_achat')
          .eq('id', data.produit_id)
          .single();

        if (produit) {
          const montant = (data.prix_achat || produit.prix_achat || 0) * data.quantite;
          
          if (montant > 0) {
            // Récupérer les comptes par défaut
            const { data: comptes } = await supabase
              .from('comptes')
              .select('id, numero')
              .in('numero', ['311000', '401000']);

            const compteStock = comptes?.find((c: any) => c.numero === '311000');
            const compteFournisseur = comptes?.find((c: any) => c.numero === '401000');

            if (compteStock && compteFournisseur) {
              await comptabiliserAchat.mutateAsync({
                mouvementId: inserted.id,
                montant: montant,
                compteDebitId: compteStock.id,
                compteCreditId: compteFournisseur.id,
                produitNom: produit.nom,
                userId: userId,
              });
            }
          }
        }
      } catch (comptaError) {
        console.error('[useCreateMouvement] Erreur comptabilisation:', comptaError);
      }
    }

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['mouvements'] });
        queryClient.invalidateQueries({ queryKey: ['produits'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Mouvement enregistré ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur');
      },
    },
    '/api/mouvements',
    'POST'
  );
};
