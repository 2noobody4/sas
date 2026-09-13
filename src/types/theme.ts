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
  repeat?: number;
  repeatType?: 'loop' | 'reverse' | 'mirror';
  spring?: {
    stiffness?: number;
    damping?: number;
    mass?: number;
  };
}

export interface Animation {
  id?: string;
  animationInitiale?: string | { nom: string; params?: AnimationParams };
  animationSortie?: string | { nom: string; params?: AnimationParams };
  declenchees?: Array<{
    trigger: 'hover' | 'tap' | 'focus' | 'inView' | 'drag' | 'scroll' | 'mount' | 'routeChange';
    animation: string | { nom: string; params?: AnimationParams };
    params?: AnimationParams;
  }>;
  params?: AnimationParams;
}

export interface ComponentStyle {
  id?: string;
  typeComponent: string;
  style: Style;
  animation?: Animation;
}

// ============================================================
// 20 POLICES DISPONIBLES
// ============================================================
export const AVAILABLE_FONTS = [
  // 1. Inter
  { value: "'Inter', sans-serif", label: 'Inter', category: 'Sans-serif' },
  // 2. Sora
  { value: "'Sora', sans-serif", label: 'Sora', category: 'Sans-serif' },
  // 3. Merriweather
  { value: "'Merriweather', serif", label: 'Merriweather', category: 'Serif' },
  // 4. Open Sans
  { value: "'Open Sans', sans-serif", label: 'Open Sans', category: 'Sans-serif' },
  // 5. Roboto
  { value: "'Roboto', sans-serif", label: 'Roboto', category: 'Sans-serif' },
  // 6. Playfair Display
  { value: "'Playfair Display', serif", label: 'Playfair Display', category: 'Serif' },
  // 7. Lato
  { value: "'Lato', sans-serif", label: 'Lato', category: 'Sans-serif' },
  // 8. Montserrat
  { value: "'Montserrat', sans-serif", label: 'Montserrat', category: 'Sans-serif' },
  // 9. Poppins
  { value: "'Poppins', sans-serif", label: 'Poppins', category: 'Sans-serif' },
  // 10. Nunito
  { value: "'Nunito', sans-serif", label: 'Nunito', category: 'Sans-serif' },
  // 11. DM Sans
  { value: "'DM Sans', sans-serif", label: 'DM Sans', category: 'Sans-serif' },
  // 12. Outfit
  { value: "'Outfit', sans-serif", label: 'Outfit', category: 'Sans-serif' },
  // 13. Raleway
  { value: "'Raleway', sans-serif", label: 'Raleway', category: 'Sans-serif' },
  // 14. Work Sans
  { value: "'Work Sans', sans-serif", label: 'Work Sans', category: 'Sans-serif' },
  // 15. Libre Franklin
  { value: "'Libre Franklin', sans-serif", label: 'Libre Franklin', category: 'Sans-serif' },
  // 16. Josefin Sans
  { value: "'Josefin Sans', sans-serif", label: 'Josefin Sans', category: 'Sans-serif' },
  // 17. Quicksand
  { value: "'Quicksand', sans-serif", label: 'Quicksand', category: 'Sans-serif' },
  // 18. Jost
  { value: "'Jost', sans-serif", label: 'Jost', category: 'Sans-serif' },
  // 19. Space Grotesk
  { value: "'Space Grotesk', sans-serif", label: 'Space Grotesk', category: 'Sans-serif' },
  // 20. Plus Jakarta Sans
  { value: "'Plus Jakarta Sans', sans-serif", label: 'Plus Jakarta Sans', category: 'Sans-serif' },
  // 21. Oswald (bonus)
  { value: "'Oswald', sans-serif", label: 'Oswald', category: 'Sans-serif' },
];

export type AvailableFont = typeof AVAILABLE_FONTS[number]['value'];

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
