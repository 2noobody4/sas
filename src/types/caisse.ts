/**
 * Types pour le module Caisse
 * Compatible React 16.14
 */

import { Utilisateur as User } from './modules';

// ============================================================
// SESSIONS
// ============================================================

export type SessionStatut = 'ouverte' | 'fermee';

export interface SessionCaisse {
  id: string;
  user_id: string;
  user?: User;
  fond_ouverture: number;
  fond_fermeture?: number;
  ecart?: number;
  date_ouverture: string;
  date_fermeture?: string;
  statut: SessionStatut;
  created_at?: string;
  updated_at?: string;
}

export interface SessionFormData {
  fond_ouverture: number;
}

// ============================================================
// VENTES
// ============================================================

export type VenteStatut = 'en_cours' | 'validee' | 'annulee';

export interface LigneVente {
  id?: string;
  produit_id: string;
  produit?: any; // Produit avec jointure
  quantite: number;
  prix_unitaire: number;
  remise_ligne?: number;
}

export interface Vente {
  id: string;
  session_id: string;
  session?: SessionCaisse;
  client_id?: string;
  client?: User;
  caissier_id: string;
  caissier?: User;
  date_vente: string;
  montant_total: number;
  remise: number;
  statut: VenteStatut;
  lignes?: LigneVente[];
  paiements?: Paiement[];
  created_at?: string;
  updated_at?: string;
}

export interface VenteFormData {
  session_id: string;
  client_id?: string;
  caissier_id: string;
  lignes: LigneVente[];
  remise: number;
  paiements: PaiementFormData[];
}

// ============================================================
// PAIEMENTS
// ============================================================

export type MoyenPaiement = 'especes' | 'mobile_money' | 'carte' | 'cheque';

export interface Paiement {
  id: string;
  vente_id: string;
  moyen: MoyenPaiement;
  montant: number;
  reference?: string;
  date_paiement: string;
}

export interface PaiementFormData {
  moyen: MoyenPaiement;
  montant: number;
  reference?: string;
}

// ============================================================
// STATISTIQUES / RAPPORTS
// ============================================================

export interface RapportCaisse {
  date_debut: string;
  date_fin: string;
  total_ventes: number;
  total_remises: number;
  total_encaisse: number;
  total_especes: number;
  total_mobile_money: number;
  total_carte: number;
  total_cheque: number;
  nombre_ventes: number;
  panier_moyen: number;
}
