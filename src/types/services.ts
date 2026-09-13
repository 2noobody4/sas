// ============================================================
// SERVICES - Types
// Version V3 - Compatible React 16
// ============================================================

import { AttributService } from './attributsService';

export interface Service {
  id: string;
  nom: string;
  disponible: boolean;
  descriptif: string;
  prix: number;
  informations_requises: string[]; // IDs des attributs sélectionnés
  image_url?: string;
  categorie_id?: string;
  duree?: string;
  created_at?: string;
  updated_at?: string;
  // Jointures
  attributs?: AttributService[];
  categorie?: { id: string; nom: string } | null;
}

export interface ServiceFormData {
  nom: string;
  disponible: boolean;
  descriptif: string;
  prix: number;
  informations_requises: string[];
  image_url?: string;
  categorie_id?: string;
  duree?: string;
}

export interface ServiceFiltres {
  categorie_id?: string;
  disponible?: boolean;
  search?: string;
}

export interface ServiceStats {
  total: number;
  disponibles: number;
  indisponibles: number;
  prix_moyen: number;
  prix_min: number;
  prix_max: number;
}
