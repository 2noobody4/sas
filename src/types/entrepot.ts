/**
 * Types pour le module Entrepôts
 * Compatible React 16.14
 */

export interface Entrepot {
  id: string;
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  magasin_id?: string;
  // Nouveaux champs d'emplacement
  salle?: string;
  etage?: string;
  etagere?: string;
  emplacement?: string; // alternative: emplacement précis
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EntrepotFormData {
  nom: string;
  adresse?: string;
  telephone?: string;
  email?: string;
  responsable?: string;
  magasin_id?: string;
  salle?: string;
  etage?: string;
  etagere?: string;
  emplacement?: string;
  actif?: boolean;
}

export interface TransfertEntrepot {
  id: string;
  produit_id: string;
  origine_entrepot_id: string;
  destination_entrepot_id: string;
  quantite: number;
  motif?: string;
  date_transfert: string;
  utilisateur_id?: string;
  created_at?: string;
}

export interface TransfertFormData {
  produit_id: string;
  origine_entrepot_id: string;
  destination_entrepot_id: string;
  quantite: number;
  motif?: string;
  date_transfert?: string;
}
