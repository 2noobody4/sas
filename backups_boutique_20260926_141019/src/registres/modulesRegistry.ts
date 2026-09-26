// ============================================================
// MODULES REGISTRY — Point d'entrée unifié
// Version V3.1 — Compatible React 16
// ============================================================

import { MAIN_MODULES as _MAIN_MODULES } from './mainModules';
import { OTHER_MODULES as _OTHER_MODULES } from './otherModules';
import { MANAGEMENT_MODULES as _MANAGEMENT_MODULES } from './managementModules';
import { CLIENT_SERVICES_MODULES as _CLIENT_SERVICES_MODULES } from './managementServices';

// ============================================================
// HELPERS
// ============================================================

import { ModuleDefinition, NavItem } from './modulesTypes';

// Registre complet
export const MODULES_REGISTRY: ModuleDefinition[] = [
  ..._MAIN_MODULES,
  ..._OTHER_MODULES,
  ..._MANAGEMENT_MODULES,
  ..._CLIENT_SERVICES_MODULES,
];

// ============================================================
// FONCTIONS EXPORTÉES
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
  return {
    id: module.id,
    icone: module.icon,
    label: module.label,
    path: module.path,
    ordre: module.order,
    visible: module.visible !== false,
    roles: module.roles,
    badgeCount: 0,
    badgeColor: 'default',
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

// Exports par défaut pour compatibilité
export default {
  MODULES_REGISTRY,
  getModulesByRole,
  getNavModules,
  getManagementModules,
  getNavItems,
  getModuleById,
  getModuleByPath,
};
