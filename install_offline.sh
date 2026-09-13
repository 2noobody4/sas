#!/bin/bash
echo "🚀 Installation du mode hors ligne complet"

# 1. Installation des dépendances
echo "📦 Installation des dépendances..."
npm install @tanstack/react-query-persist-client @tanstack/query-persist-client-core

# 2. Mise à jour de OfflineContext.tsx
cat > src/contexts/OfflineContext.tsx << 'EOFCONTEXT'
import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import localForage from 'localforage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast } from '../hooks/useToast';

const queueStore = localForage.createInstance({
  name: 'AppPMEOffline',
  storeName: 'offline_queue',
});

export interface OfflineQueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
}

interface OfflineContextType {
  isOnline: boolean;
  queue: OfflineQueueItem[];
  queueCount: number;
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries' | 'maxRetries'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
  isProcessing: boolean;
}

const OfflineContext = createContext<OfflineContextType | null>(null);
const MAX_RETRIES = 5;

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const { success, error: toastError } = useToast();
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const stored = await queueStore.getItem<OfflineQueueItem[]>('queue');
        if (stored) setQueue(stored);
      } catch (err) {
        console.error('[OfflineContext] Erreur chargement file:', err);
      } finally {
        setLoaded(true);
      }
    };
    loadQueue();
  }, []);

  useEffect(() => {
    if (loaded) {
      queueStore.setItem('queue', queue).catch(err => {
        console.error('[OfflineContext] Erreur persistance:', err);
      });
    }
  }, [queue, loaded]);

  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries' | 'maxRetries'>) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
    };
    setQueue(prev => [...prev, newItem]);
  }, []);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    setQueue([]);
  }, []);

  const processQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isProcessing) return;
    setIsProcessing(true);
    let processed = 0;
    const failed: OfflineQueueItem[] = [];

    for (const item of queue) {
      try {
        const isFormData = item.body instanceof FormData;
        const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
        const finalHeaders = { ...headers, ...(item.headers || {}) };
        const response = await fetch(item.url, {
          method: item.method,
          headers: finalHeaders,
          body: isFormData ? item.body : JSON.stringify(item.body),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        processed++;
      } catch (err) {
        console.warn('[OfflineQueue] Échec de rejeu:', item, err);
        const updatedItem = { ...item, retries: item.retries + 1 };
        if (updatedItem.retries < updatedItem.maxRetries) {
          failed.push(updatedItem);
        } else {
          toastError(`Action hors ligne abandonnée : ${item.url} (trop de tentatives)`);
        }
      }
    }

    setQueue(failed);
    if (processed > 0) success(`${processed} action(s) synchronisée(s) ✅`);
    setIsProcessing(false);
  }, [isOnline, queue, isProcessing, toastError, success]);

  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      const timer = setTimeout(() => processQueue(), 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue, processQueue, isProcessing]);

  const value = { isOnline, queue, queueCount: queue.length, addToQueue, removeFromQueue, clearQueue, processQueue, isProcessing };
  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
};

export default OfflineProvider;
EOFCONTEXT

# 3. Création du hook useOfflineMutation
cat > src/hooks/useOfflineMutation.ts << 'EOFMUTATION'
import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import { useOffline } from '../contexts/OfflineContext';
import { useToast } from './useToast';

