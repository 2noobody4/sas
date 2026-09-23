// ============================================================
// MAIN MODULES — Modules principaux de l'application
// Version V3 — Compatible React 16
// ============================================================

import { ModuleDefinition } from './modulesTypes';
import { DashboardRoot } from '../pages/DashboardRoot';
import { HomePage } from '../pages/HomePage';
import { BoutiquePage } from '../pages/BoutiquePage';
import { PanierPage } from '../pages/PanierPage';
import { ServicesPage } from '../pages/ServicesPage';
import React from 'react';

// ⚠️ IMPORTANT : Utilisation de React.lazy pour éviter la dépendance circulaire
const ManagementRoot = React.lazy(() => import('../pages/ManagementRoot'));

export const MAIN_MODULES: ModuleDefinition[] = [
  {
    id: 'dashboard',
    path: '/dashboard',
    label: 'Dashboard',
    icon: 'LayoutDashboard',
    description: 'Tableau de bord',
    roles: ['admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe'],
    order: 0,
    component: DashboardRoot,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'home',
    path: '/',
    label: 'Accueil',
    icon: 'Home',
    description: "Page d'accueil",
    roles: ['client', 'admin', 'gestionnaire'],
    order: 1,
    component: HomePage,
    isManagement: false,
    isBottomNav: true,
  },
  {
    id: 'boutique',
    path: '/boutique',
    label: 'Boutique',
    icon: 'ShoppingBag',
    description: 'Boutique en ligne',
    roles: ['client', 'admin', 'gestionnaire'],
    order: 2,
    component: BoutiquePage,
    isManagement: false,
    isBottomNav: true,
  },
  {
    id: 'services-public',
    path: '/services',
    label: 'Services',
    icon: 'Briefcase',
    description: 'Nos services',
    roles: ['client', 'admin', 'gestionnaire'],
    order: 2.5,
    component: ServicesPage,
    isManagement: false,
    isBottomNav: true,
  },
  {
    id: 'panier',
    path: '/boutique/panier',
    label: 'Panier',
    icon: 'ShoppingCart',
    description: 'Mon panier',
    roles: ['client', 'admin', 'gestionnaire'],
    order: 3,
    component: PanierPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'gestion',
    path: '/gestion',
    label: 'Gestion',
    icon: 'LayoutDashboard',
    description: 'Espace de gestion',
    roles: ['admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe'],
    order: 99,
    component: ManagementRoot, // ← React.lazy
    isManagement: true,
    isSidebarItem: false,
    isBottomNav: true,
  },
];
