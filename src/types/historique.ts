/**
 * Types pour l'historique d'actions
 * Compatible React 16.14
 */

import { Utilisateur as User } from './modules';

export type ModuleType = 'caisse' | 'stocks' | 'clients' | 'rh' | 'comptabilite' | 'administration';
export type ActionType = 'create' | 'update' | 'delete' | 'open' | 'close' | 'validate' | 'cancel';
export type EntityType = 'session' | 'vente' | 'produit' | 'categorie' | 'fournisseur' | 'user';

export interface HistoriqueAction {
  id: string;
  user_id: string;
  user?: User;
  module: ModuleType;
  action: ActionType;
  entity_type: EntityType;
  entity_id: string;
  old_data?: Record<string, any>;
  new_data?: Record<string, any>;
  ip_address?: string;
  user_agent?: string;
  created_at: string;
}

export interface HistoriqueFilter {
  module?: ModuleType;
  action?: ActionType;
  entity_type?: EntityType;
  user_id?: string;
  date_debut?: string;
  date_fin?: string;
  entity_id?: string;
}
