// ============================================================
// DEMANDES SERVICE - Types
// Version V1 - Compatible React 16
// ============================================================

import { Client } from './clients';
import { Service } from './services';
import { Utilisateur as User } from './modules';

export type StatutDemandeService =
  | 'en_attente'
  | 'confirmee'
  | 'en_cours'
  | 'terminee'
  | 'annulee'
  | 'refusee';

// Type de facturation : comment le prix du service est calculé
export type TypeFacturationDemande = 'forfait' | 'horaire';

// Mode de paiement : quand / comment le client règle
export type ModePaiementDemande =
  | 'total'          // paiement intégral à la commande
  | 'acompte'        // acompte à la commande, solde plus tard
  | 'a_la_livraison'; // rien à la commande, paiement à la livraison

export interface DemandeService {
  id: string;
  service_id: string;
  service?: Service;
  client_id?: string;
  client?: Client;
  user_id?: string;
  user?: User;
  informations: Record<string, string | number>;
  statut: StatutDemandeService;
  date_souhaitee?: string;
  date_confirmee?: string;
  duree_estimee?: string;
  prix_convenu?: number;
  type_facturation?: TypeFacturationDemande;
  mode_paiement?: ModePaiementDemande;
  montant_acompte?: number;
  transaction_id?: string;
  // ⭐ Écriture du SOLDE (quand mode_paiement = 'acompte') : comptabilisée
  // séparément de l'acompte une fois le service livré (statut = 'terminee').
  transaction_solde_id?: string;
  notes?: string;
  notes_admin?: string;
  created_at: string;
  updated_at?: string;
}

export interface DemandeServiceFormData {
  service_id: string;
  client_id?: string;
  informations: Record<string, string | number>;
  date_souhaitee?: string;
  notes?: string;
  type_facturation?: TypeFacturationDemande;
  mode_paiement?: ModePaiementDemande;
  montant_acompte?: number;
}

export interface DemandeServiceFiltres {
  statut?: StatutDemandeService;
  client_id?: string;
  service_id?: string;
  search?: string;
  date_debut?: string;
  date_fin?: string;
}

export const STATUTS_DEMANDE_SERVICE: {
  value: StatutDemandeService;
  label: string;
  color: string;
  icon: string;
}[] = [
  { value: 'en_attente', label: 'En attente', color: 'var(--color-warning)', icon: '⏳' },
  { value: 'confirmee', label: 'Confirmée', color: 'var(--color-info)', icon: '✅' },
  { value: 'en_cours', label: 'En cours', color: 'var(--color-primary)', icon: '🔧' },
  { value: 'terminee', label: 'Terminée', color: 'var(--color-success)', icon: '🏁' },
  { value: 'annulee', label: 'Annulée', color: 'var(--color-danger)', icon: '❌' },
  { value: 'refusee', label: 'Refusée', color: 'var(--color-danger)', icon: '🚫' },
];

export const TYPES_FACTURATION_DEMANDE: {
  value: TypeFacturationDemande;
  label: string;
}[] = [
  { value: 'forfait', label: '💰 Forfait' },
  { value: 'horaire', label: '⏱️ À l\'heure' },
];

export const MODES_PAIEMENT_DEMANDE: {
  value: ModePaiementDemande;
  label: string;
}[] = [
  { value: 'total', label: 'Paiement total à la commande' },
  { value: 'acompte', label: 'Acompte à la commande' },
  { value: 'a_la_livraison', label: 'Paiement à la livraison' },
];

