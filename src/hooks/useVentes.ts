import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Vente, VenteFormData } from '../types/caisse';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { logAction } from './useHistorique';
import { useOfflineMutation } from './useOfflineMutation';
import { useComptabiliserVente } from './useComptabilisation';
import { annulerTransactionsParReference } from './useAnnulationTransaction';

export const useVentes = (sessionId?: string) => {
  const { getData } = useDataLoader();
  return useQuery<Vente[], Error>({
    queryKey: ['ventes', sessionId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('ventes')
          .select('*, session:session_id(*), client:client_id(*), caissier:caissier_id(*), lignes:lignes_vente(*, produit:produit_id(*))')
          .order('date_vente', { ascending: false })
          .limit(500);
        if (sessionId) query = query.eq('session_id', sessionId);
        const { data, error } = await query;
        if (error) throw error;
        return data as Vente[];
      } catch {
        const cached = await getData<Vente[]>('ventes');
        if (cached) return sessionId ? cached.filter((v: Vente) => v.session_id === sessionId) : cached;
        throw new Error('Impossible de charger les ventes');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useVente = (id?: string) => {
  return useQuery<Vente | null, Error>({
    queryKey: ['vente', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('ventes')
        .select('*, session:session_id(*), client:client_id(*), caissier:caissier_id(*), lignes:lignes_vente(*, produit:produit_id(*)), paiements:paiements(*)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Vente;
    },
    enabled: !!id,
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateVente = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();
  const comptabiliserVente = useComptabiliserVente();

  const mutationFn = async (data: VenteFormData): Promise<Vente> => {
    // 1. Vérifier la session
    const { data: session } = await supabase
      .from('sessions_caisse')
      .select('statut')
      .eq('id', data.session_id)
      .single();
    if (!session || session.statut !== 'ouverte') {
      throw new Error('La session est fermée');
    }

    // 2. Charger TOUS les produits en une seule requête (fix N+1)
    const produitIds = data.lignes.map((l) => l.produit_id);
    const { data: produits, error: produitsError } = await supabase
      .from('produits')
      .select('id, quantite, prix_vente, magasin_id, entrepot_id')
      .in('id', produitIds);

    if (produitsError) throw produitsError;

    const produitsMap = new Map<string, any>(
      (produits || []).map((p: any) => [p.id, p])
    );

    // 3. Valider stocks + préparer les lignes
    let montantTotal = 0;
    const lignes: any[] = [];
    for (const ligne of data.lignes) {
      const produit = produitsMap.get(ligne.produit_id);
      if (!produit) throw new Error(`Produit ${ligne.produit_id} introuvable`);
      if (produit.quantite < ligne.quantite) {
        throw new Error(`Stock insuffisant pour ${produit.id.slice(0, 8)}. Disponible: ${produit.quantite}`);
      }
      const prix_unitaire = ligne.prix_unitaire || produit.prix_vente;
      const remise_ligne = ligne.remise_ligne || 0;
      const total_ligne = (prix_unitaire - remise_ligne) * ligne.quantite;
      montantTotal += total_ligne;
      lignes.push({
        produit_id: ligne.produit_id,
        quantite: ligne.quantite,
        prix_unitaire,
        remise_ligne,
      });
    }

    const remiseTotale = data.remise || 0;
    montantTotal = montantTotal - remiseTotale;
    const caissierId = (await supabase.auth.getUser()).data.user?.id;
    if (!caissierId) throw new Error('Utilisateur non authentifié');

    // 4. Créer la vente
    const { data: vente, error: venteError } = await supabase
      .from('ventes')
      .insert([{
        session_id: data.session_id,
        client_id: data.client_id || null,
        caissier_id: caissierId,
        montant_total: montantTotal,
        remise: remiseTotale,
        statut: 'validee',
        date_vente: new Date().toISOString(),
      }])
      .select()
      .single();
    if (venteError) throw venteError;

    // 5. Ajouter les lignes de vente (en un seul insert)
    const lignesWithVente = lignes.map((l: any) => ({ ...l, vente_id: vente.id }));
    const { error: lignesError } = await supabase.from('lignes_vente').insert(lignesWithVente);
    if (lignesError) throw lignesError;

    // 6. Mettre à jour les stocks + créer les mouvements (en batch)
    const mouvementsToInsert: any[] = [];
    const updatePromises: Promise<any>[] = [];

    for (const ligne of data.lignes) {
      const produitActuel = produitsMap.get(ligne.produit_id);
      if (!produitActuel) continue;

      const nouvelleQuantite = produitActuel.quantite - ligne.quantite;

      updatePromises.push(
        supabase
          .from('produits')
          .update({ quantite: nouvelleQuantite })
          .eq('id', ligne.produit_id)
          .then((res: any) => { if (res.error) throw res.error; })
      );

      mouvementsToInsert.push({
        produit_id: ligne.produit_id,
        type: 'vente',
        quantite: ligne.quantite,
        ancienne_quantite: produitActuel.quantite,
        nouvelle_quantite: nouvelleQuantite,
        motif: `Vente n°${vente.id.slice(0, 8)}`,
        magasin_id: produitActuel.magasin_id,
        entrepot_id: produitActuel.entrepot_id,
        reference_id: vente.id,
        reference_type: 'vente',
        date_mouvement: new Date().toISOString(),
        utilisateur_id: caissierId,
      });
    }

    // Exécuter les updates en parallèle
    await Promise.all(updatePromises);

    // Insérer tous les mouvements en un seul insert
    if (mouvementsToInsert.length > 0) {
      const { error: mvtError } = await supabase
        .from('mouvements_stock')
        .insert(mouvementsToInsert);
      if (mvtError) throw mvtError;
    }

    // 7. Ajouter les paiements (en un seul insert)
    if (data.paiements && data.paiements.length > 0) {
      const paiementsWithVente = data.paiements.map((p: any) => ({ ...p, vente_id: vente.id }));
      const { error: paiementsError } = await supabase.from('paiements').insert(paiementsWithVente);
      if (paiementsError) throw paiementsError;
    }

    // 8. Comptabilisation
    // ⚠️ NOTE : ce bloc ne s'exécute QUE si on est en ligne, car `useOfflineMutation`
    // court-circuite entièrement le mutationFn en offline. La queue enregistre
    // alors la vente brute sur /api/ventes (endpoint à implémenter côté serveur).
    try {
      const moyenPaiement = data.paiements?.[0]?.moyen || 'especes';

      let compteDebitId = (data as any).compte_debit_id;
      let compteCreditId = (data as any).compte_credit_id;

      if (!compteDebitId || !compteCreditId) {
        const { data: comptes } = await supabase
          .from('comptes')
          .select('id, numero')
          .in('numero', ['571000', '521000', '701000']);

        const compteCaisse = comptes?.find((c: any) => c.numero === '571000');
        const compteBanque = comptes?.find((c: any) => c.numero === '521000');
        const compteVente = comptes?.find((c: any) => c.numero === '701000');

        if (moyenPaiement === 'especes' && compteCaisse) {
          compteDebitId = compteCaisse.id;
        } else if (compteBanque) {
          compteDebitId = compteBanque.id;
        }
        if (compteVente) compteCreditId = compteVente.id;
      }

      if (compteDebitId && compteCreditId) {
        await comptabiliserVente.mutateAsync({
          venteId: vente.id,
          montant: montantTotal,
          compteDebitId,
          compteCreditId,
          moyenPaiement,
          sessionId: data.session_id,
          userId: caissierId,
        });
      }
    } catch (comptaError) {
      console.error('[useCreateVente] Erreur comptabilisation:', comptaError);
    }

    // 9. Récupérer la vente complète
    const { data: venteComplete, error: fetchError } = await supabase
      .from('ventes')
      .select('*, session:session_id(*), client:client_id(*), caissier:caissier_id(*), lignes:lignes_vente(*, produit:produit_id(*)), paiements:paiements(*)')
      .eq('id', vente.id)
      .single();
    if (fetchError) throw fetchError;

    try { await logAction(caissierId, 'caisse', 'create', 'vente', vente.id, null, venteComplete); } catch (e) {}
    return venteComplete as Vente;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ventes'] });
        queryClient.invalidateQueries({ queryKey: ['session_caisse_active'] });
        queryClient.invalidateQueries({ queryKey: ['produits'] });
        queryClient.invalidateQueries({ queryKey: ['mouvements'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Vente enregistrée et comptabilisée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de la création');
      },
    },
    '/api/ventes',
    'POST'
  );
};

export const useAnnulerVente = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<Vente> => {
    const { data: vente, error: fetchError } = await supabase
      .from('ventes')
      .select('*, lignes:lignes_vente(*), caissier_id')
      .eq('id', id)
      .single();
    if (fetchError) throw fetchError;

    const lignes = vente.lignes || [];

    // 1. Charger TOUS les produits en une seule requête (fix N+1)
    const produitIds = lignes.map((l: any) => l.produit_id);
    const { data: produits, error: produitsError } = await supabase
      .from('produits')
      .select('id, quantite')
      .in('id', produitIds);

    if (produitsError) throw produitsError;

    const produitsMap = new Map<string, any>(
      (produits || []).map((p: any) => [p.id, p])
    );

    // 2. Préparer les updates + mouvements
    const mouvementsToInsert: any[] = [];
    const updatePromises: Promise<any>[] = [];

    for (const ligne of lignes) {
      const produit = produitsMap.get(ligne.produit_id);
      if (!produit) continue;

      const nouvelleQuantite = produit.quantite + ligne.quantite;

      updatePromises.push(
        supabase
          .from('produits')
          .update({ quantite: nouvelleQuantite })
          .eq('id', ligne.produit_id)
          .then((res: any) => { if (res.error) throw res.error; })
      );

      mouvementsToInsert.push({
        produit_id: ligne.produit_id,
        type: 'entree',
        quantite: ligne.quantite,
        ancienne_quantite: produit.quantite,
        nouvelle_quantite: nouvelleQuantite,
        motif: `Annulation vente ${id.slice(0, 8)}`,
        reference_id: id,
        reference_type: 'annulation_vente',
        date_mouvement: new Date().toISOString(),
      });
    }

    await Promise.all(updatePromises);

    if (mouvementsToInsert.length > 0) {
      const { error: mvtError } = await supabase
        .from('mouvements_stock')
        .insert(mouvementsToInsert);
      if (mvtError) throw mvtError;
    }

    // 3. Annuler la vente
    const { data: updated, error } = await supabase
      .from('ventes')
      .update({ statut: 'annulee' })
      .eq('id', id)
      .select()
      .single();
    if (error) throw error;

    // 4. Annuler les transactions comptables liées
    await annulerTransactionsParReference(id, ['vente']);

    if (vente.caissier_id) {
      try { await logAction(vente.caissier_id, 'caisse', 'cancel', 'vente', id, vente, updated); } catch (e) {}
    }
    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ventes'] });
        queryClient.invalidateQueries({ queryKey: ['produits'] });
        queryClient.invalidateQueries({ queryKey: ['mouvements'] });
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Vente annulée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur lors de l\'annulation');
      },
    },
    '/api/ventes',
    'PUT'
  );
};
