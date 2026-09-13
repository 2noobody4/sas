// ============================================================
// THEME DEFAULT — Données du thème par défaut
// Version V3 — Compatible React 16
// ============================================================

import { Theme } from '../../types/theme';

export const THEME_PAR_DEFAUT: Theme = {
  id: 'default',
  nom: 'Défaut',
  actif: true,
  couleurs: {
    primary: '#1E3A5F',
    secondary: '#F4F6F8',
    accent: '#E8A33D',
    danger: '#E03131',
    success: '#2F9E44',
    warning: '#F76707',
    info: '#1971C2',
    background: '#F8F9FA',
    cardBg: '#FFFFFF',
    textPrimary: '#1E3A5F',
    textSecondary: '#5B6672',
    borderColor: '#E2E6EA',
    primaryLight: '#E8EEF5',
    primaryDark: '#142B44',
    successLight: '#E8F5E9',
    successDark: '#1B7A2E',
    smallCardBg: '#FFFFFF',
    mediumCardBg: '#FFFFFF',
    largeCardBg: '#FFFFFF',
    xlargeCardBg: '#F8F9FA',
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
    // ============================================================
    // BOUTONS
    // ============================================================
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
    // ============================================================
    // CARTES
    // ============================================================
    {
      typeComponent: 'card:small',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-small-cardBg)',
          borderRadius: 8,
          padding: '8px 12px',
          border: '1px solid var(--color-small-cardBorder)',
          transition: 'all 0.2s ease',
        },
      },
    },
    {
      typeComponent: 'card:medium',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-medium-cardBg)',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid var(--color-medium-cardBorder)',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
          transition: 'all 0.2s ease',
        },
      },
    },
    {
      typeComponent: 'card:large',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-large-cardBg)',
          borderRadius: 16,
          padding: '24px 28px',
          border: '1px solid var(--color-large-cardBorder)',
          boxShadow: '0 4px 16px rgba(0,0,0,0.08)',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        animationInitiale: 'fadeIn',
      },
    },
    {
      typeComponent: 'card:xlarge',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-xlarge-cardBg)',
          borderRadius: 20,
          padding: '32px 36px',
          border: '1px solid var(--color-xlarge-cardBorder)',
          boxShadow: 'none',
          transition: 'all 0.2s ease',
        },
      },
      animation: {
        animationInitiale: 'fadeIn',
      },
    },
    // ============================================================
    // TEXTES
    // ============================================================
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
      animation: {
        animationInitiale: 'fadeIn',
      },
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
    // ============================================================
    // INPUTS
    // ============================================================
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
    // ============================================================
    // SELECT
    // ============================================================
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
    // ============================================================
    // BADGES
    // ============================================================
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
      typeComponent: 'badge:secondary',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-textPrimary)',
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
    {
      typeComponent: 'badge:warning',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-warning)',
          color: '#FFFFFF',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },
    {
      typeComponent: 'badge:info',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-info)',
          color: '#FFFFFF',
          padding: '4px 12px',
          borderRadius: 9999,
          fontSize: 12,
          fontWeight: 600,
        },
      },
    },
    // ============================================================
    // SETTINGS
    // ============================================================
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
    {
      typeComponent: 'settings:button-primary',
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
      typeComponent: 'settings:button-secondary',
      style: {
        proprietes: {
          backgroundColor: 'transparent',
          color: 'var(--color-textSecondary)',
          padding: '10px 20px',
          borderRadius: 12,
          border: '1px solid var(--color-borderColor)',
          fontWeight: 500,
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
    {
      typeComponent: 'settings:checkbox',
      style: {
        proprietes: {
          width: '20px',
          height: '20px',
          borderRadius: 4,
          cursor: 'pointer',
        },
      },
    },
    {
      typeComponent: 'settings:radio',
      style: {
        proprietes: {
          width: '20px',
          height: '20px',
          cursor: 'pointer',
        },
      },
    },
    {
      typeComponent: 'settings:label',
      style: {
        proprietes: {
          fontSize: 14,
          fontWeight: 500,
          color: 'var(--color-textPrimary)',
          display: 'block',
          marginBottom: 4,
        },
      },
    },
    {
      typeComponent: 'settings:description',
      style: {
        proprietes: {
          fontSize: 12,
          color: 'var(--color-textSecondary)',
          marginTop: 4,
        },
      },
    },
    {
      typeComponent: 'settings:preview',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-cardBg)',
          borderRadius: 12,
          padding: 16,
          border: '1px solid var(--color-borderColor)',
        },
      },
    },
    // ============================================================
    // UPLOAD BUTTONS
    // ============================================================
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
    {
      typeComponent: 'upload:image',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-accent)',
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
    {
      typeComponent: 'upload:video',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-success)',
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
    {
      typeComponent: 'upload:audio',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-info)',
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
    {
      typeComponent: 'upload:document',
      style: {
        proprietes: {
          backgroundColor: 'var(--color-secondary)',
          color: 'var(--color-textPrimary)',
          padding: '10px 20px',
          borderRadius: 12,
          border: '1px solid var(--color-borderColor)',
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
          { trigger: 'hover', animation: 'liftHover' },
          { trigger: 'tap', animation: 'tapScale' },
        ],
      },
    },
  ],
};

export default THEME_PAR_DEFAUT;
