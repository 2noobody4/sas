// ============================================================
// THEME DEFAULT — Données du thème par défaut
// Version V3.1 — Ajout navbarBg et headerBg
// ============================================================

import { Theme } from '../types/theme-types';

export const THEME_PAR_DEFAUT: Theme = {
  id: 'default',
  nom: 'Défaut',
  actif: true,
  couleurs: {
    // Fond général
    background: '#F8F9FA',
    cardBg: '#FFFFFF',

    // Couleurs principales
    primary: '#1E3A5F',
    secondary: '#F4F6F8',
    accent: '#E8A33D',

    // États
    danger: '#E03131',
    success: '#2F9E44',
    warning: '#F76707',
    info: '#1971C2',

    // Texte et bordures
    textPrimary: '#1E3A5F',
    textSecondary: '#5B6672',
    borderColor: '#E2E6EA',

    // Primaire étendu
    primaryLight: '#E8EEF5',
    primaryDark: '#142B44',
    successLight: '#E8F5E9',
    successDark: '#1B7A2E',

    // ⭐ NAVIGATION (navbar + header)
    navbarBg: '#FFFFFF',
    headerBg: '#FFFFFF',

    // Cartes (tailles)
    smallCardBg: '#FFFFFF',
    mediumCardBg: '#FFFFFF',
    largeCardBg: '#FFFFFF',
    xlargeCardBg: '#FFFFFF',
    smallCardBorder: '#E2E6EA',
    mediumCardBorder: '#E2E6EA',
    largeCardBorder: '#E2E6EA',
    xlargeCardBorder: 'transparent',
  },
  typographie: {
    policeTitre: "'Sora', sans-serif",
    policeTexte: "'Inter', sans-serif",
    policeChiffres: "'IBM Plex Mono', monospace",
    echelleTaille: {
      xs: 12, sm: 14, base: 16, lg: 20, xl: 24,
      '2xl': 32, '3xl': 40, '4xl': 48,
    },
  },
  composants: [
    // ─── BOUTONS ───
    {
      typeComponent: 'button:primary',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          borderRadius: 8,
          padding: '12px 20px',
          fontWeight: 600,
          border: 'none',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        declenchees: [
          { trigger: 'hover', animation: 'hoverElevate' },
          { trigger: 'tap', animation: 'tapScale' },
        ],
      },
    },
    {
      typeComponent: 'button:secondary',
      style: {
        proprietes: {
          backgroundColor: 'transparent',
          color: 'var(--color-textPrimary)',
          borderRadius: 8,
          padding: '12px 20px',
          fontWeight: 600,
          border: '1px solid var(--color-borderColor)',
          cursor: 'pointer',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        declenchees: [
          { trigger: 'hover', animation: 'liftHover' },
          { trigger: 'tap', animation: 'tapScale' },
        ],
      },
    },
    // ─── CARTES ───
    {
      typeComponent: 'card:small',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-smallCardBg)',
          borderRadius: 8,
          padding: '8px 12px',
          border: '1px solid var(--color-smallCardBorder)',
          transition: 'all 0.2s ease',
        },
      },
    },
    {
      typeComponent: 'card:medium',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-mediumCardBg)',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid var(--color-mediumCardBorder)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease',
        },
      },
    },
    {
      typeComponent: 'card:large',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-largeCardBg)',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid var(--color-largeCardBorder)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
        },
      },
      animation: { animationInitiale: 'fadeIn' },
    },
    {
      typeComponent: 'card:xlarge',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-xlargeCardBg)',
          borderRadius: 20,
          padding: '32px 36px',
          border: '1px solid var(--color-xlargeCardBorder)',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
        },
      },
      animation: { animationInitiale: 'fadeIn' },
    },
    // ─── TEXTES ───
    {
      typeComponent: 'text:title',
      style: {
        proprietes: {
          fontSize: 24,
          fontWeight: 700,
          color: 'var(--color-textPrimary)',
          lineHeight: 1.2,
        },
      },
      animation: { animationInitiale: 'fadeIn' },
    },
    {
      typeComponent: 'text:body',
      style: {
        proprietes: {
          fontSize: 16,
          color: 'var(--color-textSecondary)',
          lineHeight: 1.6,
        },
      },
    },
    {
      typeComponent: 'text:caption',
      style: {
        proprietes: {
          fontSize: 12,
          color: 'var(--color-textSecondary)',
          lineHeight: 1.4,
        },
      },
    },
    // ─── INPUTS ───
    {
      typeComponent: 'input:default',
      style: {
        proprietes: {
          width: '100%',
          height: '44px',
          padding: '0 16px',
          borderRadius: 12,
          border: '1px solid var(--color-borderColor)',
          backgroundColor: 'var(--color-cardBg)',
          color: 'var(--color-textPrimary)',
          outline: 'none',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        declenchees: [{ trigger: 'focus', animation: 'focusRing' }],
      },
    },
    {
      typeComponent: 'input:filled',
      style: {
        proprietes: {
          width: '100%',
          height: '44px',
          padding: '0 16px',
          borderRadius: 12,
          border: '1px solid var(--color-borderColor)',
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-textPrimary)',
          outline: 'none',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        declenchees: [{ trigger: 'focus', animation: 'focusRing' }],
      },
    },
    // ─── SELECT ───
    {
      typeComponent: 'select:default',
      style: {
        proprietes: {
          width: '100%',
          height: '44px',
          padding: '0 16px',
          borderRadius: 12,
          border: '1px solid var(--color-borderColor)',
          backgroundColor: 'var(--color-cardBg)',
          color: 'var(--color-textPrimary)',
          outline: 'none',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        declenchees: [{ trigger: 'focus', animation: 'focusRing' }],
      },
    },
    // ─── BADGES ───
    {
      typeComponent: 'badge:primary',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },
    {
      typeComponent: 'badge:success',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-success)',
          color: '#FFFFFF',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },
    {
      typeComponent: 'badge:danger',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-danger)',
          color: '#FFFFFF',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },
    // ─── SETTINGS ───
    {
      typeComponent: 'settings:field',
      style: { proprietes: { width: '100%' } },
    },
    {
      typeComponent: 'settings:card',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-cardBg)',
          borderRadius: 12,
          padding: '20px',
          border: '1px solid var(--color-borderColor)',
          transition: 'all 0.2s ease',
        },
      },
    },
    {
      typeComponent: 'settings:section',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-cardBg)',
          borderRadius: 12,
          padding: '24px',
          border: '1px solid var(--color-borderColor)',
        },
      },
    },
    // ─── UPLOAD ───
    {
      typeComponent: 'upload:general',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-primary)',
          color: '#FFFFFF',
          padding: '10px 20px',
          borderRadius: 12,
          border: 'none',
          fontWeight: 600,
          cursor: 'pointer',
          transition: 'all 0.2s ease',
          display: 'inline-flex',
          alignItems: 'center',
          gap: '8px',
        },
      },
      animation: {
        declenchees: [
          { trigger: 'hover', animation: 'hoverElevate' },
          { trigger: 'tap', animation: 'tapScale' },
        ],
      },
    },
    // ⭐ NAVBAR et HEADER (nouveaux composants)
    {
      typeComponent: 'navbar:default',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-navbarBg, #FFFFFF)',
          borderTop: '1px solid var(--color-borderColor)',
        },
      },
    },
    {
      typeComponent: 'header:default',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-headerBg, #FFFFFF)',
          borderBottom: '1px solid var(--color-borderColor)',
        },
      },
    },
  ],
};

export default THEME_PAR_DEFAUT;
