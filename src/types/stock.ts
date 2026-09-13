// ============================================================
// PRODUITS
// ============================================================

export interface Produit {
  id: string;
  nom: string;
  description?: string;
  categorie_id?: string;
  categorie?: Categorie;
  fournisseur_id?: string;
  prix_achat: number;
  prix_vente: number;
  quantite: number;
  seuil_alerte: number;
  unite: string;
  image_url?: string;
  reference?: string;
  attributs?: Record<string, string | number>;
  dernier_mouvement_id?: string;
  actif: boolean;
  magasin_id?: string;
  entrepot_id?: string;
  emplacement_id?: string;
  created_at?: string;
  updated_at?: string;
}

export interface ProduitFormData {
  nom: string;
  description?: string;
  categorie_id?: string;
  prix_achat: number;
  prix_vente: number;
  quantite: number;
  seuil_alerte: number;
  unite: string;
  image_url?: string;
  reference?: string;
  actif?: boolean;
  magasin_id?: string;
  entrepot_id?: string;
  emplacement_id?: string;
}

// ============================================================
// CATEGORIES
// ============================================================

export interface Categorie {
  id: string;
  nom: string;
  description?: string;
  parent_id?: string;
  icone?: string;
  couleur?: string;
  image_url?: string;
  ordre?: number;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// FOURNISSEURS
// ============================================================

export interface Fournisseur {
  id: string;
  nom: string;
  contact?: string;
  email?: string;
  adresse?: string;
  produits_ids?: string[];
  image_url?: string;
  contrats?: string[];
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

// ============================================================
// MOUVEMENTS DE STOCK
// ============================================================

export type TypeMouvement = 
  | 'entree' 
  | 'sortie' 
  | 'ajustement' 
  | 'perte' 
  | 'transfert'
  | 'transfert_magasin' 
  | 'transfert_entrepot' 
  | 'vente';

export interface MouvementStock {
  id: string;
  produit_id: string;
  produit?: Produit;
  type: TypeMouvement;
  quantite: number;
  ancienne_quantite?: number;
  nouvelle_quantite?: number;
  motif?: string;
  magasin_id?: string;
  entrepot_id?: string;
  provenance_id?: string;
  destination_id?: string;
  provenance_type?: 'magasin' | 'entrepot';
  destination_type?: 'magasin' | 'entrepot';
  reference_id?: string;
  reference_type?: string;
  date_mouvement: string;
  utilisateur_id?: string;
  created_at?: string;
}

// ============================================================
// INVENTAIRE
// ============================================================

export type StatutInventaire = 'ouverte' | 'en_cours' | 'validee' | 'annulee';

export interface SessionInventaire {
  id: string;
  nom?: string;
  date_debut: string;
  date_fin?: string;
  statut: StatutInventaire;
  utilisateur_id?: string;
  utilisateur?: any;
  created_at?: string;
  updated_at?: string;
}

export interface SessionInventaireFormData {
  nom?: string;
}

export interface LigneInventaire {
  id: string;
  session_id: string;
  produit_id: string;
  produit?: Produit;
  quantite_theorique: number;
  quantite_reelle?: number;
  ecart?: number;
  created_at?: string;
  updated_at?: string;
}

export interface LigneInventaireFormData {
  produit_id: string;
  quantite_theorique: number;
  quantite_reelle?: number;
}

// ============================================================
// PROMOTIONS
// ============================================================

export interface Promotion {
  id: string;
  produit_id: string;
  produit?: Produit;
  tarification_id?: string;
  prix_promo: number;
  date_debut: string;
  date_fin: string;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface PromotionFormData {
  produit_id: string;
  tarification_id?: string;
  prix_promo: number;
  date_debut: string;
  date_fin: string;
}
