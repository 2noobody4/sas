// ============================================================
// NAVIGATION CONTEXT — Wrapper léger autour d'appHistory
// Version V3.4 — Compatible React 16
// ------------------------------------------------------------
// Le vrai travail est fait par appHistory + animationController.
// Ce contexte expose juste des helpers aux composants.
// ============================================================

import React, { createContext, useCallback, useContext, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { appHistory } from '../lib/appHistory';

interface NavigationContextType {
  navigate: (path: string) => void;
  navigateInstant: (path: string) => void;
  isActive: (path: string) => boolean;
}

const NavigationContext = createContext<NavigationContextType | null>(null);

export const NavigationProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const history = useHistory();

  const navigate = useCallback((path: string) => {
    appHistory.push(path);
  }, []);

  const navigateInstant = useCallback((path: string) => {
    appHistory.replace(path);
  }, []);

  const isActive = useCallback(
    (path: string) => {
      if (path === '/') return history.location.pathname === '/';
      return (
        history.location.pathname === path ||
        history.location.pathname.startsWith(path + '/')
      );
    },
    [history.location.pathname]
  );

  const value = useMemo(
    () => ({ navigate, navigateInstant, isActive }),
    [navigate, navigateInstant, isActive]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationContext = (): NavigationContextType => {
  const ctx = useContext(NavigationContext);
  if (!ctx) {
    throw new Error('useNavigationContext must be used within NavigationProvider');
  }
  return ctx;
};

export const useNavigationContextSafe = (): NavigationContextType | null => {
  return useContext(NavigationContext);
};

export default NavigationProvider;
