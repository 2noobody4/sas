// ============================================================
// APP PME — Header + Navbar globales, Routes dynamiques
// Version V3.8 — Compatible React 16.14
// ------------------------------------------------------------
// - Router custom avec appHistory (animations de sortie)
// - NavigationProvider (intercepteur)
// - Sidebar avec hiérarchie
// - Maintenance bypass admin
// ============================================================

import React, { useState, useMemo, useEffect, Suspense } from 'react';
import { Router, Switch, Route, Link, useLocation } from 'react-router-dom';
import { Toaster } from 'react-hot-toast';
import { QueryClient, QueryClientProvider } from 'react-query';
import { loadCache, saveCache } from './lib/persistQueryClient';
import { appHistory } from './lib/appHistory';
import { ThemeProvider, useTheme } from './contexts/ThemeContext';
import { ConfigProvider, useConfig } from './contexts/ConfigContext';
import { OfflineProvider } from './contexts/OfflineContext';
import { MagasinActifProvider } from './contexts/MagasinActifContext';
import { NotificationProvider, useNotifications } from './contexts/NotificationContext';
import { DataLoaderProvider, useDataLoader } from './contexts/DataLoaderContext';
import { PageLoadingProvider, usePageLoading } from './contexts/PageLoadingContext';
import { LoadingProvider } from './contexts/LoadingContext';
import { NavigationProvider } from './contexts/NavigationContext';
import { OfflineBanner } from './components/OfflineBanner';
import { AnnouncementBanner } from './components/AnnouncementBanner';
import { NotificationToast } from './components/NotificationToast';
import { NavigationLoader } from './components/NavigationLoader';
import { GlobalLoadingIndicator } from './components/GlobalLoadingIndicator';
import { LoadingScreen } from './components/LoadingScreen';
import { Sidebar } from './components/Sidebar';
import RoleSwitcher from './components/RoleSwitcher';
import { DebugButton } from './components/DebugButton';
import { FloatingNav } from './components/FloatingNav';
import DebugPage from './pages/DebugPage';
import { useAuth } from './hooks/useAuth';
import { useUserModules } from './hooks/useUserModules';
import { useSessionGuard } from './hooks/useSessionGuard';
import { useBootstrap } from './hooks/useBootstrap';
import { HeaderWrapper } from './components/HeaderWrapper';
import { Header } from './components/Header';
import { NavbarWrapper } from './components/NavbarWrapper';
import { NavBar } from './components/NavBar';
import { PageWrapper } from './components/PageWrapper';
import { resolveLucideIcon } from './registres/lucideRegistry';
import type { NavItem } from './types/navigation';
import { MODULES_REGISTRY } from './registres/modulesRegistry';
import { ALL_ROUTES, useNavigation } from './utils/navigationIndex';
import { RouteGuard } from './components/RouteGuard';

const CACHE_SAVE_INTERVAL_MS = 30000;

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

const PUBLIC_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/maintenance',
];

