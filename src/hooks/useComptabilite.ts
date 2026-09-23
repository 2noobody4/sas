/**
 * useComptabilite – Hooks pour le module comptabilité
 * ------------------------------------------------------------
 * VERSION ALIGNÉE SUR LE SCHÉMA PARTAGÉ AVEC LES AUTRES MODULES.
 *
 * Tables utilisées (identiques à celles des autres modules) :
 *   - comptes
 *   - transactions_comptables
 *   - saisies_comptables
 *   - exercices            (et NON `exercices_comptables`, table inexistante)
 *
 * Colonnes retirées car absentes du schéma réel :
 *   - transactions_comptables.annulee / annulee_le / updated_at
 *   - exercices.resultat / updated_at
 * L'annulation d'une transaction est donc une suppression réelle,
 * précédée du contre-passement des soldes de comptes.
 *
 * Compatible React 16.14
 */

import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import {
  Compte,
  TransactionComptable,
  TransactionFormData,
  Exercice,
  ExerciceFormData,
  Bilan,
  CompteResultat,
  SaisieComptable,
  SaisieFormData,
} from '../types/comptabilite';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useMagasinActif } from '../contexts/MagasinActifContext';
import { useOfflineMutation } from './useOfflineMutation';
import { calculerBilanDepuisComptes } from './useComptabiliteRapports';
import { assertComptesDistincts } from '../utils/comptabiliteValidation';
import { finDeJournee } from '../lib/dates';

// 🔧 Bug corrigé : "Could not embed because more than one relationship was
// found for 'transactions_comptables' and 'compte_debit_id'". PostgREST ne
// pouvait pas choisir automatiquement quelle contrainte de clé étrangère
// utiliser pour la jointure raccourcie `compte_debit_id(*)`, et deviner le
// nom exact de la contrainte (`!nom_contrainte`) s'est révélé peu fiable.
// On évite donc complètement l'embed PostgREST : on récupère les comptes
// séparément et on les rattache manuellement en JS. Ça fonctionne quel que
// soit le nom réel des contraintes en base, sans configuration.
let _comptesMapCache: { at: number; magasinId: string | null; map: Map<string, Compte> } | null = null;

// 🔧 Point 12 : scopé par magasin actif. magasin_id = null = compte
// "partagé" (compat. avec les données existantes sans magasin_id).
const fetchComptesMap = async (magasinId: string | null = null): Promise<Map<string, Compte>> => {
  // Petit cache mémoire (5s) pour éviter de re-fetcher tous les comptes à
  // chaque ligne/transaction affichée dans la même fenêtre de rendu.
  if (_comptesMapCache && _comptesMapCache.magasinId === magasinId && Date.now() - _comptesMapCache.at < 5000) {
    return _comptesMapCache.map;
  }
  let query = supabase.from('comptes').select('*');
  if (magasinId) {
    query = query.or(`magasin_id.eq.${magasinId},magasin_id.is.null`);
  }
  const { data, error } = await query;
  if (error) {
    console.error('[fetchComptesMap] Erreur Supabase:', error);
    throw error;
  }
  const map = new Map<string, Compte>((data || []).map((c: Compte) => [c.id, c]));
  _comptesMapCache = { at: Date.now(), magasinId, map };
  return map;
};

// Rattache compte_debit / compte_credit à une ou plusieurs transactions,
// à partir d'une Map<id, Compte> déjà chargée.
function attachComptes<T extends { compte_debit_id?: string | null; compte_credit_id?: string | null }>(
  rows: T[],
  comptesMap: Map<string, Compte>
): (T & { compte_debit?: Compte; compte_credit?: Compte })[] {
  return rows.map((row) => ({
    ...row,
    compte_debit: row.compte_debit_id ? comptesMap.get(row.compte_debit_id) : undefined,
    compte_credit: row.compte_credit_id ? comptesMap.get(row.compte_credit_id) : undefined,
  }));
}

// ============================================================
// COMPTES
// ============================================================

