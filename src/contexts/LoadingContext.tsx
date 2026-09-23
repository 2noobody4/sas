/**
 * LoadingContext — état de chargement global partagé par toute l'application.
 *
 * - isLoading : true si au moins un chargement est en cours quelque part dans l'app
 * - message   : message optionnel associé au chargement en cours
 * - startLoading()/stopLoading() : compteur, plusieurs appels simultanés supportés
 * - setLoading(bool, msg?) : raccourci simple (remet le compteur à zéro)
 *
 * Utilisation dans une page ou un composant :
 *   const { startLoading, stopLoading } = useLoading();
 *   const save = async () => {
 *     startLoading('Enregistrement...');
 *     try {
 *       await api.save();
 *     } finally {
 *       stopLoading();
 *     }
 *   };
 *
 * Le <GlobalLoadingIndicator /> (monté une seule fois dans App.tsx) affiche
 * automatiquement un indicateur circulaire flottant tant que isLoading est true.
 * L'écran de chargement initial (thème, nav, sidebar) utilise lui son propre
 * composant <LoadingScreen /> configurable depuis les Paramètres.
 */

import React, { createContext, useContext, useState, useRef, useCallback, ReactNode } from 'react';

interface LoadingContextType {
  isLoading: boolean;
  message: string | null;
  startLoading: (message?: string) => void;
  stopLoading: () => void;
  setLoading: (loading: boolean, message?: string) => void;
}

const LoadingContext = createContext<LoadingContextType | null>(null);

export const LoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);
  const counterRef = useRef(0);

  const startLoading = useCallback((msg?: string) => {
    counterRef.current += 1;
    if (msg) setMessage(msg);
    setIsLoading(true);
  }, []);

  const stopLoading = useCallback(() => {
    counterRef.current = Math.max(0, counterRef.current - 1);
    if (counterRef.current === 0) {
      setIsLoading(false);
      setMessage(null);
    }
  }, []);

  const setLoading = useCallback(
    (loading: boolean, msg?: string) => {
      if (loading) {
        startLoading(msg);
      } else {
        counterRef.current = 0;
        setIsLoading(false);
        setMessage(null);
      }
    },
    [startLoading],
  );

  return (
    <LoadingContext.Provider value={{ isLoading, message, startLoading, stopLoading, setLoading }}>
      {children}
    </LoadingContext.Provider>
  );
};

export const useLoading = (): LoadingContextType => {
  const context = useContext(LoadingContext);
  if (!context) throw new Error('useLoading must be used within LoadingProvider');
  return context;
};

export default LoadingProvider;
