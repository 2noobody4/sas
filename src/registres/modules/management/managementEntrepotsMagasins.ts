import { ModuleDefinition } from '../types';
import { EntrepotsPage } from '../../../pages/entrepots/EntrepotsPage';
import { EntrepotFormPage } from '../../../pages/entrepots/EntrepotFormPage';
import { EntrepotDetailPage } from '../../../pages/entrepots/EntrepotDetailPage';
import { EmplacementsPage } from '../../../pages/entrepots/EmplacementsPage';
import { MagasinsPage } from '../../../pages/admin/MagasinsPage';
import { MagasinFormPage } from '../../../pages/admin/MagasinFormPage';
import { HomeEditorPage } from '../../../pages/admin/HomeEditorPage';

export const MANAGEMENT_ENTREPOTS_MAGASINS: ModuleDefinition[] = [
  // ENTREPÔTS
  {
    id: 'management-entrepots',
    path: '/gestion/entrepots',
    label: 'Entrepôts',
    icon: 'Warehouse',
    description: 'Gestion des entrepôts et transferts',
    roles: ['admin', 'gestionnaire', 'magasinier'],
    order: 120,
    component: EntrepotsPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-entrepots-nouveau',
    path: '/gestion/entrepots/nouveau',
    label: 'Nouvel entrepôt',
    icon: 'Warehouse',
    description: 'Créer un entrepôt',
    roles: ['admin', 'gestionnaire'],
    order: 121,
    component: EntrepotFormPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-entrepots-detail',
    path: '/gestion/entrepots/:id',
    label: 'Détail entrepôt',
    icon: 'Warehouse',
    description: 'Détail d\'un entrepôt',
    roles: ['admin', 'gestionnaire', 'magasinier'],
    order: 122,
    component: EntrepotDetailPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-emplacements',
    path: '/gestion/entrepots/:id/emplacements',
    label: 'Emplacements',
    icon: 'Layers',
    description: 'Gestion des emplacements de l\'entrepôt',
    roles: ['admin', 'gestionnaire', 'magasinier'],
    order: 123,
    component: EmplacementsPage,
    isManagement: true,
    isSidebarItem: false,
  },

  // MAGASINS
  {
    id: 'management-magasins',
    path: '/gestion/magasins',
    label: 'Magasins',
    icon: 'Store',
    description: 'Gestion des magasins',
    roles: ['admin', 'gestionnaire'],
    order: 124,
    component: MagasinsPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-magasins-nouveau',
    path: '/gestion/magasins/nouveau',
    label: 'Nouveau magasin',
    icon: 'Store',
    description: 'Créer un magasin',
    roles: ['admin', 'gestionnaire'],
    order: 124.1,
    component: MagasinFormPage,
    isManagement: true,
    isSidebarItem: false,
  },
  {
    id: 'management-magasins-detail',
    path: '/gestion/magasins/:id',
    label: 'Détail magasin',
    icon: 'Store',
    description: 'Détail d\'un magasin',
    roles: ['admin', 'gestionnaire'],
    order: 124.2,
    component: MagasinFormPage,
    isManagement: true,
    isSidebarItem: false,
  },

  // PAGE D'ACCUEIL
  {
    id: 'management-home-editor',
    path: '/gestion/home',
    label: 'Page d\'accueil',
    icon: 'Home',
    description: 'Éditeur de la page d\'accueil',
    roles: ['admin', 'gestionnaire'],
    order: 117.5,
    component: HomeEditorPage,
    isManagement: true,
    isSidebarItem: true,
  },
];
