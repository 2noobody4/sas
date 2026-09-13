import { ModuleDefinition } from '../types';
import { CaisseRoot } from '../../../pages/caisse/CaisseRoot';
import { SessionsPage } from '../../../pages/caisse/SessionsPage';
import { VentesPage } from '../../../pages/caisse/VentesPage';
import { VenteFormPage } from '../../../pages/caisse/VenteFormPage';
import { RapportsPage as CaisseRapportsPage } from '../../../pages/caisse/RapportsPage';
import { NegociationPage } from '../../../pages/caisse/NegociationPage';

export const MANAGEMENT_CAISSE: ModuleDefinition[] = [
  {
    id: 'management-caisse',
    path: '/gestion/caisse',
    label: 'Caisse',
    icon: 'Coins',
    description: 'Gestion de la caisse',
    roles: ['admin', 'gestionnaire', 'cashier'],
    order: 110,
    component: CaisseRoot,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'caisse-sessions',
    path: '/gestion/caisse/sessions',
    label: 'Sessions de caisse',
    icon: 'Coins',
    description: 'Gérer les sessions',
    roles: ['admin', 'gestionnaire', 'cashier'],
    order: 110.1,
    component: SessionsPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'caisse-ventes',
    path: '/gestion/caisse/ventes',
    label: 'Ventes',
    icon: 'Receipt',
    description: 'Historique des ventes',
    roles: ['admin', 'gestionnaire', 'cashier'],
    order: 110.2,
    component: VentesPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'caisse-nouvelle-vente',
    path: '/gestion/caisse/ventes/nouvelle',
    label: 'Nouvelle vente',
    icon: 'PlusCircle',
    description: 'Enregistrer une vente',
    roles: ['admin', 'gestionnaire', 'cashier'],
    order: 110.3,
    component: VenteFormPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'caisse-rapports',
    path: '/gestion/caisse/rapports',
    label: 'Rapports de caisse',
    icon: 'BarChart',
    description: 'Statistiques et analyses',
    roles: ['admin', 'gestionnaire', 'cashier'],
    order: 110.4,
    component: CaisseRapportsPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'caisse-negociation',
    path: '/gestion/caisse/negociation',
    label: 'Négociation',
    icon: 'TrendingUp',
    description: 'Visualisation des marges',
    roles: ['admin', 'gestionnaire', 'cashier'],
    order: 110.5,
    component: NegociationPage,
    isManagement: true,
    isSidebarItem: false,
  },
];
