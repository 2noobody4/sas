// ============================================================
// NAVIGATION REGISTRY — Registre central des navigations
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import type { LucideIcon } from 'lucide-react';
import * as Icons from 'lucide-react';

// ============================================================
// TYPES
// ============================================================

export interface NavigationStyle {
  id: string;
  nom: string;
  description: string;
  /** Styles CSS pour le conteneur */
  container: React.CSSProperties;
  /** Couleur des icônes inactives */
  iconColor: string;
  /** Couleur des icônes actives */
  iconActiveColor: string;
  /** Couleur des labels inactifs */
  labelColor: string;
  /** Couleur des labels actifs */
  labelActiveColor: string;
  /** Couleur de l'indicateur */
  indicatorColor: string;
  /** Couleur de fond des badges */
  badgeBg: string;
  /** Afficher les labels */
  showLabel: boolean;
  /** Classe CSS additionnelle */
  className?: string;
  /** Icône de prévisualisation */
  previewIcon?: LucideIcon;
}

export interface NavigationItem {
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

// ============================================================
// REGISTRE — Styles de navigation
// ============================================================

export const NAVIGATION_STYLES: Record<string, NavigationStyle> = {
  // ============================================================
  // 1. CLASSIQUE (navbar1)
  // ============================================================
  classic: {
    id: 'classic',
    nom: 'Classique',
    description: 'Style standard avec fond blanc et accents bleus',
    container: { backgroundColor: '#FFFFFF', borderTop: '1px solid #E2E6EA' },
    iconColor: '#5B6672',
    iconActiveColor: '#1E3A5F',
    labelColor: '#5B6672',
    labelActiveColor: '#1E3A5F',
    indicatorColor: '#E8A33D',
    badgeBg: '#E03131',
    showLabel: true,
    className: 'shadow-sm',
  },

  // ============================================================
  // 2. SOMBRE (navbar2)
  // ============================================================
  dark: {
    id: 'dark',
    nom: 'Sombre',
    description: 'Style élégant avec fond sombre et accents dorés',
    container: { backgroundColor: '#1A1A2E', borderTop: '1px solid #2D2D44' },
    iconColor: '#6B6B8A',
    iconActiveColor: '#E8A33D',
    labelColor: '#6B6B8A',
    labelActiveColor: '#E8A33D',
    indicatorColor: '#E8A33D',
    badgeBg: '#E03131',
    showLabel: true,
    className: 'shadow-lg',
  },

  // ============================================================
  // 3. FLOTTANT (navbar3)
  // ============================================================
  floating: {
    id: 'floating',
    nom: 'Flottant',
    description: 'Style moderne avec effet glassmorphism',
    container: {
      backgroundColor: 'rgba(255,255,255,0.92)',
      backdropFilter: 'blur(12px)',
      borderRadius: '24px',
      margin: '8px 16px',
      boxShadow: '0 8px 32px rgba(18,24,31,0.12)',
      border: '1px solid rgba(255,255,255,0.3)',
    },
    iconColor: '#5B6672',
    iconActiveColor: '#6C5CE7',
    labelColor: '#5B6672',
    labelActiveColor: '#6C5CE7',
    indicatorColor: '#6C5CE7',
    badgeBg: '#E03131',
    showLabel: true,
    className: 'shadow-xl',
  },

  // ============================================================
  // 4. MINIMALISTE (navbar4)
  // ============================================================
  minimal: {
    id: 'minimal',
    nom: 'Minimaliste',
    description: 'Style épuré sans labels, uniquement des icônes',
    container: { backgroundColor: '#FFFFFF', borderTop: '1px solid #EEF0F3', padding: '8px 0' },
    iconColor: '#ADB5BD',
    iconActiveColor: '#1E3A5F',
    labelColor: '#ADB5BD',
    labelActiveColor: '#1E3A5F',
    indicatorColor: '#1E3A5F',
    badgeBg: '#E03131',
    showLabel: false,
    className: 'shadow-sm',
  },

  // ============================================================
  // 5. DÉGRADÉ (navbar5)
  // ============================================================
  gradient: {
    id: 'gradient',
    nom: 'Dégradé',
    description: 'Style coloré avec dégradé violet/bleu',
    container: {
      background: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)',
      borderTop: 'none',
      boxShadow: '0 -4px 20px rgba(102,126,234,0.3)',
    },
    iconColor: 'rgba(255,255,255,0.6)',
    iconActiveColor: '#FFFFFF',
    labelColor: 'rgba(255,255,255,0.6)',
    labelActiveColor: '#FFFFFF',
    indicatorColor: '#FFFFFF',
    badgeBg: '#FF6B6B',
    showLabel: true,
    className: 'shadow-lg',
  },

