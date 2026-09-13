// ============================================================
// OTHER MODULES — Modules secondaires
// Version V3 — Compatible React 16
// ============================================================

import { ModuleDefinition } from './types';
import { LoginPage } from '../../pages/auth/LoginPage';
import { RegisterPage } from '../../pages/auth/RegisterPage';
import { MaintenancePage } from '../../pages/MaintenancePage';
import { NotificationsPage } from '../../pages/notifications/NotificationsPage';
import { MessagesPage } from '../../pages/messages/MessagesPage';
import { OfflineQueuePage } from '../../pages/admin/OfflineQueuePage';

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
    id: 'maintenance',
    path: '/maintenance',
    label: 'Maintenance',
    icon: 'Settings',
    description: 'Page de maintenance',
    roles: ['admin', 'gestionnaire'],
    order: 1002,
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
    order: 1003,
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
    order: 1004,
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
    order: 1005,
    component: OfflineQueuePage,
    isManagement: true,
    isSidebarItem: true,
    isBottomNav: false,
  },
];
