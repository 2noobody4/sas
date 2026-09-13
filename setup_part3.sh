#!/bin/bash
echo "🚀 Partie 3/4 : App.tsx (1ère moitié)"
cat > src/App.tsx << 'EOF5'
import React, { useState, useMemo, useEffect, memo } from 'react';
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

const AppContent = memo(function AppContent() {
  const { isLoading, progress, error } = useDataLoader();
  const { user, refreshUser } = useAuth();
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
        {
          id: 'login',
          icone: 'LogIn',
          label: 'Connexion',
          path: '/login',
          ordre: 0,
          visible: true,
          roles: [],
        },
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
      return {
        id: mod.id,
        label: mod.label,
        icon: <Icon size={20} />,
        path: mod.path,
        roles: mod.roles,
      };
    });
  }, [gestionModules]);

  const allModules = useMemo(() => {
    return MODULES_REGISTRY
      .filter((m: any) => m.component)
      .sort((a: any, b: any) => b.path.length - a.path.length);
  }, []);

  useEffect(() => {
    setNavKey(prev => prev + 1);
  }, [role]);

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

EOF5
echo "✅ Partie 3 terminée (App.tsx début)."
