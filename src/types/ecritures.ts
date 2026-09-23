/**
 * Types pour les ÉCRITURES COMPTABLES MULTI-LIGNES
 * Nouveau moteur additif — ne remplace pas TransactionComptable
 * (voir src/types/comptabilite.ts), qui reste utilisé pour les
 * écritures simples à 2 comptes (ventes, achats, salaires, services...).
 *
 * Correspond à sql/migration_ecritures_multilignes.sql
 */

import { Compte, TypeTransaction } from './comptabilite';

export type SensLigne = 'debit' | 'credit';

export interface LigneEcriture {
  id: string;
  ecriture_id: string;
  compte_id: string;
  compte?: Compte;
  sens: SensLigne;
  montant: number;
  libelle_ligne?: string;
  ordre: number;
  created_at: string;
}

export interface EcritureComptable {
  id: string;
  date_ecriture: string;
  libelle: string;
  reference?: string;
  type: TypeTransaction;
  user_id: string;
  magasin_id?: string;
  exercice_id?: string;
  created_at: string;
  lignes?: LigneEcriture[];
}

// ------------------------------------------------------------
// Formulaire de saisie multi-ligne
// ------------------------------------------------------------

export interface LigneEcritureFormData {
  compte_id: string;
  sens: SensLigne;
  montant: number;
  libelle_ligne?: string;
}

export interface EcritureMultiligneFormData {
  date_ecriture: string;
  libelle: string;
  type: TypeTransaction;
  reference?: string;
  magasin_id?: string;
  lignes: LigneEcritureFormData[];
}

// Aide pour valider côté client AVANT d'appeler la RPC
// (la base refait de toute façon le contrôle final).
export function calculerEquilibre(lignes: LigneEcritureFormData[]): {
  totalDebit: number;
  totalCredit: number;
  equilibree: boolean;
} {
  const totalDebit = lignes
    .filter((l) => l.sens === 'debit')
    .reduce((sum, l) => sum + (Number(l.montant) || 0), 0);
  const totalCredit = lignes
    .filter((l) => l.sens === 'credit')
    .reduce((sum, l) => sum + (Number(l.montant) || 0), 0);

  return {
    totalDebit,
    totalCredit,
    equilibree: lignes.length >= 2 && totalDebit === totalCredit && totalDebit > 0,
  };
}