export const useComptes = (actif?: boolean) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<Compte[], Error>({
    // 🔧 Point 12 : magasinActifId dans la clé -> refetch au changement de magasin.
    queryKey: ['comptes', actif, magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('comptes')
          .select('*')
          .order('numero');

        if (actif !== undefined) {
          query = query.eq('actif', actif);
        }
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as Compte[];
      } catch {
        const cached = await getData<Compte[]>('comptes');
        if (cached) return cached;
        throw new Error('Impossible de charger les comptes');
      }
    },
    staleTime: 1000 * 60 * 5,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCompte = (id?: string) => {
  return useQuery<Compte | null, Error>({
    queryKey: ['compte', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('comptes')
        .select('*')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Compte;
    },
    enabled: !!id,
  });
};

export const useCreateCompte = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: Omit<Compte, 'id' | 'created_at' | 'updated_at' | 'solde' | 'actif'>): Promise<Compte> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    const { data: inserted, error } = await supabase
      .from('comptes')
      .insert([{ ...data, solde: 0, actif: true, user_id: userId }])
      .select()
      .single();
    if (error) throw error;
    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Compte créé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de création');
      },
    },
    '/api/comptes',
    'POST'
  );
};

export const useUpdateCompte = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, data }: { id: string; data: Partial<Compte> }): Promise<Compte> => {
    const { data: updated, error } = await supabase
      .from('comptes')
      .update({ ...data, updated_at: new Date().toISOString() })
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
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Compte mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de mise à jour');
      },
    },
    '/api/comptes',
    'PUT'
  );
};

export const useDeleteCompte = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('comptes')
      .update({ actif: false, updated_at: new Date().toISOString() })
      .eq('id', id);
    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Compte désactivé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de suppression');
      },
    },
    '/api/comptes',
    'PATCH'
  );
};

// ============================================================
// TRANSACTIONS COMPTABLES (Table unique)
// ============================================================

