import { Produit } from './stock';

// ============================================================
// PANIER
// ============================================================

export interface PanierItem {
  produit_id: string;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
}

export interface Panier {
  items: PanierItem[];
  total: number;
}

// ============================================================
// COMMANDES
// ============================================================

export type StatutCommande = 'brouillon' | 'en_attente' | 'payee' | 'preparation' | 'expediee' | 'livree' | 'annulee';

export interface Commande {
  id: string;
  client_id?: string;
  client_nom?: string;
  client_email?: string;
  client_telephone?: string;
  client_adresse?: string;
  items: CommandeItem[];
  montant_total: number;
  frais_livraison: number;
  statut: StatutCommande;
  date_commande: string;
  date_livraison_prevue?: string;
  mode_paiement?: string;
  reference_paiement?: string;
  notes?: string;
  user_id: string;
  created_at?: string;
  updated_at?: string;
}

export interface CommandeItem {
  produit_id: string;
  produit?: Produit;
  quantite: number;
  prix_unitaire: number;
  remise_ligne?: number;
}

export interface CommandeFormData {
  client_id?: string;
  client_nom?: string;
  client_email?: string;
  client_telephone?: string;
  client_adresse?: string;
  items: Omit<CommandeItem, 'produit' | 'id'>[];
  frais_livraison?: number;
  mode_paiement?: string;
  notes?: string;
}

export const STATUTS_COMMANDE: { value: StatutCommande; label: string; color: string }[] = [
  { value: 'brouillon', label: 'Brouillon', color: 'var(--color-textSecondary)' },
  { value: 'en_attente', label: 'En attente', color: 'var(--color-warning)' },
  { value: 'payee', label: 'Payée', color: 'var(--color-success)' },
  { value: 'preparation', label: 'En préparation', color: 'var(--color-info)' },
  { value: 'expediee', label: 'Expédiée', color: 'var(--color-primary)' },
  { value: 'livree', label: 'Livrée', color: 'var(--color-success)' },
  { value: 'annulee', label: 'Annulée', color: 'var(--color-danger)' },
];
