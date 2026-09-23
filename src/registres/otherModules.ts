// ============================================================
// OTHER MODULES — Modules secondaires
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { ModuleDefinition } from './modulesTypes';
import { LoginPage } from '../pages/LoginPage';
import { RegisterPage } from '../pages/RegisterPage';
import { MaintenancePage } from '../pages/MaintenancePage';
import { NotificationsPage } from '../pages/NotificationsPage';
import { MessagesPage } from '../pages/MessagesPage';
import { OfflineQueuePage } from '../pages/OfflineQueuePage';
import { ForgotPasswordPage } from '../pages/ForgotPasswordPage';
import { ResetPasswordPage } from '../pages/ResetPasswordPage';

const DebugPage = React.lazy(() => import('../pages/DebugPage'));

export const OTHER_MODULES: ModuleDefinition[] = [
  {
    id: 'login',
    path: '/login',
    label: 'Connexion',
    icon: 'LogIn',
    description: 'Se connecter',
    roles: ['client', 'admin', 'gestionnaire'],
    order: 1000,
    component: LoginPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'register',
    path: '/register',
    label: 'Inscription',
    icon: 'UserPlus',
    description: 'Créer un compte',
    roles: ['client'],
    order: 1001,
    component: RegisterPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'forgot-password',
    path: '/forgot-password',
    label: 'Mot de passe oublié',
    icon: 'KeyRound',
    description: 'Réinitialiser le mot de passe',
    roles: ['client', 'admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe'],
    order: 1002,
    component: ForgotPasswordPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'reset-password',
    path: '/reset-password',
    label: 'Réinitialisation',
    icon: 'ShieldCheck',
    description: 'Nouveau mot de passe',
    roles: ['client', 'admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe'],
    order: 1003,
    component: ResetPasswordPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'maintenance',
    path: '/maintenance',
    label: 'Maintenance',
    icon: 'Settings',
    description: 'Page de maintenance',
    roles: ['admin', 'gestionnaire'],
    order: 1010,
    component: MaintenancePage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'notifications',
    path: '/notifications',
    label: 'Notifications',
    icon: 'Bell',
    description: 'Centre de notifications',
    roles: ['admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe', 'client'],
    order: 1011,
    component: NotificationsPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'messages',
    path: '/messages',
    label: 'Messages',
    icon: 'MessageSquare',
    description: 'Messagerie',
    roles: ['admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe', 'client'],
    order: 1012,
    component: MessagesPage,
    isManagement: false,
    isBottomNav: false,
  },
  {
    id: 'offline-queue',
    path: '/gestion/offline-queue',
    label: 'File hors ligne',
    icon: 'Clock',
    description: 'Gestion de la file d\'attente hors ligne',
    roles: ['admin', 'gestionnaire'],
    order: 1020,
    component: OfflineQueuePage,
    isManagement: true,
    isSidebarItem: true,
    isBottomNav: false,
  },
  {
    id: 'debug',
    path: '/debug',
    label: 'Debug',
    icon: 'Bug',
    description: 'Console de débogage',
    roles: ['client', 'admin', 'gestionnaire', 'comptable', 'cashier', 'magasinier', 'employe'],
    order: 9999,
    component: DebugPage,
    isManagement: false,
    isBottomNav: false,
    isSidebarItem: false,
  },
];
