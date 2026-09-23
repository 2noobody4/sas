/**
 * useEcritureMultiligne – Hooks pour le moteur d'écritures comptables à
 * N lignes (voir sql/migration_ecritures_multilignes.sql,
 * sql/migration_fix_annulation_ecritures.sql et src/types/ecritures.ts).
 * Compatible React 16.14 — même style que useComptabilisation.ts
 */

import { useQuery, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useToast } from './useToast';
import { useOfflineMutation } from './useOfflineMutation';
import {
  EcritureComptable,
  EcritureMultiligneFormData,
  calculerEquilibre,
} from '../types/ecritures';

// ============================================================
// CRÉER UNE ÉCRITURE MULTI-LIGNES
// ============================================================

interface CreerEcritureMultiligneParams extends EcritureMultiligneFormData {
  userId: string;
}

const validerLignes = (lignes: EcritureMultiligneFormData['lignes']) => {
  if (!lignes || lignes.length < 2) {
    throw new Error('Une écriture doit comporter au moins 2 lignes');
  }
  if (lignes.some((l) => !l.compte_id)) {
    throw new Error('Chaque ligne doit avoir un compte sélectionné');
  }
  if (lignes.some((l) => !l.montant || l.montant <= 0)) {
    throw new Error('Chaque ligne doit avoir un montant supérieur à 0');
  }
  const { equilibree, totalDebit, totalCredit } = calculerEquilibre(lignes);
  if (!equilibree) {
    throw new Error(`Écriture déséquilibrée : débit ${totalDebit} ≠ crédit ${totalCredit}`);
  }
};

export const useCreerEcritureMultiligne = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (params: CreerEcritureMultiligneParams): Promise<string> => {
    const { date_ecriture, libelle, type, reference, magasin_id, lignes, userId } = params;
    validerLignes(lignes);

    const { data, error } = await supabase.rpc('creer_ecriture_multiligne', {
      p_date_ecriture: date_ecriture,
      p_libelle: libelle,
      p_type: type,
      p_user_id: userId,
      p_lignes: lignes,
      p_reference: reference ?? null,
      p_magasin_id: magasin_id ?? null,
    });

    if (error) throw error;
    return data as string; // id de l'écriture créée
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ecritures'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['grand_livre'] });
        success('Écriture enregistrée ✅');
      },
      onError: (err: any) => {
        console.error('[useCreerEcritureMultiligne] Erreur:', err);
        toastError(err.message || "Erreur lors de l'enregistrement de l'écriture");
      },
    },
    '/api/ecritures',
    'POST',
    (params) => ({
      kind: 'rpc',
      fn: 'creer_ecriture_multiligne',
      args: {
        p_date_ecriture: params.date_ecriture,
        p_libelle: params.libelle,
        p_type: params.type,
        p_user_id: params.userId,
        p_lignes: params.lignes,
        p_reference: params.reference ?? null,
        p_magasin_id: params.magasin_id ?? null,
      },
    })
  );
};

// ============================================================
// MODIFIER UNE ÉCRITURE MULTI-LIGNES
// (annule l'ancienne + recrée une nouvelle, de façon atomique côté SQL —
// voir modifier_ecriture_multiligne dans migration_fix_annulation_ecritures.sql)
// ============================================================

interface ModifierEcritureMultiligneParams extends EcritureMultiligneFormData {
  ecritureId: string;
  userId: string;
}

export const useModifierEcritureMultiligne = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (params: ModifierEcritureMultiligneParams): Promise<string> => {
    const { ecritureId, date_ecriture, libelle, type, reference, magasin_id, lignes, userId } = params;
    validerLignes(lignes);

    const { data, error } = await supabase.rpc('modifier_ecriture_multiligne', {
      p_ecriture_id: ecritureId,
      p_date_ecriture: date_ecriture,
      p_libelle: libelle,
      p_type: type,
      p_user_id: userId,
      p_lignes: lignes,
      p_reference: reference ?? null,
      p_magasin_id: magasin_id ?? null,
    });

    if (error) throw error;
    return data as string; // nouvel id de l'écriture (l'ancien disparaît)
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ecritures'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['grand_livre'] });
        success('Écriture modifiée ✅');
      },
      onError: (err: any) => {
        console.error('[useModifierEcritureMultiligne] Erreur:', err);
        toastError(err.message || "Erreur lors de la modification de l'écriture");
      },
    },
    '/api/ecritures',
    'PUT',
    (params) => ({
      kind: 'rpc',
      fn: 'modifier_ecriture_multiligne',
      args: {
        p_ecriture_id: params.ecritureId,
        p_date_ecriture: params.date_ecriture,
        p_libelle: params.libelle,
        p_type: params.type,
        p_user_id: params.userId,
        p_lignes: params.lignes,
        p_reference: params.reference ?? null,
        p_magasin_id: params.magasin_id ?? null,
      },
    })
  );
};