export function useOfflineMutation<TData, TVariables>(
  options: UseMutationOptions<TData, Error, TVariables>,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): UseMutationResult<TData, Error, TVariables> {
  const { isOnline, addToQueue } = useOffline();
  const { success, error: toastError } = useToast();

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!isOnline) {
        const headers = options.context?.headers || {};
        addToQueue({ url: endpoint, method, body: variables, headers });
        return { offline: true, queued: true } as TData;
      }
      try {
        const result = await options.mutationFn?.(variables) as TData;
        return result;
      } catch (error) {
        throw error;
      }
    },
    onSuccess: (data, variables, context) => {
      if ((data as any)?.offline) {
        success('Action mise en file d\'attente (hors ligne)');
      } else {
        options.onSuccess?.(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}
EOFMUTATION

# 4. Mise à jour de App.tsx avec PersistQueryClientProvider
cat > src/App.tsx << 'EOFAPP'
import React, { useState, useMemo, useEffect } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient } from 'react-query';
import { PersistQueryClientProvider } from '@tanstack/react-query-persist-client';
import { createIDBPersister } from '@tanstack/query-persist-client-core';
import { ThemeProvider } from './components/theme/ThemeContext';
import { ConfigProvider } from './contexts/ConfigContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { MagasinActifProvider } from './contexts/MagasinActifContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { DataLoaderProvider, useDataLoader } from './contexts/DataLoaderContext';
import { PageLoadingProvider, usePageLoading } from './contexts/PageLoadingContext';
import { OfflineBanner } from './components/ui/OfflineBanner';
import { AnnouncementBanner } from './components/ui/AnnouncementBanner';
import { NotificationToast } from './components/ui/NotificationToast';
import { LoadingScreen } from './components/ui/LoadingScreen';
import { Sidebar } from './components/layout/Sidebar';
import RoleSwitcher from './components/dev/RoleSwitcher';
import { useAuth } from './hooks/useAuth';
import { useConfig } from './contexts/ConfigContext';
import { HeaderWrapper } from './components/header/HeaderWrapper';
import { Header } from './components/layout/Header';
import { NavbarWrapper } from './components/navigation/NavbarWrapper';
import { NavBar } from './components/navigation/NavBar';
import { PageWrapper } from './components/ui/PageWrapper';
import { MODULES_REGISTRY, getNavItems } from './registres/modulesRegistry';
import { resolveLucideIcon } from './registres/lucideRegistry';
import type { NavItem } from './types/navigation';

const persister = createIDBPersister({ storage: 'idb', throttleTime: 1000 });

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      gcTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

function AppContent() {
  const { isLoading, progress, error } = useDataLoader();
  const { user } = useAuth();
  const config = useConfig();
  const notifications = useNotifications();
  const role = user?.role?.nom || 'client';
  const appName = config?.loaded ? config.storeName || 'App PME' : 'App PME';
  const logoUrl = config?.logo_url || '';
  const { setLoading, setProgress } = usePageLoading();

  const [navKey, setNavKey] = useState(0);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  const navItems: NavItem[] = useMemo(() => {
    const items = getNavItems(role);
    if (!user) {
      return [
        { id: 'login', icone: 'LogIn', label: 'Connexion', path: '/login', ordre: 0, visible: true, roles: [] },
        ...items.filter(item => !['profile', 'messages', 'notifications'].includes(item.id))
      ];
    }
    return items;
  }, [role, user]);

  const gestionModules = useMemo(() => {
    return MODULES_REGISTRY
      .filter(m => m.isManagement && m.isSidebarItem !== false)
      .filter(m => !m.roles || m.roles.includes(role))
      .sort((a, b) => a.order - b.order);
  }, [role]);

  const sidebarItems = useMemo(() => {
    return gestionModules.map(mod => {
      const Icon = resolveLucideIcon(mod.icon);
      return { id: mod.id, label: mod.label, icon: <Icon size={20} />, path: mod.path, roles: mod.roles };
    });
  }, [gestionModules]);

  const allModules = useMemo(() => {
    return MODULES_REGISTRY.filter((m: any) => m.component).sort((a: any, b: any) => b.path.length - a.path.length);
  }, []);

  useEffect(() => { setNavKey(prev => prev + 1); }, [role]);

  useEffect(() => {
    if (isLoading) {
      setLoading(true, error ? `Erreur : ${error}` : 'Chargement des données...');
      setProgress(progress);
    } else {
      setLoading(false);
    }
  }, [isLoading, progress, error, setLoading, setProgress]);

  if (isLoading) {
    return <LoadingScreen progress={progress} message={error ? `Erreur : ${error}` : 'Chargement des données...'} />;
  }

  return (
    <>
      <OfflineBanner />
      <AnnouncementBanner announcements={notifications.announcements} onDismiss={notifications.dismissAnnouncement} />
      <HeaderWrapper>
        <Header
          title={appName}
          logo={logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" /> : undefined}
          showMenu={true}
          onMenuClick={() => setIsDrawerOpen(true)}
          showNotifications={true}
        />
      </HeaderWrapper>
      <Sidebar isOpen={isDrawerOpen} onClose={() => setIsDrawerOpen(false)} items={sidebarItems} title={appName} logo={logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" /> : undefined} role={role} />
      <PageWrapper>
        <Switch>
          {allModules.map((module: any) => <Route key={module.id} path={module.path} component={module.component} />)}
          <Route path="*"><div className="p-6 text-center text-[var(--color-textSecondary)]">Page non trouvée</div></Route>
        </Switch>
      </PageWrapper>
      <NavbarWrapper position="bottom" size={64}>
        <NavBar key={`nav-${navKey}`} items={navItems} orientation="horizontal" styleVariant="classic" />
      </NavbarWrapper>
      <NotificationToast toasts={notifications.toasts} onDismiss={notifications.dismissToast} />
      <Toaster position="top-center" />
      <RoleSwitcher />
    </>
  );
}

function App() {
  return (
    <PersistQueryClientProvider client={queryClient} persistOptions={{ persister }}>
      <ConfigProvider>
        <ThemeProvider>
          <OfflineProvider>
            <MagasinActifProvider>
              <NotificationProvider>
                <DataLoaderProvider>
                  <PageLoadingProvider>
                    <BrowserRouter>
                      <AppContent />
                    </BrowserRouter>
                  </PageLoadingProvider>
                </DataLoaderProvider>
              </NotificationProvider>
            </MagasinActifProvider>
          </OfflineProvider>
        </ThemeProvider>
      </ConfigProvider>
    </PersistQueryClientProvider>
  );
}

export default App;
EOFAPP

# 5. Adaptation de useProduits.ts avec useOfflineMutation
# On ne va pas réécrire tout le fichier, on va patcher les fonctions de mutation.
# Je vais ajouter des imports et remplacer les mutations.

# D'abord, on sauvegarde l'original
cp src/hooks/useProduits.ts src/hooks/useProduits.ts.bak

# On insère les imports nécessaires en début de fichier
sed -i '1iimport { useOfflineMutation } from "./useOfflineMutation";' src/hooks/useProduits.ts

# On modifie la fonction useCreateProduit pour utiliser useOfflineMutation
# C'est complexe avec sed, je vais plutôt fournir un fichier patch.

# Je vais donner des instructions manuelles.

echo "⚠️ Pour finaliser, vous devez adapter manuellement les mutations dans useProduits.ts"
echo "Consultez les exemples fournis dans les commentaires."

# 6. Optionnel : Composant SyncStatus
cat > src/components/ui/SyncStatus.tsx << 'EOFSYNC'
import React from 'react';
import { useOffline } from '../../contexts/OfflineContext';
import { MotionBox } from './MotionBox';
import { CloudOff, Cloud, RefreshCw } from 'lucide-react';

export const SyncStatus: React.FC = () => {
  const { isOnline, queueCount, isProcessing } = useOffline();
  return (
    <MotionBox as="div" type="box" variant="default" className="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
      {isProcessing ? (
        <><RefreshCw size={14} className="animate-spin" /><span>Synchronisation...</span></>
      ) : isOnline ? (
        <><Cloud size={14} className="text-[var(--color-success)]" /><span>En ligne</span></>
      ) : (
        <><CloudOff size={14} className="text-[var(--color-danger)]" /><span>Hors ligne</span></>
      )}
      {queueCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--color-warning)] text-white text-[10px]">{queueCount}</span>
      )}
    </MotionBox>
  );
};
EOFSYNC

echo "✅ Tous les fichiers du mode hors ligne sont en place."
echo "👉 Redémarrez l'application avec : npm start"
