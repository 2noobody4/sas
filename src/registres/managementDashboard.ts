import { ModuleDefinition } from './modulesTypes';
import { StockDashboard } from '../components/StockDashboard';

export const MANAGEMENT_DASHBOARD: ModuleDefinition[] = [
  {
    id: 'management-dashboard',
    path: '/gestion/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    description: "Vue d'ensemble de la gestion",
    roles: ['admin', 'gestionnaire'],
    order: 99,
    component: StockDashboard,
    isManagement: true,
    isSidebarItem: true,
  },
];