// ============================================================
// SUPPRIMER (ANNULER) UNE ÉCRITURE MULTI-LIGNES
// Contre-passe les soldes puis supprime l'écriture — voir
// annuler_ecriture dans migration_fix_annulation_ecritures.sql
// ============================================================

export const useSupprimerEcriture = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (ecritureId: string): Promise<void> => {
    const { error } = await supabase.rpc('annuler_ecriture', { p_ecriture_id: ecritureId });
    if (error) throw error;
  };

  return useOfflineMutation(
    {
      mutationFn,
      onSuccess: () => {
        queryClient.invalidateQueries({ queryKey: ['ecritures'] });
        queryClient.invalidateQueries({ queryKey: ['comptes'] });
        queryClient.invalidateQueries({ queryKey: ['grand_livre'] });
        success('Écriture annulée ✅');
      },
      onError: (err: any) => {
        console.error('[useSupprimerEcriture] Erreur:', err);
        toastError(err.message || "Erreur lors de l'annulation de l'écriture");
      },
    },
    '/api/ecritures',
    'DELETE',
    (ecritureId) => ({
      kind: 'rpc',
      fn: 'annuler_ecriture',
      args: { p_ecriture_id: ecritureId },
    })
  );
};

// ============================================================
// LISTER LES ÉCRITURES (avec leurs lignes, via v_ecritures_detail)
// ============================================================

export const useEcritures = (filters?: {
  date_debut?: string;
  date_fin?: string;
  type?: string;
  compte_id?: string;
}) => {
  return useQuery<EcritureComptable[], Error>({
    queryKey: ['ecritures', filters],
    queryFn: async () => {
      let query = supabase
        .from('v_ecritures_detail')
        .select('*')
        .order('date_ecriture', { ascending: false });

      if (filters?.date_debut) query = query.gte('date_ecriture', filters.date_debut);
      if (filters?.date_fin) query = query.lte('date_ecriture', filters.date_fin);
      if (filters?.type) query = query.eq('type', filters.type);
      if (filters?.compte_id) query = query.eq('compte_id', filters.compte_id);

      const { data, error } = await query;
      if (error) throw error;

      // Regroupe les lignes plates (une par ligne SQL) par écriture
      const parEcriture = new Map<string, EcritureComptable>();
      for (const row of data || []) {
        if (!parEcriture.has(row.ecriture_id)) {
          parEcriture.set(row.ecriture_id, {
            id: row.ecriture_id,
            date_ecriture: row.date_ecriture,
            libelle: row.libelle,
            reference: row.reference,
            type: row.type,
            user_id: row.user_id,
            magasin_id: row.magasin_id,
            exercice_id: row.exercice_id,
            created_at: row.date_ecriture,
            lignes: [],
          });
        }
        parEcriture.get(row.ecriture_id)!.lignes!.push({
          id: row.ligne_id,
          ecriture_id: row.ecriture_id,
          compte_id: row.compte_id,
          compte: { numero: row.compte_numero, nom: row.compte_nom } as any,
          sens: row.sens,
          montant: row.montant,
          libelle_ligne: row.libelle_ligne,
          ordre: row.ordre,
          created_at: row.date_ecriture,
        });
      }
      return Array.from(parEcriture.values());
    },
    staleTime: 1000 * 60 * 2,
  });
};

// ============================================================
// LIRE UNE SEULE ÉCRITURE (pour préremplir un formulaire d'édition)
// ============================================================

export const useEcriture = (ecritureId?: string) => {
  return useQuery<EcritureComptable | null, Error>({
    queryKey: ['ecriture', ecritureId],
    enabled: !!ecritureId,
    queryFn: async () => {
      if (!ecritureId) return null;
      const { data, error } = await supabase
        .from('v_ecritures_detail')
        .select('*')
        .eq('ecriture_id', ecritureId)
        .order('ordre', { ascending: true });
      if (error) throw error;
      if (!data || data.length === 0) return null;

      const first = data[0] as any;
      return {
        id: first.ecriture_id,
        date_ecriture: first.date_ecriture,
        libelle: first.libelle,
        reference: first.reference,
        type: first.type,
        user_id: first.user_id,
        magasin_id: first.magasin_id,
        exercice_id: first.exercice_id,
        created_at: first.date_ecriture,
        lignes: data.map((row: any) => ({
          id: row.ligne_id,
          ecriture_id: row.ecriture_id,
          compte_id: row.compte_id,
          compte: { numero: row.compte_numero, nom: row.compte_nom } as any,
          sens: row.sens,
          montant: row.montant,
          libelle_ligne: row.libelle_ligne,
          ordre: row.ordre,
          created_at: row.date_ecriture,
        })),
      };
    },
    staleTime: 1000 * 60,
  });
};

export default {
  useCreerEcritureMultiligne,
  useModifierEcritureMultiligne,
  useSupprimerEcriture,
  useEcritures,
  useEcriture,
};
