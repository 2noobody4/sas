// ============================================================
// MODULES HELPERS — Fonctions utilitaires pour les modules
// Version V3 — Compatible React 16
// ============================================================

import { ModuleDefinition, NavItem, BADGE_SOURCES } from './types';
import { MAIN_MODULES } from './mainModules';
import { OTHER_MODULES } from './otherModules';
import { MANAGEMENT_MODULES } from './management/index';

// ============================================================
// REGISTRE COMPLET
// ============================================================

export const MODULES_REGISTRY: ModuleDefinition[] = [
  ...MAIN_MODULES,
  ...OTHER_MODULES,
  ...MANAGEMENT_MODULES,
];

// ============================================================
// HELPERS
// ============================================================

export function getModulesByRole(role: string = 'client'): ModuleDefinition[] {
  return MODULES_REGISTRY.filter((module) => {
    const isVisible = module.visible !== false;
    const hasRole = !module.roles || module.roles.length === 0 || module.roles.includes(role);
    return isVisible && hasRole;
  });
}

export function getNavModules(role: string = 'client'): ModuleDefinition[] {
  return getModulesByRole(role)
    .filter((m) => m.isBottomNav === true)
    .sort((a, b) => a.order - b.order);
}

export function getManagementModules(role: string = 'admin'): ModuleDefinition[] {
  return getModulesByRole(role)
    .filter((m) => m.isManagement === true)
    .sort((a, b) => a.order - b.order);
}

export function moduleToNavItem(module: ModuleDefinition): NavItem {
  let badgeColor: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'default' = 'default';
  if (module.badgeSource && BADGE_SOURCES[module.badgeSource as keyof typeof BADGE_SOURCES]) {
    const source = BADGE_SOURCES[module.badgeSource as keyof typeof BADGE_SOURCES];
    badgeColor = source.color as any;
  }
  return {
    id: module.id,
    icone: module.icon,
    label: module.label,
    path: module.path,
    ordre: module.order,
    visible: module.visible !== false,
    roles: module.roles,
    badgeCount: 0,
    badgeColor: badgeColor,
  };
}

export function getNavItems(role: string = 'client'): NavItem[] {
  return getNavModules(role).map(moduleToNavItem);
}

export function getModuleById(id: string): ModuleDefinition | undefined {
  return MODULES_REGISTRY.find((m) => m.id === id);
}

export function getModuleByPath(path: string): ModuleDefinition | undefined {
  return MODULES_REGISTRY.find((m) => m.path === path);
}
