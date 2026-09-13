// ============================================================
// RESOLVE COMPONENT — Fonction unique de résolution
// Version V3 — Compatible React 16
// ============================================================

import { Theme, ComponentStyle, Style, Animation } from '../../types/theme';

// ============================================================
// PRESETS PAR DÉFAUT
// ============================================================

const DEFAULT_STYLES: Record<string, Style> = {
  'button:primary': {
    proprietes: {
      backgroundColor: '#1E3A5F',
      color: '#FFFFFF',
      borderRadius: 8,
      padding: '12px 20px',
      fontWeight: 600,
      border: 'none',
      cursor: 'pointer',
      transition: 'all 0.2s ease',
    },
  },
  'button:secondary': {
    proprietes: {
      backgroundColor: '#F4F6F8',
      color: '#1E3A5F',
      borderRadius: 8,
      padding: '12px 20px',
      fontWeight: 600,
      border: '1px solid #E2E6EA',
      cursor: 'pointer',
    },
  },
  'card:elevated': {
    proprietes: {
      backgroundColor: '#FFFFFF',
      borderRadius: 12,
      padding: '20px',
      boxShadow: '0 4px 12px rgba(18,24,31,0.10)',
      border: '1px solid #F1F3F5',
    },
  },
  'text:title': {
    proprietes: {
      fontSize: 24,
      fontWeight: 700,
      color: '#1E3A5F',
      lineHeight: 1.2,
    },
  },
  'text:body': {
    proprietes: {
      fontSize: 16,
      color: '#495057',
      lineHeight: 1.6,
    },
  },
  'input:default': {
    proprietes: {
      padding: '10px 14px',
      borderRadius: 8,
      border: '1px solid #E2E6EA',
      fontSize: 16,
      backgroundColor: '#FFFFFF',
      color: '#212529',
      outline: 'none',
      width: '100%',
    },
  },
};

const DEFAULT_ANIMATIONS: Record<string, Animation> = {
  'button:primary': {
    declenchees: [
      { trigger: 'hover', animation: 'hoverElevate' },
      { trigger: 'tap', animation: 'tapScale' },
    ],
  },
  'button:secondary': {
    declenchees: [
      { trigger: 'hover', animation: 'liftHover' },
      { trigger: 'tap', animation: 'tapScale' },
    ],
  },
  'card:elevated': {
    animationInitiale: 'fadeIn',
  },
  'text:title': {
    animationInitiale: 'fadeIn',
  },
};

// ============================================================
// RÉSOLUTION
// ============================================================

export interface ResolvedComponent {
  style: Style;
  animation?: Animation;
}

/**
 * Fonction unique de résolution.
 * Ordre : override > thème actif > preset par défaut
 */
export function resolveComponent(
  typeComponent: string,
  theme?: Theme,
  override?: { style?: Style; animation?: Animation }
): ResolvedComponent {
  // 1. Preset par défaut
  const defaultStyle = DEFAULT_STYLES[typeComponent] || { proprietes: {} };
  const defaultAnimation = DEFAULT_ANIMATIONS[typeComponent];

  // 2. Thème actif (si fourni)
  let themeStyle: Style | undefined;
  let themeAnimation: Animation | undefined;

  if (theme) {
    const component = theme.composants.find((c: ComponentStyle) => c.typeComponent === typeComponent);
    if (component) {
      themeStyle = component.style;
      themeAnimation = component.animation;
    }
  }

  // 3. Override (priorité maximale)
  const finalStyle: Style = {
    proprietes: {
      ...defaultStyle.proprietes,
      ...(themeStyle?.proprietes || {}),
      ...(override?.style?.proprietes || {}),
    },
  };

  const finalAnimation: Animation | undefined = override?.animation || themeAnimation || defaultAnimation;

  return {
    style: finalStyle,
    animation: finalAnimation,
  };
}

/**
 * Version pour le hook useComponentStyle
 */
export function resolveComponentForHook(
  typeComponent: string,
  theme?: Theme,
  styleOverride?: Style,
  animationOverride?: Animation
): { proprietes: Record<string, string | number>; animation?: Animation } {
  const result = resolveComponent(typeComponent, theme, {
    style: styleOverride,
    animation: animationOverride,
  });

  return {
    proprietes: result.style.proprietes,
    animation: result.animation,
  };
}

export default resolveComponent;
