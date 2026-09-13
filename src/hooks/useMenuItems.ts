// ============================================================
// USE MENU ITEMS — Navigation pilotée par la table `menu_items`
// Version V3 — Compatible React 16.14 / react-query v3
// ------------------------------------------------------------
// Source principale : table Supabase `menu_items`.
// Repli automatique : MODULES_REGISTRY (registre des éditeurs).
// ⚠️ Les registres ne sont JAMAIS modifiés ni supprimés : ils
//    restent la source des éditeurs de thème et d'animation.
// ============================================================

import { useMemo } from 'react';
import { useQuery } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { MODULES_REGISTRY } from '../registres/modulesRegistry';
import type { ModuleDefinition } from '../registres/modules/types';
import type { MenuItem } from '../types/menu';
import type { NavItem } from '../types/navigation';

export type MenuSource = 'database' | 'registry';

export interface MenuNode extends MenuItem {
  children: MenuNode[];
}

export interface MenuSection {
  id: string;
  label: string;
  items: MenuNode[];
}

export interface UseMenuItemsResult {
  /** Éléments bruts (déjà filtrés par rôle / permission / visibilité) */
  items: MenuItem[];
  /** Arborescence (parent_id) */
  tree: MenuNode[];
  /** Regroupement par `section` */
  sections: MenuSection[];
  /** Items destinés à la barre du bas */
  navItems: NavItem[];
  /** Items destinés à la sidebar de gestion */
  sidebarItems: NavItem[];
  /** D'où viennent les données */
  source: MenuSource;
  isLoading: boolean;
  error: unknown;
  refetch: () => void;
}

export const MENU_ITEMS_QUERY_KEY = 'menu_items';

const BADGE_COLORS = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'default'] as const;
type BadgeColor = (typeof BADGE_COLORS)[number];

function normaliserCouleur(couleur: string | null | undefined): BadgeColor {
  const valeur = (couleur || '').toLowerCase() as BadgeColor;
  return BADGE_COLORS.includes(valeur) ? valeur : 'default';
}

// ------------------------------------------------------------
// Lecture Supabase
// ------------------------------------------------------------
export async function fetchMenuItems(): Promise<MenuItem[]> {
  const { data, error } = await supabase
    .from('menu_items')
    .select(
      'id, icone, label, path, ordre, visible, roles, badge_count, badge_color, parent_id, section, target, disabled, permission, created_at, updated_at'
    )
    .order('ordre', { ascending: true, nullsFirst: false });

  if (error) throw error;
  return (data || []) as MenuItem[];
}

// ------------------------------------------------------------
// Repli : conversion du registre en items de menu
// ------------------------------------------------------------
export function menuItemsDepuisRegistre(): MenuItem[] {
  return MODULES_REGISTRY.filter((m: ModuleDefinition) => m.visible !== false).map((m) => ({
    id: m.id,
    icone: m.icon || null,
    label: m.label,
    path: m.path,
    ordre: m.order ?? 0,
    visible: true,
    roles: m.roles && m.roles.length > 0 ? m.roles : null,
    badge_count: null,
    badge_color: (m.badgeColor as string) || null,
    parent_id: m.parentId || null,
    section: m.isManagement ? 'gestion' : 'principal',
    target: null,
    disabled: false,
    permission: null,
  }));
}

// ------------------------------------------------------------
// Filtrage par rôle + permission
// ------------------------------------------------------------
export function filtrerMenuItems(
  items: MenuItem[],
  role: string,
  permissions: string[] = []
): MenuItem[] {
  const estAdmin = role === 'admin';
  return items.filter((item) => {
    if (item.visible === false) return false;
    if (item.roles && item.roles.length > 0 && !item.roles.includes(role) && !estAdmin) return false;
    if (item.permission && !estAdmin && !permissions.includes(item.permission)) return false;
    return true;
  });
}

// ------------------------------------------------------------
// Arborescence
// ------------------------------------------------------------
export function construireArbre(items: MenuItem[]): MenuNode[] {
  const parId = new Map<string, MenuNode>();
  items.forEach((item) => parId.set(item.id, { ...item, children: [] }));

  const racines: MenuNode[] = [];
  parId.forEach((node) => {
    const parent = node.parent_id ? parId.get(node.parent_id) : undefined;
    if (parent) parent.children.push(node);
    else racines.push(node);
  });

  const trier = (liste: MenuNode[]) => {
    liste.sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0));
    liste.forEach((n) => trier(n.children));
  };
  trier(racines);

  return racines;
}

export function construireSections(tree: MenuNode[]): MenuSection[] {
  const sections = new Map<string, MenuSection>();
  tree.forEach((node) => {
    const id = node.section || 'general';
    if (!sections.has(id)) {
      sections.set(id, { id, label: id.charAt(0).toUpperCase() + id.slice(1), items: [] });
    }
    sections.get(id)!.items.push(node);
  });
  return Array.from(sections.values());
}

export function menuItemVersNavItem(item: MenuItem): NavItem {
  return {
    id: item.id,
    icone: item.icone || 'Circle',
    label: item.label,
    path: item.path,
    ordre: item.ordre ?? 0,
    visible: item.visible !== false,
    roles: item.roles || undefined,
    badgeCount: item.badge_count || 0,
    badgeColor: normaliserCouleur(item.badge_color),
  };
}

// ------------------------------------------------------------
// Hook principal
// ------------------------------------------------------------
export function useMenuItems(role: string = 'client', permissions: string[] = []): UseMenuItemsResult {
  const { data, isLoading, error, refetch } = useQuery<MenuItem[], unknown>(
    [MENU_ITEMS_QUERY_KEY],
    fetchMenuItems,
    {
      staleTime: 1000 * 60 * 5,
      retry: 1,
      // Pas de crash de la navigation si la table est inaccessible
      onError: (err) => console.warn('[menu_items] lecture impossible, repli sur le registre', err),
    }
  );

  const permissionsCle = permissions.join('|');

  return useMemo(() => {
    const depuisDb = data && data.length > 0;
    const source: MenuSource = depuisDb ? 'database' : 'registry';
    const bruts = depuisDb ? (data as MenuItem[]) : menuItemsDepuisRegistre();
    const items = filtrerMenuItems(bruts, role, permissions);
    const tree = construireArbre(items);
    const sections = construireSections(tree);

    const registreParPath = new Map(MODULES_REGISTRY.map((m) => [m.path, m]));

    const navItems = items
      .filter((item) => {
        if (item.disabled) return false;
        if (depuisDb) {
          const section = (item.section || 'principal').toLowerCase();
          return !item.parent_id && ['bottom', 'navbar', 'principal'].indexOf(section) !== -1;
        }
        return registreParPath.get(item.path)?.isBottomNav === true;
      })
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map(menuItemVersNavItem);

    const sidebarItems = items
      .filter((item) => {
        if (item.disabled) return false;
        if (depuisDb) return (item.section || '').toLowerCase() === 'gestion';
        const mod = registreParPath.get(item.path);
        return mod?.isManagement === true && mod?.isSidebarItem !== false;
      })
      .sort((a, b) => (a.ordre ?? 0) - (b.ordre ?? 0))
      .map(menuItemVersNavItem);

    return {
      items,
      tree,
      sections,
      navItems,
      sidebarItems,
      source,
      isLoading,
      error,
      refetch: () => {
        void refetch();
      },
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [data, role, permissionsCle, isLoading, error, refetch]);
}

export default useMenuItems;
