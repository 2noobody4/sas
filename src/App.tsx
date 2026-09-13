// ============================================================
// APP PME — Header + Navbar globales, Routes dynamiques
// Version V3 — Compatible React 16.14
// ============================================================

import React, { useState, useMemo, useEffect, useRef, Suspense } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { loadCache, saveCache } from './lib/persistQueryClient';
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
import { resolveLucideIcon } from './registres/lucideRegistry';
import type { NavItem } from './types/navigation';
import { MODULES_REGISTRY } from './registres/modulesRegistry';
import { ALL_ROUTES, useNavigation } from './navigation';

// ============================================================
// QUERY CLIENT
// ============================================================

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 1000 * 60 * 5,
      cacheTime: 1000 * 60 * 60 * 24,
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

loadCache(queryClient);
setInterval(() => saveCache(queryClient), 30000);

// ============================================================
// APP CONTENT
// ============================================================

function AppContent() {
  const { isLoading, progress, error } = useDataLoader();
  const { user } = useAuth();
  const config = useConfig();
  const notifications = useNotifications();
  const role = user?.role?.nom || 'client';
  const appName = config?.loaded ? config.storeName || 'App PME' : 'App PME';
  const logoUrl = config?.logo_url || '';
  const { setLoading, setProgress } = usePageLoading();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const isLoadingRef = useRef(false);
  const prevLoadingState = useRef({ isLoading, progress, error });
  const isMounted = useRef(true);

  // Navigation : table `menu_items` en priorité, repli sur le registre
  const permissions = user?.role?.permissions || [];
  const { navItems: menuNavItems, sidebarItems: menuSidebarItems } = useNavigation(role, permissions);

  const navItems: NavItem[] = menuNavItems;

  // Items de la sidebar (menu de gestion)
  const sidebarItems = useMemo(() => {
    return menuSidebarItems.map(item => {
      const Icon = resolveLucideIcon(item.icone);
      const mod = MODULES_REGISTRY.find(m => m.path === item.path);
      return {
        id: item.id,
        label: item.label,
        icon: <Icon size={20} />,
        path: item.path,
        roles: item.roles || ['admin', 'gestionnaire'],
        description: mod?.description,
      };
    });
  }, [menuSidebarItems]);

  // Synchronisation du chargement
  useEffect(() => {
    if (isLoadingRef.current) return;
    
    const prev = prevLoadingState.current;
    if (prev.isLoading === isLoading && prev.progress === progress && prev.error === error) {
      return;
    }
    prevLoadingState.current = { isLoading, progress, error };

    isLoadingRef.current = true;
    
    if (isLoading) {
      setLoading(true, error ? `Erreur : ${error}` : 'Chargement des données...');
      setProgress(progress);
    } else {
      setLoading(false);
    }
    
    setTimeout(() => {
      if (isMounted.current) {
        isLoadingRef.current = false;
      }
    }, 100);
  }, [isLoading, progress, error, setLoading, setProgress]);

  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      saveCache(queryClient);
    };
  }, []);

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
      
      <Sidebar 
        isOpen={isDrawerOpen} 
        onClose={() => setIsDrawerOpen(false)} 
        items={sidebarItems} 
        title={appName} 
        logo={logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" /> : undefined} 
        role={role} 
      />
      
      <PageWrapper>
        <Suspense fallback={<div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement de la page...</div>}>
          <Switch>
            {/* ⚡ Routes générées automatiquement à partir du registre */}
            {ALL_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                exact={route.path === '/'}
                component={route.component}
              />
            ))}
            
            {/* 404 */}
            <Route path="*">
              <div className="p-6 text-center text-[var(--color-textSecondary)]">
                Page non trouvée
              </div>
            </Route>
          </Switch>
        </Suspense>
      </PageWrapper>
      
      <NavbarWrapper position="bottom" size={64}>
        <NavBar items={navItems} orientation="horizontal" styleVariant="classic" />
      </NavbarWrapper>
      
      <NotificationToast toasts={notifications.toasts} onDismiss={notifications.dismissToast} />
      <Toaster position="top-center" />
      <RoleSwitcher />
    </>
  );
}

// ============================================================
// APP PRINCIPALE
// ============================================================

function App() {
  return (
    <QueryClientProvider client={queryClient}>
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
    </QueryClientProvider>
  );
}

export default App;
