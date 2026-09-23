// ============================================================
// USE MENU ITEMS — Navigation pilotée par user_modules + user_config
// Version V3.7 — Compatible React 16.14
// ------------------------------------------------------------
// Retourne parents + enfants avec hiérarchie (parentId).
// ============================================================

import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useConfig } from '../contexts/ConfigContext';
import { useUserConfig } from './useUserConfig';
import { MODULES_REGISTRY } from '../registres/modulesRegistry';
import type { ModuleDefinition } from '../registres/modulesTypes';
import type { NavItem } from '../types/navigation';
import { PUBLIC_MODULE_IDS } from '../utils/publicModules';

export const MENU_ITEMS_QUERY_KEY = 'menu_items';

export interface SidebarNode extends NavItem {
  parentId?: string;
  children?: SidebarNode[];
  hasChildren?: boolean;
}

export interface UseMenuItemsResult {
  navItems: NavItem[];
  sidebarItems: SidebarNode[];
  sidebarTree: SidebarNode[];
  allVisibleModules: ModuleDefinition[];
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

function isModuleAllowed(
  module: ModuleDefinition,
  allowedModuleIds: string[],
  allowedPaths: string[]
): boolean {
  if (allowedModuleIds.includes(module.id)) return true;
  for (const path of allowedPaths) {
    if (module.path === path || module.path.startsWith(path + '/')) {
      return true;
    }
  }
  return false;
}

function computeAllowedPaths(allowedModuleIds: string[]): string[] {
  return MODULES_REGISTRY
    .filter((m) => allowedModuleIds.includes(m.id))
    .map((m) => m.path);
}

export interface UseMenuItemsParams {
  role?: string;
  assignedModuleIds?: string[];
  useDbOverrides?: boolean;
}

export function useMenuItems({
  role = 'client',
  assignedModuleIds = [],
  useDbOverrides = true,
}: UseMenuItemsParams = {}): UseMenuItemsResult {
  const config = useConfig();
  const { data: userConfig } = useUserConfig();

  const { data: dbOverrides, isLoading, error, refetch } = useQuery<any[]>(
    [MENU_ITEMS_QUERY_KEY],
    async () => {
      const { data, error } = await supabase
        .from('menu_items')
        .select('id, label, icone, ordre, visible, section, badge_count, badge_color, disabled, permission');
      if (error) throw error;
      return data || [];
    },
    {
      staleTime: 1000 * 60 * 60,
      retry: 1,
      enabled: useDbOverrides,
    }
  );

  const shortcutsKey = JSON.stringify({
    user: userConfig?.sidebar_shortcuts || [],
    global: config.sidebar_shortcuts || [],
  });

  return useMemo(() => {
    const isAdmin = role === 'admin' || role === 'gestionnaire';
    const isClient = role === 'client' || !role;

    let allowedModuleIds: string[];

    if (isAdmin) {
      allowedModuleIds = MODULES_REGISTRY
        .filter((m) => m.visible !== false)
        .map((m) => m.id);
    } else if (isClient) {
      allowedModuleIds = [...PUBLIC_MODULE_IDS];
    } else {
      allowedModuleIds = Array.from(new Set([
        ...PUBLIC_MODULE_IDS,
        ...assignedModuleIds,
      ]));
    }

    const allowedPaths = computeAllowedPaths(allowedModuleIds);

    const shouldHide = (id: string): boolean => {
      if (id === 'boutique' || id === 'panier') {
        return config.loaded && config.show_boutique === false;
      }
      if (id === 'services-public') {
        return config.loaded && config.show_services === false;
      }
      return false;
    };

    const visibleModules = MODULES_REGISTRY.filter((m) => {
      if (m.visible === false) return false;
      if (shouldHide(m.id)) return false;
      return isModuleAllowed(m, allowedModuleIds, allowedPaths);
    });

    const overridesMap = new Map<string, any>();
    (dbOverrides || []).forEach((o) => overridesMap.set(o.id, o));

    const mergedModules = visibleModules.map((m) => {
      const ov = overridesMap.get(m.id);
      if (!ov) return m;
      if (ov.visible === false) return null;
      return {
        ...m,
        label: ov.label || m.label,
        icon: ov.icone || m.icon,
        order: ov.ordre ?? m.order,
      } as ModuleDefinition;
    }).filter((m): m is ModuleDefinition => m !== null);

    // ---- NavItems ----
    const navItems: NavItem[] = mergedModules
      .filter((m) => m.isBottomNav === true)
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((m) => {
        const ov = overridesMap.get(m.id);
        return {
          id: m.id,
          icone: m.icon,
          label: m.label,
          path: m.path,
          ordre: m.order ?? 0,
          visible: true,
          roles: undefined,
          badgeCount: ov?.badge_count || 0,
          badgeColor: (ov?.badge_color as any) || 'default',
        };
      });

    // ---- Sidebar : parents + enfants ----
    const allManagementModules = mergedModules.filter(
      (m) => m.isManagement === true
    );

    const parents = allManagementModules.filter((m) => m.isSidebarItem !== false);
    const children = allManagementModules.filter((m) => m.isSidebarItem === false);

    // Associer chaque enfant à son parent (par préfixe de path)
    const childrenWithParent: Array<{ child: ModuleDefinition; parentId: string }> = [];
    children.forEach((child) => {
      const parent = parents.find(
        (p) => child.path !== p.path && child.path.startsWith(p.path + '/')
      );
      if (parent) {
        childrenWithParent.push({ child, parentId: parent.id });
      }
    });

    // Filtre par shortcuts (tolérant : parent OU enfant sélectionné)
    const userShortcuts = userConfig?.sidebar_shortcuts || [];
    const globalShortcuts = config.sidebar_shortcuts || [];
    const effectiveShortcuts = userShortcuts.length > 0 ? userShortcuts : globalShortcuts;
    const hasShortcuts = effectiveShortcuts.length > 0;

    const isVisible = (moduleId: string): boolean => {
      if (!hasShortcuts) return true;
      return effectiveShortcuts.includes(moduleId);
    };

    const visibleParents = parents.filter((p) => {
      if (!hasShortcuts) return true;
      if (effectiveShortcuts.includes(p.id)) return true;
      // Parent visible si un de ses enfants est sélectionné
      return childrenWithParent.some(
        (c) => c.parentId === p.id && effectiveShortcuts.includes(c.child.id)
      );
    });

    // Construire les SidebarNode parents
    const sidebarItems: SidebarNode[] = visibleParents
      .sort((a, b) => (a.order ?? 0) - (b.order ?? 0))
      .map((m) => {
        const parentChildren = childrenWithParent
          .filter((c) => c.parentId === m.id)
          .filter((c) => isVisible(c.child.id))
          .sort((a, b) => (a.child.order ?? 0) - (b.child.order ?? 0))
          .map((c) => ({
            id: c.child.id,
            icone: c.child.icon,
            label: c.child.label,
            path: c.child.path,
            ordre: c.child.order ?? 0,
            visible: true,
            roles: undefined,
            badgeCount: 0,
            badgeColor: 'default' as const,
            parentId: m.id,
          }));

        return {
          id: m.id,
          icone: m.icon,
          label: m.label,
          path: m.path,
          ordre: m.order ?? 0,
          visible: true,
          roles: undefined,
          badgeCount: 0,
          badgeColor: 'default' as const,
          hasChildren: parentChildren.length > 0,
          children: parentChildren,
        };
      });

    // Version aplatie (parents + enfants) pour compatibilité
    const flatSidebarItems: SidebarNode[] = [];
    sidebarItems.forEach((parent) => {
      flatSidebarItems.push(parent);
      if (parent.children) {
        flatSidebarItems.push(...parent.children);
      }
    });

    return {
      navItems,
      sidebarItems: flatSidebarItems,
      sidebarTree: sidebarItems,
      allVisibleModules: mergedModules,
      isLoading,
      error,
      refetch: () => { void refetch(); },
    };
  }, [
    role,
    assignedModuleIds.join(','),
    shortcutsKey,
    dbOverrides,
    config.loaded,
    config.show_boutique,
    config.show_services,
    isLoading,
    error,
    refetch,
  ]);
}

export default useMenuItems;