export const useTransactions = (filters?: {
  date_debut?: string;
  date_fin?: string;
  type?: string;
  compte_id?: string;
  magasin_id?: string;
}) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  // 🔧 Point 12 : si l'appelant ne précise pas magasin_id explicitement,
  // on scope par défaut sur le magasin actif plutôt que de tout charger.
  const magasinId = filters?.magasin_id ?? magasinActifId;
  return useQuery<TransactionComptable[], Error>({
    queryKey: ['transactions_comptables', filters, magasinId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('transactions_comptables')
          .select('*')
          .order('date_transaction', { ascending: false });

        if (filters?.date_debut) query = query.gte('date_transaction', filters.date_debut);
        if (filters?.date_fin) query = query.lte('date_transaction', finDeJournee(filters.date_fin));
        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.compte_id) {
          query = query.or(`compte_debit_id.eq.${filters.compte_id},compte_credit_id.eq.${filters.compte_id}`);
        }
        if (magasinId) query = query.or(`magasin_id.eq.${magasinId},magasin_id.is.null`);

        const [{ data, error }, comptesMap] = await Promise.all([query, fetchComptesMap(magasinId ?? null)]);
        if (error) throw error;
        return attachComptes<TransactionComptable>((data || []) as TransactionComptable[], comptesMap) as TransactionComptable[];
      } catch (err: any) {
        // 🔧 Bug corrigé : l'erreur réelle (RLS, colonne manquante...)
        // n'était jamais loguée avant de tomber sur le cache hors-ligne
        // (ou sur un message générique) — impossible de diagnostiquer un
        // vrai problème de connexion/permissions depuis les logs.
        console.error('[useTransactions] Erreur Supabase:', err);
        const cached = await getData<TransactionComptable[]>('transactions_comptables');
        if (cached) return cached;
        throw new Error(err?.message || 'Impossible de charger les transactions');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useTransaction = (id?: string) => {
  return useQuery<TransactionComptable | null, Error>({
    queryKey: ['transaction_comptable', id],
    queryFn: async () => {
      if (!id) return null;
      const [{ data, error }, comptesMap] = await Promise.all([
        supabase.from('transactions_comptables').select('*').eq('id', id).single(),
        fetchComptesMap(),
      ]);
      if (error) throw error;
      return attachComptes<TransactionComptable>([data as TransactionComptable], comptesMap)[0] as TransactionComptable;
    },
    enabled: !!id,
  });
};

export const useCreateTransaction = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: TransactionFormData): Promise<TransactionComptable> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    // Vérifier que les comptes existent
    const { data: compteDebit } = await supabase
      .from('comptes')
      .select('id')
      .eq('id', data.compte_debit_id)
      .single();

    if (!compteDebit) throw new Error('Compte débit introuvable');

    const { data: compteCredit } = await supabase
      .from('comptes')
      .select('id')
      .eq('id', data.compte_credit_id)
      .single();

    if (!compteCredit) throw new Error('Compte crédit introuvable');

    // 🔧 Bug corrigé : rien n'empêchait de sélectionner le même compte en
    // débit et en crédit — voir comptabiliteValidation.ts.
    assertComptesDistincts(data.compte_debit_id, data.compte_credit_id);

    // 1. Créer la transaction
    const { data: inserted, error } = await supabase
      .from('transactions_comptables')
      .insert([{
        date_transaction: data.date_transaction || new Date().toISOString(),
        libelle: data.libelle,
        montant: data.montant,
        compte_debit_id: data.compte_debit_id,
        compte_credit_id: data.compte_credit_id,
        reference: data.reference || null,
        type: data.type,
        user_id: userId,
        magasin_id: data.magasin_id || null,
      }])
      .select()
      .single();

    if (error) throw error;

    // 2. Mettre à jour les soldes des comptes
    await supabase.rpc('update_compte_solde', {
      p_compte_id: data.compte_debit_id,
      p_montant: data.montant,
      p_sens: 'debit',
    });

    await supabase.rpc('update_compte_solde', {
      p_compte_id: data.compte_credit_id,
      p_montant: data.montant,
      p_sens: 'credit',
    });

    return inserted;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Transaction enregistrée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de création');
      },
    },
    '/api/transactions_comptables',
    'POST'
  );
};

export const useUpdateTransaction = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<TransactionFormData>;
  }): Promise<TransactionComptable> => {
    // Récupérer l'ancienne transaction pour ajuster les soldes
    const { data: oldTransaction } = await supabase
      .from('transactions_comptables')
      .select('*')
      .eq('id', id)
      .single();

    if (!oldTransaction) throw new Error('Transaction introuvable');

    // 🔧 Bug corrigé : même contrôle qu'à la création, appliqué aux
    // comptes finaux (nouvelle valeur si fournie, sinon l'ancienne).
    assertComptesDistincts(
      data.compte_debit_id ?? oldTransaction.compte_debit_id,
      data.compte_credit_id ?? oldTransaction.compte_credit_id
    );

    // Contre-passer l'ancienne écriture
    await supabase.rpc('update_compte_solde', {
      p_compte_id: oldTransaction.compte_debit_id,
      p_montant: -oldTransaction.montant,
      p_sens: 'debit',
    });

    await supabase.rpc('update_compte_solde', {
      p_compte_id: oldTransaction.compte_credit_id,
      p_montant: -oldTransaction.montant,
      p_sens: 'credit',
    });

    // Mettre à jour la transaction (pas de colonne updated_at sur cette table)
    const { data: updated, error } = await supabase
      .from('transactions_comptables')
      .update({ ...data })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;

    // Appliquer la nouvelle écriture
    await supabase.rpc('update_compte_solde', {
      p_compte_id: updated.compte_debit_id,
      p_montant: updated.montant,
      p_sens: 'debit',
    });

    await supabase.rpc('update_compte_solde', {
      p_compte_id: updated.compte_credit_id,
      p_montant: updated.montant,
      p_sens: 'credit',
    });

    return updated;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Transaction mise à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de mise à jour');
      },
    },
    '/api/transactions_comptables',
    'PUT'
  );
};

