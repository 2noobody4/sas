// ============================================================
// THEME TYPES — Source de vérité unique
// Version V3.1 — Ajout animationLoop
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
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export type AnimationRef = string | { nom: string; params?: AnimationParams };

export interface Animation {
  id?: string;
  animationInitiale?: AnimationRef;
  animationSortie?: AnimationRef;
  /** Animation en boucle (répétée en continu tant que le composant est monté) */
  animationLoop?: AnimationRef;
  declenchees?: Array<{
    trigger: 'hover' | 'tap' | 'focus' | 'inView' | 'drag' | 'scroll' | 'mount' | 'routeChange';
    animation: AnimationRef;
  }>;
  params?: AnimationParams;
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

// ============================================================
// FONTS DISPONIBLES
// ============================================================

export interface AvailableFont {
  value: string;
  label: string;
  category?: string;
}

export const AVAILABLE_FONTS: AvailableFont[] = [
  { value: "'Inter', sans-serif", label: 'Inter', category: 'Moderne' },
  { value: "'Manrope', sans-serif", label: 'Manrope', category: 'Moderne' },
  { value: "'Sora', sans-serif", label: 'Sora', category: 'Moderne' },
  { value: "'Poppins', sans-serif", label: 'Poppins', category: 'Moderne' },
  { value: "'Montserrat', sans-serif", label: 'Montserrat', category: 'Moderne' },
  { value: "'Work Sans', sans-serif", label: 'Work Sans', category: 'Moderne' },
  { value: "'Raleway', sans-serif", label: 'Raleway', category: 'Moderne' },
  { value: "'Roboto', sans-serif", label: 'Roboto', category: 'Neutre' },
  { value: "'Open Sans', sans-serif", label: 'Open Sans', category: 'Neutre' },
  { value: "'Lato', sans-serif", label: 'Lato', category: 'Neutre' },
  { value: "'Nunito', sans-serif", label: 'Nunito', category: 'Neutre' },
  { value: "'Quicksand', sans-serif", label: 'Quicksand', category: 'Arrondie' },
  { value: "'Oswald', sans-serif", label: 'Oswald', category: 'Condensée' },
  { value: "'Merriweather', serif", label: 'Merriweather', category: 'Serif' },
  { value: "'Playfair Display', serif", label: 'Playfair Display', category: 'Serif' },
];
