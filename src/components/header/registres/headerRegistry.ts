// ============================================================
// HEADER REGISTRY — Registre des styles de header
// Version V3 — Compatible React 16
// ============================================================

export type HeaderStyle =
  | 'classic'
  | 'dark'
  | 'minimal'
  | 'glass'
  | 'gradient';

export interface HeaderDefinition {
  id: HeaderStyle;
  nom: string;
  description: string;
  containerStyle: React.CSSProperties;
  containerClassName?: string;
  textColor: string;
  backgroundColor: string;
  borderColor: string;
  logoColor?: string;
  iconColor: string;
  iconHoverColor: string;
  badgeBg: string;
}

export const HEADER_REGISTRY: Record<HeaderStyle, HeaderDefinition> = {
  classic: {
    id: 'classic',
    nom: 'Classique',
    description: 'Style classique avec fond blanc et bordure',
    containerStyle: {
      backgroundColor: '#FFFFFF',
      borderBottom: '1px solid #E2E6EA',
    },
    containerClassName: 'border-b border-gray-200',
    textColor: '#1E3A5F',
    backgroundColor: '#FFFFFF',
    borderColor: '#E2E6EA',
    iconColor: '#5B6672',
    iconHoverColor: '#1E3A5F',
    badgeBg: '#E03131',
  },
  dark: {
    id: 'dark',
    nom: 'Sombre',
    description: 'Style sombre avec fond noir',
    containerStyle: {
      backgroundColor: '#1A1A2E',
      borderBottom: '1px solid #2D2D44',
    },
    containerClassName: 'border-b border-gray-800',
    textColor: '#FFFFFF',
    backgroundColor: '#1A1A2E',
    borderColor: '#2D2D44',
    iconColor: '#6B6B8A',
    iconHoverColor: '#E8A33D',
    badgeBg: '#E03131',
  },
  minimal: {
    id: 'minimal',
    nom: 'Minimaliste',
    description: 'Style épuré sans bordure',
    containerStyle: {
      backgroundColor: 'transparent',
      borderBottom: 'none',
    },
    containerClassName: '',
    textColor: '#1E3A5F',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    iconColor: '#5B6672',
    iconHoverColor: '#1E3A5F',
    badgeBg: '#E03131',
  },
  glass: {
    id: 'glass',
    nom: 'Verre',
    description: 'Effet glassmorphism transparent',
    containerStyle: {
      backgroundColor: 'rgba(255,255,255,0.1)',
      backdropFilter: 'blur(20px)',
      borderBottom: '1px solid rgba(255,255,255,0.2)',
    },
    containerClassName: 'backdrop-blur-xl',
    textColor: '#FFFFFF',
    backgroundColor: 'rgba(255,255,255,0.1)',
    borderColor: 'rgba(255,255,255,0.2)',
    iconColor: 'rgba(255,255,255,0.7)',
    iconHoverColor: '#FFFFFF',
    badgeBg: '#E03131',
  },
  gradient: {
    id: 'gradient',
    nom: 'Dégradé',
    description: 'Style avec dégradé de couleurs',
    containerStyle: {
      background: 'linear-gradient(135deg, #1E3A5F 0%, #6C5CE7 100%)',
      borderBottom: 'none',
    },
    containerClassName: 'shadow-md',
    textColor: '#FFFFFF',
    backgroundColor: 'transparent',
    borderColor: 'transparent',
    iconColor: 'rgba(255,255,255,0.7)',
    iconHoverColor: '#FFFFFF',
    badgeBg: '#E03131',
  },
};

export function getHeaderStyle(id: HeaderStyle): HeaderDefinition | undefined {
  return HEADER_REGISTRY[id];
}

export function getHeaderStyles(): HeaderDefinition[] {
  return Object.values(HEADER_REGISTRY);
}

export function getHeaderStyleNames(): HeaderStyle[] {
  return Object.keys(HEADER_REGISTRY) as HeaderStyle[];
}

export default HEADER_REGISTRY;
