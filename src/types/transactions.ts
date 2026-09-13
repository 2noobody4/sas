/**
 * Types pour le module Transactions Comptables
 * Compatible React 16.14
 * VERSION UNIFIÉE
 */

import { Compte } from './comptabilite';
import { Utilisateur as User } from './modules';

export type TypeTransaction =
  | 'vente'
  | 'achat'
  | 'depense'
  | 'salaire'
  | 'facture_client'
  | 'facture_fournisseur'
  | 'ajustement'
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
  annulee: boolean;
  annulee_le?: string;
  created_at: string;
  updated_at: string;
}

export interface TransactionFormData {
  date_transaction: string;
  libelle: string;
  montant: number;
  compte_debit_id: string;
  compte_credit_id: string;
  reference?: string;
  type: TypeTransaction;
}

export interface TransactionFilters {
  date_debut?: string;
  date_fin?: string;
  type?: TypeTransaction;
  compte_id?: string;
  annulee?: boolean;
  search?: string;
}