export const useDeleteTransaction = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    // Récupérer la transaction
    const { data: transaction } = await supabase
      .from('transactions_comptables')
      .select('*')
      .eq('id', id)
      .single();

    if (!transaction) throw new Error('Transaction introuvable');

    // Contre-passer les soldes puis supprimer réellement l'écriture
    await supabase.rpc('update_compte_solde', {
      p_compte_id: transaction.compte_debit_id,
      p_montant: -transaction.montant,
      p_sens: 'debit',
    });

    await supabase.rpc('update_compte_solde', {
      p_compte_id: transaction.compte_credit_id,
      p_montant: -transaction.montant,
      p_sens: 'credit',
    });

    const { error } = await supabase
      .from('transactions_comptables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['transactions_comptables'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        success('Transaction annulée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur d\'annulation');
      },
    },
    '/api/transactions_comptables',
    'PATCH'
  );
};

// ============================================================
// BILAN
// ============================================================

export const useBilan = (date?: string) => {
  return useQuery<Bilan, Error>({
    queryKey: ['bilan', date],
    queryFn: async () => {
      const dateBilan = date || new Date().toISOString().split('T')[0];
      const { data: comptes, error } = await supabase
        .from('comptes')
        .select('*')
        .eq('actif', true);

      // 🔧 Bug corrigé : l'erreur Supabase (RLS, colonne manquante...) était
      // ignorée — un échec de la requête (data: null, error: {...}) donnait
      // le même message générique "Comptes introuvables" qu'une base vide,
      // rendant le diagnostic impossible depuis l'interface.
      if (error) {
        console.error('[useBilan] Erreur Supabase:', error);
        throw new Error(error.message || 'Comptes introuvables');
      }
      if (!comptes) throw new Error('Comptes introuvables');

      const { actif, passif, detail } = calculerBilanDepuisComptes(comptes as Compte[]);

      return {
        date: dateBilan,
        detail,
        actif: {
          ...actif,
          total: actif.immobilisations + actif.stocks + actif.creances + actif.tresorerie,
        },
        passif: {
          ...passif,
          total: passif.capitaux_propres + passif.dettes_financieres + passif.dettes_circulantes,
        },
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================
// COMPTE DE RÉSULTAT
// ============================================================

export const useCompteResultat = (dateDebut?: string, dateFin?: string) => {
  return useQuery<CompteResultat, Error>({
    queryKey: ['compte_resultat', dateDebut, dateFin],
    queryFn: async () => {
      const debut = dateDebut || new Date(new Date().getFullYear(), 0, 1).toISOString().split('T')[0];
      const fin = dateFin || new Date().toISOString().split('T')[0];

      const { data: rawTransactions, error } = await supabase
        .from('transactions_comptables')
        .select('*')
        .gte('date_transaction', debut)
        .lte('date_transaction', finDeJournee(fin));

      // 🔧 Bug corrigé : même problème que useBilan — l'erreur Supabase
      // était ignorée, masquant la vraie cause (ex : RLS) derrière un
      // message générique "Transactions introuvables".
      if (error) {
        console.error('[useCompteResultat] Erreur Supabase:', error);
        throw new Error(error.message || 'Transactions introuvables');
      }
      if (!rawTransactions) throw new Error('Transactions introuvables');

      const comptesMap = await fetchComptesMap();
      const transactions = attachComptes<TransactionComptable>(rawTransactions as TransactionComptable[], comptesMap) as TransactionComptable[];

      const produits = { ventes: 0, subventions: 0, production_immobilisee: 0, autres_produits: 0, total: 0 };
      const charges = { achats: 0, services: 0, impots: 0, personnel: 0, frais_financiers: 0, dotations: 0, autres_charges: 0, total: 0 };

      transactions.forEach((t: TransactionComptable) => {
        const debit = t.compte_debit;
        const credit = t.compte_credit;
        const montant = t.montant;

        if (debit && debit.numero.startsWith('6')) {
          const num = debit.numero;
          // 🔧 Bug corrigé : ce report utilisait la numérotation SYSCOHADA
          // "manuel" (64=impôts, 66=personnel), alors que TOUT LE RESTE DE
          // L'APPLICATION (useRH, useVentes, useMouvements, ChargeFormPage,
          // les charges usuelles...) comptabilise systématiquement les
          // salaires sur 641000 et les impôts/taxes sur 645000. Résultat
          // concret : chaque salaire comptabilisé apparaissait ici comme
          // "Impôts et taxes", et "Charges de personnel" restait à 0.
          // '645' (impôts) doit donc être testé AVANT le préfixe '64'
          // générique (personnel), sinon il n'est jamais atteint.
          if (num.startsWith('60')) charges.achats += montant;
          else if (num.startsWith('61') || num.startsWith('62') || num.startsWith('63')) charges.services += montant;
          else if (num.startsWith('645')) charges.impots += montant;
          else if (num.startsWith('64')) charges.personnel += montant;
          else if (num.startsWith('67')) charges.frais_financiers += montant;
          else if (num.startsWith('68') || num.startsWith('69')) charges.dotations += montant;
          else charges.autres_charges += montant;
        } else if (credit && credit.numero.startsWith('7')) {
          const num = credit.numero;
          if (num.startsWith('70')) produits.ventes += montant;
          else if (num.startsWith('71')) produits.subventions += montant;
          else if (num.startsWith('72')) produits.production_immobilisee += montant;
          else produits.autres_produits += montant;
        }
      });

      produits.total = produits.ventes + produits.subventions + produits.production_immobilisee + produits.autres_produits;
      charges.total = charges.achats + charges.services + charges.impots + charges.personnel + charges.frais_financiers + charges.dotations + charges.autres_charges;

      return {
        date_debut: debut,
        date_fin: fin,
        produits,
        charges,
        resultat: produits.total - charges.total,
      };
    },
    staleTime: 1000 * 60 * 5,
  });
};

// ============================================================
// SAISIES COMPTABLES
// ============================================================

export const useSaisies = (filters?: { type?: string; statut?: string }) => {
  const { getData } = useDataLoader();
  const { magasinActifId } = useMagasinActif();
  return useQuery<SaisieComptable[], Error>({
    queryKey: ['saisies_comptables', filters, magasinActifId],
    queryFn: async () => {
      try {
        let query = supabase
          .from('saisies_comptables')
          .select('*')
          .order('date_operation', { ascending: false });

        if (filters?.type) query = query.eq('type', filters.type);
        if (filters?.statut) query = query.eq('statut_paiement', filters.statut);
        // 🔧 Point 12 : scope par magasin actif (magasin_id null = partagé).
        if (magasinActifId) {
          query = query.or(`magasin_id.eq.${magasinActifId},magasin_id.is.null`);
        }

        const { data, error } = await query;
        if (error) throw error;
        return data as SaisieComptable[];
      } catch {
        const cached = await getData<SaisieComptable[]>('saisies_comptables');
        if (cached) return cached;
        throw new Error('Impossible de charger les saisies');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCreateSaisie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: SaisieFormData): Promise<SaisieComptable> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    const { data: inserted, error } = await supabase
      .from('saisies_comptables')
      .insert([{
        ...data,
        user_id: userId,
        taxe: data.taxe || 0,
        statut_paiement: data.statut_paiement || 'non_paye',
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
        queryClient.invalidateQueries({ queryKey: ['saisies_comptables'] });
        success('Saisie enregistrée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de création');
      },
    },
    '/api/saisies',
    'POST'
  );
};

export const useUpdateSaisie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    id,
    data,
  }: {
    id: string;
    data: Partial<SaisieFormData>;
  }): Promise<SaisieComptable> => {
    const { data: updated, error } = await supabase
      .from('saisies_comptables')
      .update({
        ...data,
        updated_at: new Date().toISOString(),
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
        queryClient.invalidateQueries({ queryKey: ['saisies_comptables'] });
        success('Saisie mise à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de mise à jour');
      },
    },
    '/api/saisies',
    'PUT'
  );
};

export const useUpdateStatutPaiement = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({
    id,
    statut,
  }: {
    id: string;
    statut: 'paye' | 'non_paye' | 'partiel';
  }): Promise<SaisieComptable> => {
    const { data: updated, error } = await supabase
      .from('saisies_comptables')
      .update({
        statut_paiement: statut,
        updated_at: new Date().toISOString(),
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
        queryClient.invalidateQueries({ queryKey: ['saisies_comptables'] });
        success('Statut mis à jour ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de mise à jour');
      },
    },
    '/api/saisies',
    'PUT'
  );
};

export const useDeleteSaisie = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('saisies_comptables')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['saisies_comptables'] });
        success('Saisie supprimée ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de suppression');
      },
    },
    '/api/saisies',
    'DELETE'
  );
};

