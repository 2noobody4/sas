// ============================================================
// USE NAVIGATION — Wrapper du NavigationContext
// Version V3 — Compatible React 16
// ============================================================

import { useNavigationContext } from '../contexts/NavigationContext';

/**
 * Hook exposé aux composants pour naviguer avec animations.
 * Remplace le stub factice précédent.
 */
export const useNavigateWithAnimation = () => {
  return useNavigationContext();
};

export default useNavigateWithAnimation;
