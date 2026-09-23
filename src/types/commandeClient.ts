/**
 * Types pour le module Commandes Client
 * Compatible React 16.14
 */

import { Client } from './clients';
import { Produit } from './stock';

export type StatutCommandeClient =
  | 'brouillon'
  | 'en_attente'
  | 'confirmee'
  | 'preparation'
  | 'expediee'
  | 'livree'
  | 'annulee';

export interface LigneCommandeClient {
  id?: string;
  produit_id: string;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
  remise?: number;
  total_ligne?: number;
}

export interface CommandeClient {
  id: string;
  numero: string;
  client_id: string;
  client?: Client;
  date_commande: string;
  date_livraison_prevue?: string;
  date_livraison_effective?: string;
  lignes: LigneCommandeClient[];
  sous_total: number;
  remise: number;
  frais_livraison: number;
  montant_total: number;
  statut: StatutCommandeClient;
  notes?: string;
  adresse_livraison?: string;
  mode_paiement?: string;
  reference_paiement?: string;
  user_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommandeClientFormData {
  client_id: string;
  date_livraison_prevue?: string;
  lignes: Omit<LigneCommandeClient, 'id' | 'produit' | 'total_ligne'>[];
  remise?: number;
  frais_livraison?: number;
  notes?: string;
  adresse_livraison?: string;
  mode_paiement?: string;
}

export const STATUTS_COMMANDE_CLIENT: {
  value: StatutCommandeClient;
  label: string;
  color: string;
  icon: string;
}[] = [
  { value: 'brouillon', label: 'Brouillon', color: 'var(--color-textSecondary)', icon: '📝' },
  { value: 'en_attente', label: 'En attente', color: 'var(--color-warning)', icon: '⏳' },
  { value: 'confirmee', label: 'Confirmée', color: 'var(--color-info)', icon: '✅' },
  { value: 'preparation', label: 'En préparation', color: 'var(--color-primary)', icon: '📦' },
  { value: 'expediee', label: 'Expédiée', color: 'var(--color-primary)', icon: '🚚' },
  { value: 'livree', label: 'Livrée', color: 'var(--color-success)', icon: '🏠' },
  { value: 'annulee', label: 'Annulée', color: 'var(--color-danger)', icon: '❌' },
];
