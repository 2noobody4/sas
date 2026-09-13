// ============================================================
// NAVBAR STYLES — Point d'entrée des styles
// Version V3 — Compatible React 16
// ============================================================

import NavbarClassic from './NavbarClassic';
import NavbarDark from './NavbarDark';
import NavbarFloating from './NavbarFloating';
import NavbarMinimal from './NavbarMinimal';
import NavbarGradient from './NavbarGradient';
import NavbarGlass from './NavbarGlass';

// ============================================================
// EXPORTS
// ============================================================

export { NavbarClassic, NavbarDark, NavbarFloating, NavbarMinimal, NavbarGradient, NavbarGlass };

// ============================================================
// MAP DES STYLES
// ============================================================

export const NAVBAR_STYLES_MAP = {
  classic: NavbarClassic,
  dark: NavbarDark,
  floating: NavbarFloating,
  minimal: NavbarMinimal,
  gradient: NavbarGradient,
  glass: NavbarGlass,
};

export type NavbarStyleKey = keyof typeof NAVBAR_STYLES_MAP;
