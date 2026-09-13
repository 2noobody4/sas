import { ModuleDefinition } from '../types';
import { DashboardPage } from '../../../pages/DashboardPage';

export const MANAGEMENT_DASHBOARD: ModuleDefinition[] = [
  {
    id: 'management-dashboard',
    path: '/gestion/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    description: "Vue d'ensemble de la gestion",
    roles: ['admin', 'gestionnaire'],
    order: 99,
    component: DashboardPage,
    isManagement: true,
    isSidebarItem: true,
  },
];
