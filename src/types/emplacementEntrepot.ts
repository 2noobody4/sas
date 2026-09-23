/**
 * Types pour le module Emplacements d'entrepôt
 * Compatible React 16.14
 */

export interface EmplacementEntrepot {
  id: string;
  entrepot_id: string;
  nom: string;
  code?: string;
  salle?: string;
  etage?: string;
  etagere?: string;
  description?: string;
  capacite?: number;
  actif: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface EmplacementEntrepotFormData {
  entrepot_id: string;
  nom: string;
  code?: string;
  salle?: string;
  etage?: string;
  etagere?: string;
  description?: string;
  capacite?: number;
  actif?: boolean;
}
