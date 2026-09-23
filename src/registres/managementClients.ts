import { ModuleDefinition } from './modulesTypes';
import { ClientsRoot } from '../pages/ClientsRoot';
import { ClientsPage } from '../pages/ClientsPage';
import { ClientFormPage } from '../pages/ClientFormPage';
import { ClientDetailPage } from '../pages/ClientDetailPage';
import { FidelitePage } from '../pages/FidelitePage';
import { InteractionsPage } from '../pages/InteractionsPage';
import { RapportsPage as ClientsRapportsPage } from '../pages/ClientsRapportsPage';
import { CommandesClientPage } from '../pages/CommandesClientPage';
import { CommandeClientFormPage } from '../pages/CommandeClientFormPage';
import { CommandeClientDetailPage } from '../pages/CommandeClientDetailPage';

export const MANAGEMENT_CLIENTS: ModuleDefinition[] = [
  // ============================================================
  // CLIENTS (visible dans la sidebar)
  // ============================================================
  {
    id: 'management-clients',
    path: '/gestion/clients',
    label: 'Clients',
    icon: 'Users',
    description: 'Gestion des clients et commandes',
    roles: ['admin', 'gestionnaire'],
    order: 30,
    component: ClientsRoot,
    isManagement: true,
    isSidebarItem: true,
    isBottomNav: false,
  },
  // ============================================================
  // SOUS-MODULES CLIENTS (non visibles dans la sidebar)
  // ============================================================
  {
    id: 'clients-liste',
    path: '/gestion/clients/liste',
    label: 'Liste des clients',
    icon: 'Users',
    description: 'Gestion des clients',
    roles: ['admin', 'gestionnaire'],
    order: 30.1,
    component: ClientsPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-nouveau',
    path: '/gestion/clients/nouveau',
    label: 'Nouveau client',
    icon: 'UserPlus',
    description: 'Ajouter un client',
    roles: ['admin', 'gestionnaire'],
    order: 30.2,
    component: ClientFormPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-modifier',
    path: '/gestion/clients/:id/edit',
    label: 'Modifier client',
    icon: 'UserEdit',
    description: 'Modifier un client',
    roles: ['admin', 'gestionnaire'],
    order: 30.3,
    component: ClientFormPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-detail',
    path: '/gestion/clients/:id',
    label: 'Fiche client',
    icon: 'User',
    description: 'Détail du client',
    roles: ['admin', 'gestionnaire'],
    order: 30.4,
    component: ClientDetailPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-fidelite',
    path: '/gestion/clients/fidelite',
    label: 'Fidélité',
    icon: 'Star',
    description: 'Points et niveaux',
    roles: ['admin', 'gestionnaire'],
    order: 30.5,
    component: FidelitePage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-interactions',
    path: '/gestion/clients/interactions',
    label: 'Interactions',
    icon: 'Phone',
    description: 'Suivi des interactions',
    roles: ['admin', 'gestionnaire'],
    order: 30.6,
    component: InteractionsPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-rapports',
    path: '/gestion/clients/rapports',
    label: 'Rapports',
    icon: 'BarChart',
    description: 'Statistiques clients',
    roles: ['admin', 'gestionnaire'],
    order: 30.7,
    component: ClientsRapportsPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  // ============================================================
  // COMMANDES CLIENT (dans le module Clients)
  // ============================================================
  {
    id: 'clients-commandes',
    path: '/gestion/clients/commandes',
    label: 'Commandes client',
    icon: 'Truck',
    description: 'Gestion des commandes clients',
    roles: ['admin', 'gestionnaire'],
    order: 30.8,
    component: CommandesClientPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-commande-nouvelle',
    path: '/gestion/clients/commandes/nouvelle',
    label: 'Nouvelle commande',
    icon: 'PlusCircle',
    description: 'Créer une commande',
    roles: ['admin', 'gestionnaire'],
    order: 30.9,
    component: CommandeClientFormPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
  {
    id: 'clients-commande-detail',
    path: '/gestion/clients/commandes/:id',
    label: 'Détail commande',
    icon: 'Eye',
    description: 'Détail d\'une commande',
    roles: ['admin', 'gestionnaire'],
    order: 30.10,
    component: CommandeClientDetailPage,
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: false,
  },
];
