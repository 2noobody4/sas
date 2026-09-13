/**
 * useComptabilisation – Hooks pour la comptabilisation des opérations
 * Compatible React 16.14
 */

import { useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './useToast';
import { useOfflineMutation } from './useOfflineMutation';

interface ComptabiliserVenteParams {
  venteId: string;
  montant: number;
  compteDebitId: string;
  compteCreditId: string;
  moyenPaiement: string;
  sessionId: string;
  userId: string;
}

// ============================================================
// COMPTABILISER UNE VENTE
// ============================================================

export const useComptabiliserVente = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (params: ComptabiliserVenteParams): Promise<any> => {
    const { 
      venteId, 
      montant, 
      compteDebitId, 
      compteCreditId, 
      moyenPaiement, 
      sessionId, 
      userId 
    } = params;

    if (!compteDebitId || !compteCreditId) {
      throw new Error('Les comptes débit et crédit sont obligatoires');
    }

    const libelle = `Vente n°${venteId.slice(0, 8)} - ${moyenPaiement} - Session ${sessionId.slice(0, 6)}`;

    // 1. Créer la transaction comptable
    const { data: inserted, error } = await supabase
      .from('transactions_comptables')
      .insert([{
        date_transaction: new Date().toISOString(),
        libelle,
        montant,
        compte_debit_id: compteDebitId,
        compte_credit_id: compteCreditId,
        reference: venteId,
        type: 'vente',
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Mettre à jour les soldes des comptes
    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteDebitId, 
      p_montant: montant, 
      p_sens: 'debit' 
    });

    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteCreditId, 
      p_montant: montant, 
      p_sens: 'credit' 
    });

    // 3. Lier la transaction à la vente
    await supabase
      .from('ventes')
      .update({ transaction_id: inserted.id })
      .eq('id', venteId);

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['ventes'] });
      },
      onError: (err: any) => {
        console.error('[useComptabiliserVente] Erreur:', err);
        toastError(err.message || 'Erreur lors de la comptabilisation');
      },
    },
    '/api/transactions_comptables',
    'POST'
  );
};

// ============================================================
// COMPTABILISER UNE CHARGE
// ============================================================

interface ComptabiliserChargeParams {
  saisieId: string;
  montant: number;
  compteDebitId: string;
  compteCreditId: string;
  type: 'depense' | 'salaire' | 'ajustement' | 'autre';
  libelle: string;
  userId: string;
}

export const useComptabiliserCharge = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (params: ComptabiliserChargeParams): Promise<any> => {
    const { saisieId, montant, compteDebitId, compteCreditId, type, libelle, userId } = params;

    if (!compteDebitId || !compteCreditId) {
      throw new Error('Les comptes débit et crédit sont obligatoires');
    }

    const transactionType = type === 'salaire' ? 'salaire' : 'depense';

    const { data: inserted, error } = await supabase
      .from('transactions_comptables')
      .insert([{
        date_transaction: new Date().toISOString(),
        libelle: `${libelle} - ${type}`,
        montant,
        compte_debit_id: compteDebitId,
        compte_credit_id: compteCreditId,
        reference: saisieId,
        type: transactionType,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteDebitId, 
      p_montant: montant, 
      p_sens: 'debit' 
    });

    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteCreditId, 
      p_montant: montant, 
      p_sens: 'credit' 
    });

    await supabase
      .from('saisies_comptables')
      .update({ transaction_id: inserted.id })
      .eq('id', saisieId);

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['saisies_comptables'] });
      },
      onError: (err: any) => {
        console.error('[useComptabiliserCharge] Erreur:', err);
        toastError(err.message || 'Erreur lors de la comptabilisation');
      },
    },
    '/api/transactions_comptables',
    'POST'
  );
};

// ============================================================
// COMPTABILISER UN RÉAPPROVISIONNEMENT
// ============================================================

interface ComptabiliserAchatParams {
  mouvementId: string;
  montant: number;
  compteDebitId: string;
  compteCreditId: string;
  produitNom: string;
  userId: string;
  fournisseurId?: string;
}

export const useComptabiliserAchat = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (params: ComptabiliserAchatParams): Promise<any> => {
    const { mouvementId, montant, compteDebitId, compteCreditId, produitNom, userId, fournisseurId } = params;

    if (!compteDebitId || !compteCreditId) {
      throw new Error('Les comptes débit et crédit sont obligatoires');
    }

    const libelle = `Achat ${produitNom}${fournisseurId ? ` - Fournisseur ${fournisseurId.slice(0, 6)}` : ''}`;

    const { data: inserted, error } = await supabase
      .from('transactions_comptables')
      .insert([{
        date_transaction: new Date().toISOString(),
        libelle,
        montant,
        compte_debit_id: compteDebitId,
        compte_credit_id: compteCreditId,
        reference: mouvementId,
        type: 'achat',
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;

    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteDebitId, 
      p_montant: montant, 
      p_sens: 'debit' 
    });

    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteCreditId, 
      p_montant: montant, 
      p_sens: 'credit' 
    });

    await supabase
      .from('mouvements_stock')
      .update({ transaction_id: inserted.id })
      .eq('id', mouvementId);

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['mouvements'] });
      },
      onError: (err: any) => {
        console.error('[useComptabiliserAchat] Erreur:', err);
        toastError(err.message || 'Erreur lors de la comptabilisation');
      },
    },
    '/api/transactions_comptables',
    'POST'
  );
};

export default {
  useComptabiliserVente,
  useComptabiliserCharge,
  useComptabiliserAchat,
};

// ============================================================
// COMPTABILISER UNE FACTURE
// ============================================================

interface ComptabiliserFactureParams {
  factureId: string;
  montant: number;
  compteDebitId: string;
  compteCreditId: string;
  type: 'emise' | 'recue';
  libelle: string;
  userId: string;
  clientId?: string;
  fournisseurId?: string;
}

export const useComptabiliserFacture = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (params: ComptabiliserFactureParams): Promise<any> => {
    const { 
      factureId, 
      montant, 
      compteDebitId, 
      compteCreditId, 
      type, 
      libelle, 
      userId,
      clientId,
      fournisseurId
    } = params;

    if (!compteDebitId || !compteCreditId) {
      throw new Error('Les comptes débit et crédit sont obligatoires');
    }

    // Déterminer le type de transaction
    const transactionType = type === 'emise' ? 'facture_client' : 'facture_fournisseur';
    const libelleComplet = `${type === 'emise' ? 'Facture client' : 'Facture fournisseur'} ${libelle}`;

    // 1. Créer la transaction comptable
    const { data: inserted, error } = await supabase
      .from('transactions_comptables')
      .insert([{
        date_transaction: new Date().toISOString(),
        libelle: libelleComplet,
        montant,
        compte_debit_id: compteDebitId,
        compte_credit_id: compteCreditId,
        reference: factureId,
        type: transactionType,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Mettre à jour les soldes des comptes
    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteDebitId, 
      p_montant: montant, 
      p_sens: 'debit' 
    });

    await supabase.rpc('update_compte_solde', { 
      p_compte_id: compteCreditId, 
      p_montant: montant, 
      p_sens: 'credit' 
    });

    // 3. Lier la transaction à la facture
    await supabase
      .from('factures')
      .update({ transaction_id: inserted.id })
      .eq('id', factureId);

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['factures'] });
      },
      onError: (err: any) => {
        console.error('[useComptabiliserFacture] Erreur:', err);
        toastError(err.message || 'Erreur lors de la comptabilisation');
      },
    },
    '/api/transactions_comptables',
    'POST'
  );
};
