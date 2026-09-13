// ============================================================
// USE NAVIGATION — Hook de navigation avec animations
// Version V3 — Compatible React 16
// ============================================================

import React, { useContext } from 'react';
import { NavigationController } from '../types/navigation';

// Création d'un contexte factice pour éviter l'erreur
// TODO: Remplacer par le vrai contexte quand il sera créé
const NavigationContext = React.createContext<NavigationController | null>(null);

export const useNavigation = (): NavigationController => {
  const context = useContext(NavigationContext);
  if (!context) {
    // Retourner un contrôleur factice pour éviter les erreurs
    return {
      state: {
        currentPage: '/',
        previousPage: null,
        isNavigating: false,
        isAnimating: false,
        isNavigate: false,
        isAnimate: false,
        navigationType: 'push',
        history: ['/'],
        historyIndex: 0,
      },
      navigate: async () => {},
      goBack: async () => {},
      goForward: async () => {},
      reload: async () => {},
      clearHistory: () => {},
      getBackPath: () => null,
      isActive: () => false,
      currentRoute: null,
    };
  }
  return context;
};

export default useNavigation;
