/**
 * Types pour le module Clients
 * Compatible React 16.14
 */

import { Utilisateur as User } from './modules';

// ============================================================
// CLIENTS
// ============================================================

export type TypeClient = 'particulier' | 'entreprise' | 'association' | 'autre';
export type SegmentClient = 'A' | 'B' | 'C' | 'D';
export type NiveauFidelite = 'bronze' | 'argent' | 'or' | 'platine' | 'diamant';

export interface Client {
  id: string;
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays: string;
  type: TypeClient;
  segment: SegmentClient;
  points_fidelite: number;
  niveau_fidelite: NiveauFidelite;
  notes?: string;
  actif: boolean;
  user_id?: string;
  user?: User;
  created_at: string;
  updated_at: string;
}

export interface ClientFormData {
  nom: string;
  prenom?: string;
  email?: string;
  telephone?: string;
  adresse?: string;
  ville?: string;
  pays?: string;
  type: TypeClient;
  segment?: SegmentClient;
  notes?: string;
  actif?: boolean;
}

// ============================================================
// INTERACTIONS
// ============================================================

export type TypeInteraction = 'appel' | 'email' | 'rendez_vous' | 'relance' | 'note' | 'autre';

export interface Interaction {
  id: string;
  client_id: string;
  client?: Client;
  type: TypeInteraction;
  sujet?: string;
  description?: string;
  date_interaction: string;
  user_id: string;
  user?: User;
  created_at: string;
}

export interface InteractionFormData {
  client_id: string;
  type: TypeInteraction;
  sujet?: string;
  description?: string;
  date_interaction?: string;
}

// ============================================================
// TRANSACTIONS CLIENT
// ============================================================

export interface TransactionClient {
  id: string;
  client_id: string;
  client?: Client;
  vente_id?: string;
  date_transaction: string;
  montant: number;
  points_utilises: number;
  points_gagnes: number;
  created_at: string;
}

// ============================================================
// NIVEAUX DE FIDÉLITÉ
// ============================================================

export interface NiveauFideliteConfig {
  id: string;
  nom: NiveauFidelite;
  points_min: number;
  remise: number;
  couleur: string;
  created_at: string;
}

// ============================================================
// STATISTIQUES
// ============================================================

export interface ClientStats {
  total_clients: number;
  actifs: number;
  inactifs: number;
  total_depenses: number;
  panier_moyen: number;
  clients_par_segment: Record<SegmentClient, number>;
  clients_par_niveau: Record<NiveauFidelite, number>;
}

// ============================================================
// CLIENT MAGASINS (relation N-N)
// ============================================================

export interface ClientMagasin {
  id: string;
  client_id: string;
  client?: Client;
  magasin_id: string;
  magasin?: any;
  date_inscription?: string;
  actif: boolean;
  created_at?: string;
}
