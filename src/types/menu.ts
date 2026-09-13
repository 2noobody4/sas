// ============================================================
// MENU TYPES — Types pour les éléments de menu
// Version V3 — Compatible React 16
// ============================================================

export interface MenuItem {
  id: string;
  icone: string | null;
  label: string;
  path: string;
  ordre: number | null;
  visible: boolean | null;
  roles: string[] | null;
  badge_count: number | null;
  badge_color: string | null;
  parent_id: string | null;
  section: string | null;
  target: string | null;
  disabled: boolean | null;
  permission: string | null;
  created_at?: string;
  updated_at?: string;
}

export interface MenuItemFormData {
  icone?: string | null;
  label: string;
  path: string;
  ordre?: number | null;
  visible?: boolean | null;
  roles?: string[] | null;
  badge_count?: number | null;
  badge_color?: string | null;
  parent_id?: string | null;
  section?: string | null;
  target?: string | null;
  disabled?: boolean | null;
  permission?: string | null;
}
