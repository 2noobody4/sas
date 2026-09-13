// ============================================================
// MODULES TYPES — Définition des types de modules
// Version V3 — Compatible React 16
// ============================================================

import { ComponentType } from 'react';

export interface ModuleDefinition {
  id: string;
  path: string;
  label: string;
  icon: string;
  description?: string;
  roles?: string[];
  order: number;
  component: string | ComponentType<any> | null;
  isManagement: boolean;
  isSidebarItem?: boolean;
  isBottomNav?: boolean;
  parentId?: string;
  badgeSource?: string;
  badgeColor?: string;
  visible?: boolean;
}

export interface NavItem {
  id: string;
  icone: string;
  label: string;
  path: string;
  ordre: number;
  visible: boolean;
  roles?: string[];
  badgeCount?: number;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'default';
}

// ============================================================
// BADGE_SOURCES — Configuration des badges
// ============================================================
export const BADGE_SOURCES = {
  stock_alerts: {
    label: 'Alertes stock',
    color: 'yellow' as const,
  },
  new_clients: {
    label: 'Nouveaux clients',
    color: 'green' as const,
  },
  pending_ventes: {
    label: 'Ventes en attente',
    color: 'red' as const,
  },
  pending_orders: {
    label: 'Commandes en attente',
    color: 'purple' as const,
  },
  cart_count: {
    label: 'Panier',
    color: 'red' as const,
  },
  unread_messages: {
    label: 'Messages non lus',
    color: 'red' as const,
  },
} as const;

export type BadgeSource = keyof typeof BADGE_SOURCES;
