// ============================================================
// MANAGEMENT PRODUITS — Modules publics des produits (boutique)
// Version V1
// ============================================================

import { ModuleDefinition } from './modulesTypes';
import { ProduitDetailPage } from '../pages/ProduitDetailPage';

// ⭐ Modules client (public)
export const CLIENT_PRODUITS_MODULES: ModuleDefinition[] = [
  {
    id: 'produit-detail-public',
    path: '/boutique/:id',
    label: 'Détail produit',
    icon: 'Package',
    description: "Page publique de détail d'un produit",
    roles: ['client', 'admin', 'gestionnaire'],
    order: 102.5,
    component: ProduitDetailPage,
    isManagement: false,
    isBottomNav: false,
  },
];
