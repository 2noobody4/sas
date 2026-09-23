/**
 * Types pour les promotions et tarifications
 * Compatible React 16.14
 */

export interface Promotion {
  id: string;
  produit_id: string;
  tarification_id?: string;
  prix_promo: number;
  date_debut: string;
  date_fin: string;
  actif: boolean;
  created_at: string;
  updated_at: string;
}

export interface PromotionFormData {
  produit_id: string;
  tarification_id?: string;
  prix_promo: number;
  date_debut: string;
  date_fin: string;
  actif?: boolean;
}

// ============================================================
// TARIFICATION (existante)
// ============================================================

export interface Tarification {
  id: string;
  produit_id: string;
  prix_achat: number;
  prix_vente: number;
  seuil_alerte: number;
  date_debut: string;
  date_fin?: string;
  created_at: string;
}

export interface TarificationFormData {
  produit_id: string;
  prix_achat: number;
  prix_vente: number;
  seuil_alerte: number;
}

// ============================================================
// NÉGOCIATION
// ============================================================

export type NegociationStatut = 'en_cours' | 'accepte' | 'refuse' | 'annule';

export interface Negociation {
  id: string;
  produit_id: string;
  produit?: any;
  prix_achat: number;
  prix_vente_propose: number;
  marge: number;
  client_id?: string;
  client?: any;
  statut: NegociationStatut;
  notes?: string;
  user_id: string;
  user?: any;
  created_at: string;
  updated_at: string;
}

export interface NegociationFormData {
  produit_id: string;
  prix_achat: number;
  prix_vente_propose: number;
  client_id?: string;
  notes?: string;
}
