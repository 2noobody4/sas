// ============================================================
// MANAGEMENT INDEX — Point d'entrée du dossier management
// Version V3 — Compatible React 16
// ============================================================

import { MANAGEMENT_DASHBOARD } from './managementDashboard';
import { MANAGEMENT_STOCKS } from './managementStocks';
import { MANAGEMENT_ENTREPOTS_MAGASINS } from './managementEntrepotsMagasins';
import { MANAGEMENT_CAISSE } from './managementCaisse';
import { MANAGEMENT_COMPTABILITE } from './managementComptabilite';
import { MANAGEMENT_RH } from './managementRH';
import { MANAGEMENT_CLIENTS } from './managementClients';
import { MANAGEMENT_ADMIN } from './managementAdmin';
import { MANAGEMENT_SERVICES } from './managementServices';

// Tous les modules de gestion
export const MANAGEMENT_MODULES = [
  ...MANAGEMENT_DASHBOARD,
  ...MANAGEMENT_STOCKS,
  ...MANAGEMENT_ENTREPOTS_MAGASINS,
  ...MANAGEMENT_CAISSE,
  ...MANAGEMENT_COMPTABILITE,
  ...MANAGEMENT_RH,
  ...MANAGEMENT_CLIENTS,
  ...MANAGEMENT_SERVICES,
  ...MANAGEMENT_ADMIN,
];

export {
  MANAGEMENT_DASHBOARD,
  MANAGEMENT_STOCKS,
  MANAGEMENT_ENTREPOTS_MAGASINS,
  MANAGEMENT_CAISSE,
  MANAGEMENT_COMPTABILITE,
  MANAGEMENT_RH,
  MANAGEMENT_CLIENTS,
  MANAGEMENT_SERVICES,
  MANAGEMENT_ADMIN,
};
