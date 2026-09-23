// ============================================================
// SERVICES - Types
// Version V6 - Ajout images[]
// ============================================================

import { AttributService } from './attributsService';

export type ModePaiementService = 'forfait' | 'horaire' | 'les_deux';

export interface CategorieService {
  id: string;
  nom: string;
  description?: string;
  couleur?: string;
  image_url?: string;
  ordre?: number;
  actif?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface CategorieServiceFormData {
  nom: string;
  description?: string;
  couleur?: string;
  image_url?: string;
  ordre?: number;
  actif?: boolean;
}

export interface Service {
  id: string;
  nom: string;
  disponible: boolean;
  description: string;
  prix: number;
  prix_horaire?: number;
  duree_estimee_heures?: number;
  mode_paiement: ModePaiementService;
  informations_requises: string[];
  image_url?: string;
  images?: string[];
  categorie_id?: string;
  categorie_service_id?: string;
  duree?: string;
  created_at?: string;
  updated_at?: string;
  attributs?: AttributService[];
  categorie?: { id: string; nom: string } | null;
  categorie_service?: CategorieService | null;
}

export interface ServiceFormData {
  nom: string;
  disponible: boolean;
  description: string;
  prix: number;
  prix_horaire?: number;
  duree_estimee_heures?: number;
  mode_paiement: ModePaiementService;
  informations_requises: string[];
  image_url?: string;
  images?: string[];
  categorie_id?: string;
  categorie_service_id?: string;
  duree?: string;
}

export interface ServiceFiltres {
  categorie_id?: string;
  categorie_service_id?: string;
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