  // ============================================================
  // 6. BOUTIQUE (navbar6)
  // ============================================================
  boutique: {
    id: 'boutique',
    nom: 'Boutique',
    description: 'Style chaleureux pour les sites e-commerce',
    container: { backgroundColor: '#FFF8F0', borderTop: '1px solid #F5E6D3' },
    iconColor: '#8B7355',
    iconActiveColor: '#C4892A',
    labelColor: '#8B7355',
    labelActiveColor: '#C4892A',
    indicatorColor: '#C4892A',
    badgeBg: '#E03131',
    showLabel: true,
    className: 'shadow-sm',
  },

  // ============================================================
  // 7. MODERNE (navbar7)
  // ============================================================
  moderne: {
    id: 'moderne',
    nom: 'Moderne',
    description: 'Style épuré avec accents néon',
    container: { backgroundColor: '#0F0F1A', borderTop: '1px solid #1A1A2E' },
    iconColor: '#4A4A6A',
    iconActiveColor: '#00D4FF',
    labelColor: '#4A4A6A',
    labelActiveColor: '#00D4FF',
    indicatorColor: '#00D4FF',
    badgeBg: '#FF2D55',
    showLabel: true,
    className: 'shadow-lg',
  },

  // ============================================================
  // 8. CORPORATE (navbar8)
  // ============================================================
  corporate: {
    id: 'corporate',
    nom: 'Corporate',
    description: 'Style professionnel pour les entreprises',
    container: { backgroundColor: '#1E3A5F', borderTop: '1px solid #18304C' },
    iconColor: '#7A9BB5',
    iconActiveColor: '#FFFFFF',
    labelColor: '#7A9BB5',
    labelActiveColor: '#FFFFFF',
    indicatorColor: '#E8A33D',
    badgeBg: '#E03131',
    showLabel: true,
    className: 'shadow-md',
  },
};

// ============================================================
// CATÉGORIES DE NAVIGATION
// ============================================================

export const NAVIGATION_CATEGORIES = {
  default: ['classic', 'dark', 'minimal'],
  ecommerce: ['boutique', 'floating', 'classic'],
  enterprise: ['corporate', 'dark', 'moderne'],
  creative: ['moderne', 'gradient', 'floating'],
};

// ============================================================
// HELPERS
// ============================================================

export function getNavigationStyle(id: string): NavigationStyle | undefined {
  return NAVIGATION_STYLES[id];
}

export function getNavigationStyles(): NavigationStyle[] {
  return Object.values(NAVIGATION_STYLES);
}

export function getNavigationCategories(): string[] {
  return Object.keys(NAVIGATION_CATEGORIES);
}

export function getStylesByCategory(category: string): NavigationStyle[] {
  const ids = NAVIGATION_CATEGORIES[category as keyof typeof NAVIGATION_CATEGORIES] || [];
  return ids.map((id) => NAVIGATION_STYLES[id]).filter(Boolean);
}

export function searchNavigationStyles(query: string): NavigationStyle[] {
  const q = query.toLowerCase();
  return Object.values(NAVIGATION_STYLES).filter(
    (style) =>
      style.id.toLowerCase().includes(q) ||
      style.nom.toLowerCase().includes(q) ||
      style.description.toLowerCase().includes(q)
  );
}

export default NAVIGATION_STYLES;
