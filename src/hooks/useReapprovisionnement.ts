/**
 * useReapprovisionnement – Hook pour gérer le réapprovisionnement des produits
 * Compatible React 16.14
 */

import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './useToast';
import { useComptabiliserAchat } from './useComptabilisation';

interface ReapprovisionnementData {
  produitId: string;
  quantite: number;
  prixAchat: number;
  prixVente: number;
  seuilAlerte: number;
}

export const useReapprovisionnement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const comptabiliserAchat = useComptabiliserAchat();

  return useMutation({
    mutationFn: async (data: ReapprovisionnementData) => {
      const { produitId, quantite, prixAchat, prixVente, seuilAlerte } = data;
      const userId = (await supabase.auth.getUser()).data.user?.id;

      // 1. Récupérer le produit actuel
      const { data: produit, error: produitError } = await supabase
        .from('produits')
        .select('nom, quantite, seuil_alerte, prix_achat')
        .eq('id', produitId)
        .single();

      if (produitError) throw produitError;

      const nouvelleQuantite = produit.quantite + quantite;

      // 2. Vérifier que le seuil ≤ nouvelle quantité
      if (seuilAlerte > nouvelleQuantite) {
        throw new Error(`Le seuil d'alerte (${seuilAlerte}) ne peut pas dépasser la quantité totale (${nouvelleQuantite})`);
      }

      // 3. Fermer l'ancienne tarification active
      const { error: closeError } = await supabase
        .from('tarifications')
        .update({ date_fin: new Date().toISOString() })
        .eq('produit_id', produitId)
        .is('date_fin', null);

      if (closeError) throw closeError;

      // 4. Créer la nouvelle tarification
      const { error: tarifError } = await supabase
        .from('tarifications')
        .insert([{
          produit_id: produitId,
          prix_achat: prixAchat,
          prix_vente: prixVente,
          seuil_alerte: seuilAlerte,
        }]);

      if (tarifError) throw tarifError;

      // 5. Mettre à jour le produit
      const { error: updateError } = await supabase
        .from('produits')
        .update({
          quantite: nouvelleQuantite,
          prix_achat: prixAchat,
          prix_vente: prixVente,
          seuil_alerte: produit.seuil_alerte || seuilAlerte,
        })
        .eq('id', produitId);

      if (updateError) throw updateError;

      // 6. Créer le mouvement de stock
      const { data: mouvement, error: mouvementError } = await supabase
        .from('mouvements_stock')
        .insert([{
          produit_id: produitId,
          type: 'entree',
          quantite: quantite,
          ancienne_quantite: produit.quantite,
          nouvelle_quantite: nouvelleQuantite,
          motif: `Réapprovisionnement (${prixAchat} FCFA)`,
          date_mouvement: new Date().toISOString(),
          utilisateur_id: userId,
        }])
        .select()
        .single();

      if (mouvementError) throw mouvementError;

      // 7. 🔥 COMPTABILISATION
      if (userId) {
        try {
          const montant = prixAchat * quantite;
          
          if (montant > 0) {
            const { data: comptes } = await supabase
              .from('comptes')
              .select('id, numero')
              .in('numero', ['311000', '401000']);

            const compteStock = comptes?.find((c: any) => c.numero === '311000');
            const compteFournisseur = comptes?.find((c: any) => c.numero === '401000');

            if (compteStock && compteFournisseur) {
              await comptabiliserAchat.mutateAsync({
                mouvementId: mouvement.id,
                montant: montant,
                compteDebitId: compteStock.id,
                compteCreditId: compteFournisseur.id,
                produitNom: produit.nom,
                userId: userId,
              });
            }
          }
        } catch (comptaError) {
          console.error('[useReapprovisionnement] Erreur comptabilisation:', comptaError);
        }
      }

      return { nouvelleQuantite };
    },
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['produits'] });
      queryClient.invalidateQueries({ queryKey: ['produit'] });
      queryClient.invalidateQueries({ queryKey: ['mouvements'] });
      queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
      queryClient.invalidateQueries({ queryKey: ['comptes'] });
      success('Produit réapprovisionné ✅');
    },
    onError: (err: any) => {
      toastError(err.message || 'Erreur lors du réapprovisionnement');
    },
  });
};
