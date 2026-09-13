// ============================================================
// NAVIGATION TYPES — Types complets pour le système de navigation
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { ComponentType } from 'react';
import { AnimationControls } from 'framer-motion';

// ============================================================
// TYPES EXISTANTS (compatibilité)
// ============================================================

export interface NavItem {
  id: string;
  icone: string;
  label: string;
  path: string;
  ordre: number;
  visible: boolean;
  roles?: string[];
  badgeCount?: number;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'default';
}

export interface SidebarItem {
  id: string;
  label: string;
  icon?: React.ReactNode;
  path: string;
  roles?: string[];
  children?: SidebarItem[];
}

export interface HeaderAction {
  id: string;
  icon: React.ReactNode;
  label?: string;
  onClick?: () => void;
  badge?: number;
  badgeColor?: 'red' | 'blue' | 'green' | 'yellow' | 'purple' | 'orange' | 'default';
}

export type NavbarStyle = 
  | 'classic'
  | 'dark'
  | 'floating'
  | 'minimal'
  | 'gradient'
  | 'glass';

export interface NavbarDefinition {
  id: NavbarStyle;
  nom: string;
  description: string;
  containerStyle: React.CSSProperties;
  containerClassName?: string;
  iconColor: string;
  iconActiveColor: string;
  labelColor: string;
  labelActiveColor: string;
  indicatorColor: string;
  showLabel: boolean;
}

// ============================================================
// ANIMATION TYPES
// ============================================================

export interface AnimationPreset {
  /** Nom de l'animation (référence vers animationPresets.ts) */
  name: string;
  /** Paramètres spécifiques */
  params?: Record<string, any>;
  /** Durée en ms */
  duration?: number;
  /** Délai avant démarrage */
  delay?: number;
  /** Easing personnalisé */
  easing?: string | number[];
}

export interface AnimationController {
  /** Identifiant unique du contrôleur */
  id: string;
  /** Élément DOM ciblé */
  element: HTMLElement | null;
  /** Animation d'entrée */
  entryAnimation: AnimationPreset | null;
  /** Animation de sortie */
  exitAnimation: AnimationPreset | null;
  /** Animations en boucle */
  loopAnimations: AnimationPreset[];
  /** État actuel de l'animation */
  state: 'idle' | 'entering' | 'looping' | 'exiting' | 'done';
  /** Contrôleur Framer Motion correspondant */
  motionController: AnimationControls | null;
  /** Promesse résolue quand l'animation est terminée */
  readyPromise?: Promise<void>;
  /** Résolveur de promesse */
  resolveReady?: () => void;
}

// ============================================================
// NAVIGATION TYPES
// ============================================================

export interface NavigationState {
  /** Page actuelle */
  currentPage: string;
  /** Page précédente (pour historique) */
  previousPage: string | null;
  /** Indique si une navigation est en cours */
  isNavigating: boolean;
  /** Indique si une animation est en cours */
  isAnimating: boolean;
  /** Indique si la navigation est en cours (pour les guards) */
  isNavigate: boolean;
  /** Indique si une animation est active (pour les guards) */
  isAnimate: boolean;
  /** Type de navigation en cours */
  navigationType: 'push' | 'replace' | 'back' | 'forward';
  /** Historique des pages visitées (exclut les formulaires) */
  history: string[];
  /** Index courant dans l'historique */
  historyIndex: number;
}

// ============================================================
// ROUTE TYPES
// ============================================================

export interface RouteConfig {
  /** Chemin de la route */
  path: string;
  /** Composant associé */
  component: ComponentType<any>;
  /** Nom affiché */
  label?: string;
  /** Icône */
  icon?: string;
  /** Rôles autorisés */
  roles?: string[];
  /** Ordre d'affichage */
  order?: number;
  /** Visible dans la navbar du bas */
  isNavBar?: boolean;
  /** Visible dans la sidebar (gauche) */
  isSideNav?: boolean;
  /** Visible dans la page de gestion (/gestion) */
  isManagement?: boolean;
  /** Racine de la gestion (affiche les cartes) */
  isManagementRoot?: boolean;
  /** Page de formulaire (exclue de l'historique) */
  isFormPage?: boolean;
  /** Page de chargement initial */
  isInitialLoadPage?: boolean;
  /** Animation d'entrée par défaut */
  defaultEntryAnimation?: string;
  /** Animation de sortie par défaut */
  defaultExitAnimation?: string;
  /** Métadonnées supplémentaires */
  metadata?: Record<string, any>;
}

// ============================================================
// NAVIGATION CONTROLLER
// ============================================================

export interface NavigateOptions {
  replace?: boolean;
  skipAnimation?: boolean;
  state?: Record<string, any>;
}

export interface NavigationController {
  /** État actuel */
  state: NavigationState;
  /** Naviguer vers une page */
  navigate: (path: string, options?: NavigateOptions) => Promise<void>;
  /** Revenir en arrière */
  goBack: () => Promise<void>;
  /** Aller en avant */
  goForward: () => Promise<void>;
  /** Recharger la page */
  reload: () => Promise<void>;
  /** Vider l'historique */
  clearHistory: () => void;
  /** Récupérer le chemin de retour */
  getBackPath: () => string | null;
  /** Vérifier si une route est active */
  isActive: (path: string) => boolean;
  /** Récupérer la route actuelle */
  currentRoute: RouteConfig | null;
}

// ============================================================
// PAGE STATE (pour le chargement)
// ============================================================

export interface PageState {
  /** Indique si la page est en cours de chargement */
  isLoading: boolean;
  /** Progression du chargement (0-100) */
  progress: number;
  /** Message de chargement */
  message: string;
  /** Erreur éventuelle */
  error: string | null;
  /** Données chargées */
  data: Record<string, any>;
  /** Indique si le chargement initial est terminé */
  isInitialLoad: boolean;
}

// ============================================================
// PAGE READY CONTEXT
// ============================================================

export interface PageReadyContextType {
  /** Indique si le chargement initial est terminé */
  isReady: boolean;
  /** Progression du chargement */
  progress: number;
  /** Message de chargement */
  message: string;
  /** Erreur éventuelle */
  error: string | null;
  /** Marquer une tâche comme terminée */
  markTaskDone: (taskId: string) => void;
  /** Ajouter une tâche en cours */
  addTask: (taskId: string, message: string) => void;
  /** Forcer l'état "prêt" */
  setReady: () => void;
  /** Réinitialiser le chargement */
  reset: () => void;
}

// ============================================================
// ANIMATION CONTEXT
// ============================================================

export interface AnimationContextType {
  /** Enregistrer un contrôleur d'animation */
  registerController: (id: string, element: HTMLElement | null) => AnimationController;
  /** Démarrer les animations d'entrée */
  startEntryAnimations: (pageId: string) => Promise<void>;
  /** Démarrer les animations de sortie */
  startExitAnimations: (pageId: string) => Promise<void>;
  /** Démarrer les animations en boucle */
  startLoopAnimations: (pageId: string) => Promise<void>;
  /** Arrêter les animations en boucle */
  stopLoopAnimations: (pageId: string) => Promise<void>;
  /** Contrôleur Framer Motion pour un composant */
  getMotionControls: (id: string) => AnimationControls | null;
  /** État des animations */
  animationState: Record<string, AnimationController>;
}
