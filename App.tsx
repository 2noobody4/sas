// ============================================================
// APP PME — Header + Navbar globales, Routes dynamiques
// Version V3 — Compatible React 16.14
// ============================================================

import React, { useState, useMemo } from 'react';
import { BrowserRouter, Switch, Route } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
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
import { PageLoader } from './components/ui/PageLoader';
import { useAuth } from './hooks/useAuth';
import { useConfig } from './contexts/ConfigContext';
import { HeaderWrapper } from './components/header/HeaderWrapper';
import { Header } from './components/layout/Header';
import { NavbarWrapper } from './components/navigation/NavbarWrapper';
import { NavBar } from './components/navigation/NavBar';
import { PageWrapper } from './components/ui/PageWrapper';
import { MODULES_REGISTRY, getNavItems } from './registres/modulesRegistry';
import type { NavItem } from './types/navigation';

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

// ============================================================
// APP CONTENT
// ============================================================

function AppContentWrapper() {
  const { isLoading, progress, error } = useDataLoader();
  const { user } = useAuth();
  const config = useConfig();
  const notifications = useNotifications();
  const role = user?.role?.nom || 'client';
  const appName = config?.loaded ? config.storeName || 'App PME' : 'App PME';
  const logoUrl = config?.logo_url || '';
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);

  // Mémoriser les modules pour éviter les re-calculs
  const navItems: NavItem[] = useMemo(() => getNavItems(role), [role]);

  const allModules = useMemo(() => {
    return MODULES_REGISTRY
      .filter((m: any) => m.component)
      .sort((a: any, b: any) => b.path.length - a.path.length);
  }, []);

  // Utiliser PageLoading pour indiquer le chargement des données
  const { setLoading, setProgress } = usePageLoading();

  // Synchroniser le chargement de DataLoader avec PageLoading
  React.useEffect(() => {
    if (isLoading) {
      setLoading(true, error ? `Erreur : ${error}` : 'Chargement des données...');
      setProgress(progress);
    } else {
      setLoading(false);
    }
  }, [isLoading, progress, error, setLoading, setProgress]);

  // Si le chargement est en cours, on affiche le loader (déjà géré par PageLoader)
  // Mais on ne rend pas le contenu tant que le chargement n'est pas terminé
  if (isLoading) {
    return null; // Le PageLoader s'affiche via le provider
  }

  return (
    <>
      <OfflineBanner />
      <AnnouncementBanner
        announcements={notifications.announcements}
        onDismiss={notifications.dismissAnnouncement}
      />

      <HeaderWrapper>
        <Header
          title={appName}
          logo={logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" /> : undefined}
          showMenu={true}
          onMenuClick={() => setIsSidebarOpen(true)}
          showAuth={true}
          showNotifications={true}
          showMessages={true}
          showSearch={true}
          userName={`${user?.prenom || ''} ${user?.nom || ''}`}
        />
      </HeaderWrapper>

      <PageWrapper>
        <Switch>
          {allModules.map((module: any) => (
            <Route
              key={module.id}
              path={module.path}
              component={module.component}
            />
          ))}
          <Route path="*">
            <div className="p-6 text-center text-[var(--color-textSecondary)]">
              Page non trouvée
            </div>
          </Route>
        </Switch>
      </PageWrapper>

      <NavbarWrapper position="bottom" size={64}>
        <NavBar items={navItems} orientation="horizontal" styleVariant="classic" />
      </NavbarWrapper>

      <NotificationToast
        toasts={notifications.toasts}
        onDismiss={notifications.dismissToast}
      />
      <Toaster position="top-center" />
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
                      <PageLoader />
                      <AppContentWrapper />
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
