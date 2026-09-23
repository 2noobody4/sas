/**
 * Types pour le module Comptabilité (OHADA)
 * Compatible React 16.14
 * VERSION UNIFIÉE - Utilise transactions_comptables
 */

import { Utilisateur as User } from './modules';

// ============================================================
// COMPTES (Plan comptable OHADA)
// ============================================================

export type TypeCompte = 'actif' | 'passif' | 'produit' | 'charge';

export interface Compte {
  id: string;
  numero: string;
  nom: string;
  type: TypeCompte;
  parent_id?: string;
  parent?: Compte;
  niveau: number;
  solde: number;
  user_id?: string;
  actif: boolean;
  tiers_type?: 'client' | 'fournisseur'; // 🔧 Compte auxiliaire par tiers (401xxx/411xxx)
  tiers_id?: string;
  created_at: string;
  updated_at: string;
}

export interface CompteFormData {
  numero: string;
  nom: string;
  type: TypeCompte;
  parent_id?: string;
  niveau: number;
}

// ============================================================
// TRANSACTIONS COMPTABLES (Table unique)
// ============================================================

export type TypeTransaction =
  | 'vente'
  | 'achat'
  | 'depense'
  | 'salaire'
  | 'facture_client'
  | 'facture_fournisseur'
  | 'ajustement'
  | 'service'
  | 'autre';

export interface TransactionComptable {
  id: string;
  date_transaction: string;
  libelle: string;
  montant: number;
  compte_debit_id: string;
  compte_debit?: Compte;
  compte_credit_id: string;
  compte_credit?: Compte;
  reference?: string;
  type: TypeTransaction;
  user_id: string;
  user?: User;
  magasin_id?: string;
  exercice_id?: string; // 🔧 Rempli automatiquement par un trigger SQL selon la date ; bloque l'écriture si l'exercice est clôturé (voir sql/migration_cloture_et_paiements_factures.sql)
  created_at: string;
}

export interface TransactionFormData {
  date_transaction: string;
  libelle: string;
  montant: number;
  compte_debit_id: string;
  compte_credit_id: string;
  reference?: string;
  type: TypeTransaction;
  magasin_id?: string;
}

// ============================================================
// EXERCICES COMPTABLES
// ============================================================

export interface Exercice {
  id: string;
  nom: string;
  date_debut: string;
  date_fin: string;
  cloture: boolean;
  created_at: string;
}

export interface ExerciceFormData {
  nom: string;
  date_debut: string;
  date_fin: string;
}

export interface ClotureExercice {
  exercice_id: string;
  date_cloture: string;
  resultat: number;
  reports_a_nouveau: Record<string, number>;
  statut: 'en_cours' | 'termine' | 'valide';
  user_id: string;
  created_at: string;
}

// ============================================================
// BILAN
// ============================================================

export interface DetailTiers {
  clients: number;
  fournisseurs: number;
  personnel: number;
  etat: number;
  autres: number;
}

export interface BilanDetail {
  creances: DetailTiers;
  dettes: DetailTiers;
}

export interface Bilan {
  date: string;
  actif: {
    immobilisations: number;
    stocks: number;
    creances: number;
    tresorerie: number;
    total: number;
  };
  passif: {
    capitaux_propres: number;
    dettes_financieres: number;
    dettes_circulantes: number;
    total: number;
  };
  detail?: BilanDetail;
}

// ============================================================
// COMPTE DE RÉSULTAT
// ============================================================

export interface CompteResultat {
  date_debut: string;
  date_fin: string;
  produits: {
    ventes: number;
    subventions: number;
    production_immobilisee: number;
    autres_produits: number;
    total: number;
  };
  charges: {
    achats: number;
    services: number;
    impots: number;
    personnel: number;
    frais_financiers: number;
    dotations: number;
    autres_charges: number;
    total: number;
  };
  resultat: number;
}

// ============================================================
// JOURNAL (Livre d'or)
// ============================================================

export interface JournalEntry {
  date: string;
  libelle: string;
  compte_debit: string;
  compte_credit: string;
  montant: number;
  reference?: string;
  type: TypeTransaction;
}

// ============================================================
// SAISIE COMPTABLE SIMPLIFIÉE
// ============================================================

export interface SaisieComptable {
  id: string;
  type: 'facture_fournisseur' | 'facture_client' | 'depense' | 'salaire' | 'ajustement' | 'autre';
  beneficiaire: string;
  beneficiaire_id?: string;
  montant_ht: number;
  montant_ttc: number;
  taxe: number;
  date_operation: string;
  date_echeance?: string;
  statut_paiement: 'paye' | 'non_paye' | 'partiel';
  description?: string;
  piece_jointe_url?: string;
  user_id: string;
  transaction_id?: string;
  compte_debit_id?: string;
  compte_credit_id?: string;
  created_at: string;
  updated_at: string;
}

export interface SaisieFormData {
  type: 'facture_fournisseur' | 'facture_client' | 'depense' | 'salaire' | 'ajustement' | 'autre';
  beneficiaire: string;
  beneficiaire_id?: string;
  montant_ht: number;
  montant_ttc: number;
  taxe?: number;
  date_operation: string;
  date_echeance?: string;
  statut_paiement: 'paye' | 'non_paye' | 'partiel';
  description?: string;
  piece_jointe_url?: string;
  compte_debit_id?: string;
  compte_credit_id?: string;
}
