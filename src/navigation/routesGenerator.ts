/**
 * ROUTES GENERATOR — Génère les routes à partir des registres existants
 * Version V3 — Compatible React 16
 * 
 * ⚠️ Ne modifie PAS les registres existants (componentRegistry, modulesRegistry)
 */

import { MODULES_REGISTRY, getNavItems, getManagementModules } from '../registres/modulesRegistry';
import { ModuleDefinition } from '../registres/modules/types';
import { RouteConfig } from '../types/navigation';
import { ComponentType } from 'react';

// ============================================================
// RESOLUTION DE COMPOSANT
// Un module du registre peut déclarer `component` sous forme de
// chaîne (référence) ou de composant React. Les routes n'acceptent
// qu'un composant React : on filtre proprement les chaînes.
// ============================================================

function resolveModuleComponent(
  component: ModuleDefinition['component']
): ComponentType<any> | null {
  if (!component) return null;
  if (typeof component === 'string') {
    console.warn(
      `[routesGenerator] Module ignoré : composant déclaré sous forme de chaîne ("${component}").`
    );
    return null;
  }
  return component;
}

/** Trie les routes de la plus spécifique à la plus générique (react-router v5 / Switch) */
function trierParSpecificite(routes: RouteConfig[]): RouteConfig[] {
  return routes.slice().sort((a, b) => {
    const sa = a.path.split('/').filter(Boolean).length;
    const sb = b.path.split('/').filter(Boolean).length;
    if (sa !== sb) return sb - sa;
    return b.path.length - a.path.length;
  });
}


// ============================================================
// FONCTIONS DE GÉNÉRATION
// ============================================================

/**
 * Génère les routes à partir du MODULES_REGISTRY
 * Chaque module avec un composant devient une route
 */
export function generateRoutesFromRegistry(): RouteConfig[] {
  const routes: RouteConfig[] = [];

  for (const module of MODULES_REGISTRY) {
    // Ignorer les modules sans composant React exploitable
    const component = resolveModuleComponent(module.component);
    if (!component) continue;

    routes.push({
      path: module.path,
      component,
      label: module.label,
      icon: module.icon,
      roles: module.roles,
      order: module.order,
      isManagement: module.isManagement,
      isNavBar: module.isBottomNav || false,
      isSideNav: module.isSidebarItem || false,
      isFormPage: false, // À définir manuellement si besoin
    });
  }

  return routes;
}

/**
 * Génère les routes de gestion à partir des modules de gestion
 */
export function generateManagementRoutes(): RouteConfig[] {
  const modules = MODULES_REGISTRY.filter(m => m.isManagement === true);
  const routes: RouteConfig[] = [];

  for (const module of modules) {
    const component = resolveModuleComponent(module.component);
    if (!component) continue;

    routes.push({
      path: module.path,
      component,
      label: module.label,
      icon: module.icon,
      roles: module.roles,
      order: module.order,
      isManagement: true,
      isNavBar: false,
      isSideNav: module.isSidebarItem || false,
      isFormPage: false,
    });
  }

  return routes;
}

/**
 * Génère les routes de navigation (navbar du bas)
 */
export function generateNavRoutes(role: string = 'client'): RouteConfig[] {
  const navItems = getNavItems(role);
  const routes: RouteConfig[] = [];

  for (const item of navItems) {
    const module = MODULES_REGISTRY.find(m => m.id === item.id);
    const component = module ? resolveModuleComponent(module.component) : null;
    if (!component) continue;

    routes.push({
      path: item.path,
      component,
      label: item.label,
      icon: item.icone,
      roles: item.roles,
      order: item.ordre,
      isNavBar: true,
      isManagement: false,
      isSideNav: false,
      isFormPage: false,
    });
  }

  return routes;
}

/**
 * Génère les routes de sidebar
 */
export function generateSidebarRoutes(role: string = 'client'): RouteConfig[] {
  const managementModules = getManagementModules(role);
  const routes: RouteConfig[] = [];

  for (const module of managementModules) {
    const component = resolveModuleComponent(module.component);
    if (!component) continue;

    routes.push({
      path: module.path,
      component,
      label: module.label,
      icon: module.icon,
      roles: module.roles,
      order: module.order,
      isManagement: true,
      isNavBar: false,
      isSideNav: true,
      isFormPage: false,
    });
  }

  return routes;
}

// ============================================================
// ROUTES UNIQUES (fusion)
// ============================================================

export const ALL_ROUTES: RouteConfig[] = trierParSpecificite(generateRoutesFromRegistry());

export const MANAGEMENT_ROUTES: RouteConfig[] = trierParSpecificite(generateManagementRoutes());

export const NAV_ROUTES = (role: string = 'client'): RouteConfig[] => generateNavRoutes(role);

export const SIDEBAR_ROUTES = (role: string = 'client'): RouteConfig[] => generateSidebarRoutes(role);

// ============================================================
// HELPERS
// ============================================================

export function getRouteByPath(path: string): RouteConfig | undefined {
  return ALL_ROUTES.find(r => r.path === path);
}

export function getRoutesByRole(role: string = 'client'): RouteConfig[] {
  return ALL_ROUTES.filter(r => {
    if (!r.roles || r.roles.length === 0) return true;
    return r.roles.includes(role);
  });
}
