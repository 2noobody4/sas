// ============================================================
// USE NAVIGATION — Navigation pilotée par user_modules
// Version V3.2 — Compatible React 16
// ============================================================

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuItems } from './useMenuItems';
import { getRouteByPath } from '../utils/routesGenerator';
import type { NavItem, RouteConfig } from '../types/navigation';
import type { SidebarNode } from './useMenuItems';

export interface UseNavigationReturn {
  navItems: NavItem[];
  sidebarItems: SidebarNode[];
  sidebarTree: SidebarNode[];
  isLoading: boolean;
  currentRoute: RouteConfig | undefined;
  isActive: (path: string) => boolean;
  refreshMenu: () => void;
}

export interface UseNavigationParams {
  role?: string;
  assignedModuleIds?: string[];
}

export function useNavigation({
  role = 'client',
  assignedModuleIds = [],
}: UseNavigationParams = {}): UseNavigationReturn {
  const location = useLocation();
  const menu = useMenuItems({ role, assignedModuleIds });

  const currentRoute = useMemo(
    () => getRouteByPath(location.pathname),
    [location.pathname]
  );

  const isActive = (path: string): boolean => {
    if (path === '/') return location.pathname === '/';
    return location.pathname === path || location.pathname.startsWith(path + '/');
  };

  return {
    navItems: menu.navItems,
    sidebarItems: menu.sidebarItems,
    sidebarTree: menu.sidebarTree,
    isLoading: menu.isLoading,
    currentRoute,
    isActive,
    refreshMenu: menu.refetch,
  };
}

export default useNavigation;
