// ============================================================
// INVENTAIRE — Types pour le module inventaire
// Version V3 — Compatible React 16
// ============================================================

import { Produit } from './stock';

// ============================================================
// SESSIONS D'INVENTAIRE
// ============================================================

export type StatutInventaire = 'ouverte' | 'en_cours' | 'validee' | 'annulee';

export interface SessionInventaire {
  id: string;
  nom?: string;
  date_debut: string;
  date_fin?: string;
  statut: StatutInventaire;
  utilisateur_id?: string;
  utilisateur?: {
    id: string;
    nom: string;
    prenom?: string;
    email: string;
  };
  created_at?: string;
}

export interface SessionInventaireFormData {
  nom?: string;
  date_debut?: string;
}

// ============================================================
// LIGNES D'INVENTAIRE
// ============================================================

export interface LigneInventaire {
  id: string;
  session_id: string;
  produit_id: string;
  produit?: Produit;
  quantite_theorique: number;
  quantite_reelle?: number;
  ecart?: number;
  created_at?: string;
}

export interface LigneInventaireFormData {
  produit_id: string;
  quantite_theorique: number;
  quantite_reelle?: number;
  ecart?: number;
}

// ============================================================
// STATISTIQUES D'INVENTAIRE
// ============================================================

export interface InventaireStats {
  total_produits: number;
  produits_comptes: number;
  produits_non_comptes: number;
  ecart_total: number;
  ecart_positif: number;
  ecart_negatif: number;
  ecart_nul: number;
}
