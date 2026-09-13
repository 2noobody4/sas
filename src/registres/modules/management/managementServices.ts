// ============================================================
// MANAGEMENT SERVICES — Modules des services
// Version V3 — Compatible React 16
// ============================================================

import { ModuleDefinition } from '../types';
import { ServicesAdminPage } from '../../../pages/gestion/services/ServicesAdminPage';
import { ServiceFormPage } from '../../../pages/gestion/services/ServiceFormPage';
import { AttributsServiceSettings } from '../../../pages/gestion/services/AttributsServiceSettings';

export const MANAGEMENT_SERVICES: ModuleDefinition[] = [
  {
    id: 'management-services',
    path: '/gestion/services',
    label: 'Services',
    icon: 'Briefcase',
    description: 'Gestion des services et prestations',
    roles: ['admin', 'gestionnaire'],
    order: 114.5,
    component: ServicesAdminPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-services-liste',
    path: '/gestion/services',
    label: 'Liste des services',
    icon: 'List',
    description: 'Liste complète des services',
    roles: ['admin', 'gestionnaire'],
    order: 114.6,
    component: ServicesAdminPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-services-nouveau',
    path: '/gestion/services/nouveau',
    label: 'Ajouter un service',
    icon: 'PlusCircle',
    description: 'Créer un nouveau service',
    roles: ['admin', 'gestionnaire'],
    order: 114.7,
    component: ServiceFormPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-services-attributs',
    path: '/gestion/services/attributs',
    label: 'Attributs des services',
    icon: 'Tags',
    description: 'Gestion des attributs des services',
    roles: ['admin', 'gestionnaire'],
    order: 114.8,
    component: AttributsServiceSettings,
    isManagement: true,
    isSidebarItem: false,
  },
];
