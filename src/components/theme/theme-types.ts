// ============================================================
// THEME TYPES — Définitions de types pour le système de thème
// Version V3 — Compatible React 16
// ============================================================

export interface Style {
  id?: string;
  proprietes: Record<string, string | number>;
}

export interface AnimationParams {
  duration?: number;
  delay?: number;
  ease?: string | number[];
  stiffness?: number;
  damping?: number;
  mass?: number;
}

export interface Animation {
  id?: string;
  animationInitiale?: string;
  animationSortie?: string;
  declenchees?: Array<{
    trigger: 'hover' | 'tap' | 'focus' | 'inView' | 'drag' | 'scroll' | 'mount' | 'routeChange';
    animation: string;
    params?: AnimationParams;  // paramètres spécifiques à cette interaction
  }>;
  params?: AnimationParams;    // paramètres globaux pour l'entrée/sortie
}

export interface ComponentStyle {
  id?: string;
  typeComponent: string;
  style: Style;
  animation?: Animation;
}

export interface Theme {
  id: string;
  nom: string;
  actif?: boolean;
  typographie: {
    policeTitre: string;
    policeTexte: string;
    policeChiffres: string;
    echelleTaille: Record<string, number>;
  };
  couleurs?: Record<string, string>;
  composants: ComponentStyle[];
  created_at?: string;
  updated_at?: string;
}

export interface ThemeContextType {
  theme: Theme;
  loading: boolean;
  error: string | null;
  updateTheme: (theme: Theme) => Promise<void>;
  updateComponentStyle: (typeComponent: string, style: Style) => Promise<void>;
  updateComponentAnimation: (typeComponent: string, animation: Animation) => Promise<void>;
  refreshTheme: () => Promise<void>;
}

export interface UseComponentStyleReturn {
  proprietes: Record<string, string | number>;
  animation?: Animation;
}
