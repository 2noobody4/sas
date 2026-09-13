import { ModuleDefinition } from '../types';
import { DemandesPage } from '../../../pages/demandes/DemandesPage';
import { AnalyticsPage } from '../../../pages/analytics/AnalyticsPage';
import { ThemeEditorPage } from '../../../pages/admin/ThemeEditorPage';
import { AnimationEditorPage } from '../../../pages/admin/AnimationEditorPage';
import { SettingsPage } from '../../../pages/admin/SettingsPage';
import { HistoriquePage } from '../../../pages/admin/HistoriquePage';

export const MANAGEMENT_ADMIN: ModuleDefinition[] = [
  {
    id: 'management-demandes',
    path: '/gestion/demandes',
    label: 'Demandes',
    icon: 'ClipboardList',
    description: 'Demandes en attente',
    roles: ['admin', 'gestionnaire'],
    order: 114,
    component: DemandesPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-analytics',
    path: '/gestion/analytics',
    label: 'Analytics',
    icon: 'BarChart',
    description: 'Statistiques avancées',
    roles: ['admin', 'gestionnaire'],
    order: 115,
    component: AnalyticsPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-theme',
    path: '/gestion/theme',
    label: 'Thème',
    icon: 'Palette',
    description: 'Personnalisation du thème',
    roles: ['admin', 'gestionnaire'],
    order: 116,
    component: ThemeEditorPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-animations',
    path: '/gestion/animations',
    label: 'Animations',
    icon: 'Film',
    description: 'Éditeur d\'animations',
    roles: ['admin', 'gestionnaire'],
    order: 117,
    component: AnimationEditorPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-params',
    path: '/gestion/params',
    label: 'Paramètres',
    icon: 'Settings',
    description: 'Paramètres généraux',
    roles: ['admin', 'gestionnaire'],
    order: 118,
    component: SettingsPage,
    isManagement: true,
    isSidebarItem: true,
  },
  {
    id: 'management-historique',
    path: '/gestion/historique',
    label: 'Historique',
    icon: 'FileText',
    description: 'Historique des actions',
    roles: ['admin', 'gestionnaire'],
    order: 119,
    component: HistoriquePage,
    isManagement: true,
    isSidebarItem: true,
  },
];