function AppContent() {
  const location = useLocation();
  const { isLoading: dataLoading, progress, error } = useDataLoader();
  const { loading: themeLoading } = useTheme();
  const isLoading = dataLoading || themeLoading;
  const { user } = useAuth();
  const config = useConfig();
  const notifications = useNotifications();
  const role = user?.role?.nom || 'client';
  const appName = config?.loaded ? config.storeName || 'App PME' : 'App PME';
  const logoUrl = config?.logo_url || '';
  const { setLoading, setProgress } = usePageLoading();

  useSessionGuard();
  useBootstrap();

  const [isDrawerOpen, setIsDrawerOpen] = useState(false);

  // ---- Persistance du cache ----
  useEffect(() => {
    loadCache(queryClient);

    const intervalId = window.setInterval(
      () => saveCache(queryClient),
      CACHE_SAVE_INTERVAL_MS,
    );

    const handleBeforeUnload = () => saveCache(queryClient);
    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.clearInterval(intervalId);
      window.removeEventListener('beforeunload', handleBeforeUnload);
      saveCache(queryClient);
    };
  }, []);

  // ---- Sync locale i18n ----
  useEffect(() => {
    if (config.loaded && config.locale) {
      import('i18next').then((mod) => {
        if (mod.default.language !== config.locale) {
          mod.default.changeLanguage(config.locale);
        }
      });
    }
  }, [config.loaded, config.locale]);

  // ---- Navigation ----
  const { data: assignedModuleIds = [] } = useUserModules(user?.id);
  const { navItems: menuNavItems, sidebarTree: menuSidebarTree } =
    useNavigation({ role, assignedModuleIds });

  const navItems: NavItem[] = menuNavItems;

  // ---- Construction des items de la Sidebar (avec hiérarchie) ----
  const sidebarItems = useMemo(
    () =>
      menuSidebarTree.map((item) => {
        const Icon = resolveLucideIcon(item.icone);
        const mod = MODULES_REGISTRY.find((m) => m.path === item.path);
        return {
          id: item.id,
          label: item.label,
          icon: <Icon size={20} />,
          path: item.path,
          roles: item.roles || ['admin', 'gestionnaire'],
          description: mod?.description,
          hasChildren: item.hasChildren,
          children: item.children?.map((child) => {
            const ChildIcon = resolveLucideIcon(child.icone);
            const childMod = MODULES_REGISTRY.find((m) => m.path === child.path);
            return {
              id: child.id,
              label: child.label,
              icon: <ChildIcon size={16} />,
              path: child.path,
              roles: child.roles,
              description: childMod?.description,
              parentId: item.id,
            };
          }),
        };
      }),
    [menuSidebarTree],
  );

  // ---- Sync chargement (donnees + theme) ----
  useEffect(() => {
    if (isLoading) {
      const msg = error
        ? `Erreur : ${error}`
        : dataLoading
        ? 'Chargement des donnees...'
        : 'Application du theme...';
      setLoading(true, msg);
      setProgress(dataLoading ? progress : 100);
    } else {
      setLoading(false);
    }
  }, [isLoading, dataLoading, progress, error, setLoading, setProgress]);

  // ---- Détection route publique ----
  const isPublicRoute = PUBLIC_ROUTES.some((r) => location.pathname.startsWith(r));
  const isAdmin = role === 'admin' || role === 'gestionnaire';
  const showMaintenance = config.loaded && config.maintenance_mode && !isAdmin && !isPublicRoute;

  // ---- MAINTENANCE ----
  if (showMaintenance) {
    return (
      <>
        <div className="min-h-screen flex items-center justify-center bg-[var(--color-background)] p-4">
          <div className="max-w-md w-full text-center space-y-6">
            <div className="text-6xl mb-4">🔧</div>
            <h1 className="text-3xl font-bold text-[var(--color-textPrimary)]">
              Maintenance en cours
            </h1>
            <p className="text-lg text-[var(--color-textSecondary)]">
              {appName} est en maintenance. Revenez dans quelques minutes.
            </p>
            <Link
              to="/login"
              className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition"
            >
              🔐 Se connecter
            </Link>
            <p className="text-xs text-[var(--color-textSecondary)] opacity-70">
              Si vous etes administrateur, connectez-vous pour acceder a l'application.
            </p>
          </div>
        </div>
        <RoleSwitcher />
        <DebugButton />
        <FloatingNav />
      </>
    );
  }

  if (isLoading) {
    return (
      <LoadingScreen
        progress={dataLoading ? progress : 100}
        message={
          error
            ? `Erreur : ${error}`
            : dataLoading
            ? 'Chargement des donnees...'
            : 'Application du theme...'
        }
      />
    );
  }

  return (
    <>
      <OfflineBanner />
      <NavigationLoader />
      <GlobalLoadingIndicator />
      <AnnouncementBanner
        announcements={notifications.announcements}
        onDismiss={notifications.dismissAnnouncement}
      />

      <HeaderWrapper>
        <Header
          title={appName}
          logo={logoUrl ? <img src={logoUrl} alt="Logo" className="h-8 w-auto" /> : undefined}
          showMenu
          onMenuClick={() => setIsDrawerOpen(true)}
          showNotifications
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
        <Suspense
          fallback={
            <div className="p-6 text-center text-[var(--color-textSecondary)]">
              Chargement de la page...
            </div>
          }
        >
          <Switch>
            {ALL_ROUTES.map((route) => (
              <Route
                key={route.path}
                path={route.path}
                exact={route.path === '/'}
                render={(props) => (
                  <RouteGuard
                    roles={route.roles}
                    currentRole={role}
                    component={route.component}
                    routeProps={props}
                  />
                )}
              />
            ))}

            <Route path="/debug" exact component={DebugPage} />

            <Route path="*">
              <div className="p-6 text-center text-[var(--color-textSecondary)]">
                Page non trouvee
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
      <DebugButton />
      <FloatingNav />
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
                    <LoadingProvider>
                      <Router history={appHistory}>
                        <NavigationProvider>
                          <AppContent />
                        </NavigationProvider>
                      </Router>
                    </LoadingProvider>
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
