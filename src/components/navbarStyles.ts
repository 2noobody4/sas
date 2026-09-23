// ============================================================
// NAVBAR STYLES — Point d'entrée des styles
// Version V3 — Compatible React 16
// ------------------------------------------------------------
// Les composants Navbar* vivent désormais dans NavbarVariants.tsx.
// Ce fichier ré-exporte tout pour compatibilité.
// ============================================================

export {
  NavbarClassic,
  NavbarDark,
  NavbarFloating,
  NavbarMinimal,
  NavbarGradient,
  NavbarGlass,
  NAVBAR_STYLES_MAP,
} from './NavbarVariants';

export type { NavbarStyleKey } from './NavbarVariants';
