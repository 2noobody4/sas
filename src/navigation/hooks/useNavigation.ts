/**
 * useNavigation — Navigation unifiée
 * ------------------------------------------------------------
 * Source principale : table `menu_items` (Supabase).
 * Repli : MODULES_REGISTRY (registre utilisé par les éditeurs).
 * Les registres restent intacts : ils alimentent toujours les
 * éditeurs de thème et d'animation.
 */

import { useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { useMenuItems } from '../../hooks/useMenuItems';
import type { MenuNode, MenuSection, MenuSource } from '../../hooks/useMenuItems';
import { getRouteByPath } from '../routesGenerator';
import type { NavItem, RouteConfig } from '../../types/navigation';

export interface UseNavigationReturn {
  /** Éléments de la navbar du bas */
  navItems: NavItem[];
  /** Éléments de la sidebar (gestion) */
  sidebarItems: NavItem[];
  /** Arborescence complète du menu */
  menuTree: MenuNode[];
  /** Menu regroupé par section */
  menuSections: MenuSection[];
  /** Origine des données : base ou registre */
  source: MenuSource;
  /** Chargement du menu en base */
  isLoading: boolean;
  /** Route actuelle */
  currentRoute: RouteConfig | undefined;
  /** Vérifier si une route est active */
  isActive: (path: string) => boolean;
  /** Recharger le menu depuis la base */
  refreshMenu: () => void;
}

export function useNavigation(
  role: string = 'client',
  permissions: string[] = []
): UseNavigationReturn {
  const location = useLocation();
  const menu = useMenuItems(role, permissions);

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
    menuTree: menu.tree,
    menuSections: menu.sections,
    source: menu.source,
    isLoading: menu.isLoading,
    currentRoute,
    isActive,
    refreshMenu: menu.refetch,
  };
}

export default useNavigation;
