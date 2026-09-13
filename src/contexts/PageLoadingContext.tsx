import React, { createContext, useContext, useState, ReactNode, useCallback } from 'react';

interface PageLoadingContextType {
  isLoading: boolean;
  progress: number;
  message: string;
  setLoading: (loading: boolean, message?: string) => void;
  setProgress: (value: number) => void;
  reset: () => void;
}

const PageLoadingContext = createContext<PageLoadingContextType | null>(null);

export const PageLoadingProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [message, setMessage] = useState('Chargement...');

  const setLoading = useCallback((loading: boolean, msg?: string) => {
    setIsLoading(loading);
    if (msg) setMessage(msg);
    if (loading) setProgress(0);
    else setProgress(100);
  }, []);

  const reset = useCallback(() => {
    setIsLoading(false);
    setProgress(100);
    setMessage('Chargement...');
  }, []);

  return (
    <PageLoadingContext.Provider value={{ isLoading, progress, message, setLoading, setProgress, reset }}>
      {children}
    </PageLoadingContext.Provider>
  );
};

export const usePageLoading = (): PageLoadingContextType => {
  const context = useContext(PageLoadingContext);
  if (!context) throw new Error('usePageLoading must be used within PageLoadingProvider');
  return context;
};

export default PageLoadingProvider;