// ============================================================
// EXERCICES COMPTABLES
// ============================================================

export const useExercices = () => {
  return useQuery<Exercice[], Error>({
    queryKey: ['exercices'],
    queryFn: async () => {
      const { data, error } = await supabase
        .from('exercices')
        .select('*')
        .order('date_debut', { ascending: false });

      if (error) throw error;
      return data as Exercice[];
    },
    staleTime: 1000 * 60 * 5,
  });
};

export const useCreateExercice = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: ExerciceFormData): Promise<Exercice> => {
    const { data: inserted, error } = await supabase
      .from('exercices')
      .insert([{
        ...data,
        cloture: false,
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
        queryClient.invalidateQueries({ queryKey: ['exercices'] });
        success('Exercice créé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de création');
      },
    },
    '/api/exercices',
    'POST'
  );
};

export const useCloturerExercice = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<Exercice> => {
    // 1. Calculer le résultat de l'exercice
    const { data: rawTransactions, error: fetchError } = await supabase
      .from('transactions_comptables')
      .select('*');

    // 🔧 Bug corrigé : l'erreur Supabase n'était jamais vérifiée ici — une
    // clôture d'exercice pouvait silencieusement calculer un résultat de 0
    // (transactions = null → []) au lieu d'échouer bruyamment.
    if (fetchError) {
      console.error('[useCloturerExercice] Erreur Supabase:', fetchError);
      throw new Error(fetchError.message || 'Impossible de charger les transactions');
    }

    const comptesMap = await fetchComptesMap();
    const transactions = attachComptes<TransactionComptable>((rawTransactions || []) as TransactionComptable[], comptesMap);

    let resultat = 0;
    for (const t of transactions || []) {
      if (t.compte_debit?.numero?.startsWith('6')) {
        resultat -= t.montant;
      }
      if (t.compte_credit?.numero?.startsWith('7')) {
        resultat += t.montant;
      }
    }

    // 2. Clôturer l'exercice (la table `exercices` ne stocke pas le résultat)
    console.info('[comptabilite] résultat calculé de l\'exercice :', resultat);
    const { data: updated, error } = await supabase
      .from('exercices')
      .update({ cloture: true })
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
        queryClient.invalidateQueries({ queryKey: ['exercices'] });
        success('Exercice clôturé ✅');
      },
      onError: (err: any) => {
        toastError(err.message || 'Erreur de clôture');
      },
    },
    '/api/exercices',
    'PUT'
  );
};

// ============================================================
// EXPORTS POUR COMPATIBILITÉ AVEC LES PAGES
// ============================================================

export type {
  Compte,
  TransactionComptable,
  TransactionFormData,
  Exercice,
  ExerciceFormData,
  Bilan,
  CompteResultat,
  SaisieComptable,
  SaisieFormData,
  ClotureExercice,
  TypeCompte,
  TypeTransaction,
} from '../types/comptabilite';
