// ============================================================
// MANAGEMENT SERVICES — Modules des services
// Version V3 — Retire ServiceFormPage (remplacé par ServiceFormModal)
// ============================================================

import { ModuleDefinition } from './modulesTypes';
import { ServicesRoot } from '../pages/ServicesRoot';
import { ServicesAdminPage } from '../pages/ServicesAdminPage';
import { AttributsServiceSettings } from '../components/AttributsServiceSettings';
import { ServicesCategoriesPage } from '../pages/ServicesCategoriesPage';
import { DemandesServicePage } from '../pages/DemandesServicePage';
import { CommanderServicePage } from '../pages/CommanderServicePage';
import { MesDemandesServicePage } from '../pages/MesDemandesServicePage';
import { ServiceDetailPage } from '../pages/ServicesServiceDetailPage';

export const MANAGEMENT_SERVICES: ModuleDefinition[] = [
  {
    id: 'management-services',
    path: '/gestion/services',
    label: 'Services',
    icon: 'Briefcase',
    description: 'Gestion des services et prestations',
    roles: ['admin', 'gestionnaire'],
    order: 114.5,
    component: ServicesRoot,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-services-liste',
    path: '/gestion/services/liste',
    label: 'Liste des services',
    icon: 'List',
    description: 'Catalogue des services',
    roles: ['admin', 'gestionnaire'],
    order: 114.6,
    component: ServicesAdminPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-services-detail',
    path: '/gestion/services/:id',
    label: 'Détail service',
    icon: 'Eye',
    description: 'Détail d\'un service',
    roles: ['admin', 'gestionnaire'],
    order: 114.72,
    component: ServiceDetailPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-services-categories',
    path: '/gestion/services/categories',
    label: 'Catégories de service',
    icon: 'Tag',
    description: 'Gérer les catégories de services',
    roles: ['admin', 'gestionnaire'],
    order: 114.8,
    component: ServicesCategoriesPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-services-attributs',
    path: '/gestion/services/attributs',
    label: 'Attributs des services',
    icon: 'ClipboardList',
    description: 'Gestion des attributs des services',
    roles: ['admin', 'gestionnaire'],
    order: 114.9,
    component: AttributsServiceSettings,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-services-demandes',
    path: '/gestion/services/demandes',
    label: 'Demandes de service',
    icon: 'ClipboardList',
    description: 'Suivi des demandes clients',
    roles: ['admin', 'gestionnaire'],
    order: 114.95,
    component: DemandesServicePage,
    isManagement: true,
    isSidebarItem: false,
  },
];

// ⭐ Modules client (public)
export const CLIENT_SERVICES_MODULES: ModuleDefinition[] = [
  {
    id: 'commander-service',
    path: '/services/:id/commander',
    label: 'Commander un service',
    icon: 'Send',
    description: 'Demander un service',
    roles: ['client', 'admin', 'gestionnaire'],
    order: 103,
    component: CommanderServicePage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'mes-demandes-service',
    path: '/mes-demandes-service',
    label: 'Mes demandes',
    icon: 'Clock',
    description: 'Suivi de mes demandes de service',
    roles: ['client', 'admin', 'gestionnaire'],
    order: 104,
    component: MesDemandesServicePage,
    isManagement: false,
    isBottomNav: false,
  },
];
