// ============================================================
// MOTIONBOX — Composant UI universel
// Version V3.7 — Fix : fusion animate + loop (plus de fade)
// ------------------------------------------------------------
// Quand une animation en boucle est active, elle FUSIONNE avec
// l'état final de l'animation d'entrée (opacity: 1, x: 0, y: 0,
// scale: 1) au lieu de la remplacer.
// ============================================================

import React, { forwardRef, useContext, useEffect, useState } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useComponentStyle } from '../contexts/ThemeContext';
import { PageExitContext } from '../contexts/PageExitContext';
import { resolveAnimation, resolveLoopAnimation } from '../registres/animationPresets';
import { Style, Animation } from '../types/theme-types';

export type ElementType = keyof JSX.IntrinsicElements;

export interface AnalyticsProps {
  category?: string;
  action?: string;
  label?: string;
  value?: number;
}

export interface MotionBoxProps
  extends Omit<MotionProps, 'style'>,
    Omit<React.HTMLAttributes<HTMLElement>, 'style' | 'onAnimationStart' | 'onDrag' | 'onDragEnd' | 'onDragStart'> {
  as?: ElementType;
  type?: string;
  variant?: string;
  style?: Style;
  animation?: Animation;
  children?: React.ReactNode;
  className?: string;
  onClick?: React.MouseEventHandler;
  disabled?: boolean;
  data?: Record<string, any>;
  analytics?: AnalyticsProps;
  usageId?: string;
  page?: string;
  parentLevel?: number;
  isChildren?: boolean;
  onDrop?: React.DragEventHandler;
  onDragOver?: React.DragEventHandler;
  onDragLeave?: React.DragEventHandler;
  isExiting?: boolean;
  onExitComplete?: () => void;
  /** Raccourci : id d'animation en boucle (pulse, heartBeat, glow, ...) */
  loopAnimation?: string;
}

const LOOP_DELAY_MS = 500; // délai après la fin de l'entrée

const motionComponentCache = new Map<ElementType, React.ComponentType<any>>();

function getMotionComponent(Tag: ElementType) {
  if (!motionComponentCache.has(Tag)) {
    motionComponentCache.set(Tag, motion(Tag) as any);
  }
  const component = motionComponentCache.get(Tag);
  if (!component) throw new Error(`MotionBox: impossible de créer "${Tag}"`);
  return component;
}

// Durée d'animation estimée (en ms)
function estimateDurationMs(preset: any): number {
  if (!preset || !preset.transition) return 300;
  const t = preset.transition;
  if (typeof t.duration === 'number') return t.duration * 1000;
  if (t.type === 'spring') return 500;
  return 300;
}

// ⭐ État final sécurisé d'une animation d'entrée
// Utilisé pour garantir que les propriétés transform/opacity
// ont toujours une valeur finale explicite quand on fusionne
// avec une animation en boucle.
const SAFE_FINAL_STATE = {
  opacity: 1,
  x: 0,
  y: 0,
  scale: 1,
  rotate: 0,
};

export const MotionBox = forwardRef<HTMLElement, MotionBoxProps>(
  (
    {
      as: Tag = 'div',
      type = 'box',
      variant,
      style: styleOverride,
      animation: animationOverride,
      children,
      className = '',
      onClick,
      disabled,
      data,
      analytics,
      usageId,
      page,
      parentLevel = 0,
      isChildren = false,
      isExiting: isExitingProp,
      onExitComplete,
      loopAnimation,
      ...props
    },
    ref
  ) => {
    const pageIsExiting = useContext(PageExitContext);

    const typeComponent = variant ? `${type}:${variant}` : type;

    const { proprietes, animation: animRes } = useComponentStyle(
      typeComponent,
      styleOverride,
      animationOverride
    );

    // --- Résolution animation d'entrée / interactions ---
    const motionProps = resolveAnimation(animRes);

    // --- Décision exit ---
    const shouldExit =
      isExitingProp !== undefined
        ? isExitingProp
        : pageIsExiting === true;

    // --- Animation loop : activée 500ms après la fin de l'entrée ---
    const loopSource = loopAnimation || animRes?.animationLoop;
    const loopProps = loopSource ? resolveLoopAnimation(loopSource) : {};

    const [loopActive, setLoopActive] = useState(false);

    useEffect(() => {
      if (!loopSource) {
        setLoopActive(false);
        return;
      }

      const entreeDuration = motionProps.animate
        ? estimateDurationMs(
            motionProps.transition
              ? { transition: motionProps.transition }
              : null
          )
        : 0;

      const totalDelay = entreeDuration + LOOP_DELAY_MS;

      if (process.env.NODE_ENV === 'development') {
        console.log('[MotionBox] loop scheduling', {
          typeComponent,
          loop: typeof loopSource === 'string' ? loopSource : loopSource.nom,
          entreeDuration,
          delay: totalDelay,
        });
      }

      const timer = setTimeout(() => {
        setLoopActive(true);
        if (process.env.NODE_ENV === 'development') {
          console.log('[MotionBox] loop ACTIVE', {
            typeComponent,
            loop: typeof loopSource === 'string' ? loopSource : loopSource.nom,
          });
        }
      }, totalDelay);

      return () => {
        clearTimeout(timer);
        setLoopActive(false);
      };
    }, [loopSource, motionProps.animate, motionProps.transition, typeComponent]);

    if (process.env.NODE_ENV === 'development' && pageIsExiting) {
      console.log('[MotionBox] exit', {
        typeComponent,
        shouldExit,
        hasCustomExit: !!motionProps.exit,
      });
    }

    // --- Construction des props d'animation ---
    const animationEntries: any = { ...motionProps };

    // ⭐ FUSION : si la loop est active ET pas en exit → on fusionne
    // l'état final de l'entrée avec l'animation de la boucle.
    // On ne remplace JAMAIS `animate` complètement, sinon framer-motion
    // réinterpole depuis `initial` et provoque un fade parasite.
    if (loopActive && !shouldExit && loopProps.animate) {
      const entreeFinale = animationEntries.animate || {};

      // ⭐ On force les propriétés "transform" à leur état final sûr
      // AVANT d'ajouter les propriétés de la boucle.
      // Ainsi, `opacity` reste à 1, `x` à 0, `y` à 0, `scale` à 1
      // même si la boucle n'anime que `y`.
      const finalBase: Record<string, any> = { ...SAFE_FINAL_STATE };

      // On surcharge avec les valeurs finales de l'entrée si présentes
      Object.keys(entreeFinale).forEach((key) => {
        const val = entreeFinale[key];
        // Si c'est un nombre simple (opacity: 1, y: 0), on l'utilise comme base
        if (typeof val === 'number' || typeof val === 'string') {
          finalBase[key] = val;
        }
      });

      animationEntries.animate = {
        ...finalBase,          // ← état final garanti (opacity: 1, etc.)
        ...loopProps.animate,  // ← propriétés animées de la boucle
      };
      animationEntries.transition = loopProps.transition;
    }

    if (shouldExit) {
      if (motionProps.exit) {
        animationEntries.animate = motionProps.exit;
        animationEntries.transition =
          motionProps.exitTransition || { duration: 0.3, ease: 'easeInOut' };
      } else {
        animationEntries.animate = { opacity: 0, y: -8 };
        animationEntries.transition = { duration: 0.3, ease: 'easeInOut' };
      }
      if (onExitComplete) {
        animationEntries.onAnimationComplete = onExitComplete;
      }
    }

    // Nettoyer les props non reconnues par motion
    delete animationEntries.exit;
    delete animationEntries.exitTransition;

    const finalStyle = {
      ...proprietes,
      ...(styleOverride?.proprietes ?? {}),
      ...(disabled ? { opacity: 0.6, cursor: 'not-allowed', pointerEvents: 'none' } : {}),
    };

    const dataAttrs: Record<string, any> = {
      'data-motionbox': true,
      'data-motionbox-type': type,
      'data-motionbox-variant': variant || 'default',
      'data-motionbox-component': typeComponent,
      'data-motionbox-parent-level': parentLevel,
      'data-motionbox-is-children': isChildren,
    };
    if (usageId) dataAttrs['data-motionbox-usage-id'] = usageId;
    if (page) dataAttrs['data-motionbox-page'] = page;
    if (loopSource) {
      dataAttrs['data-motionbox-loop'] =
        typeof loopSource === 'string' ? loopSource : loopSource.nom;
      dataAttrs['data-motionbox-loop-active'] = loopActive;
    }
    if (data) {
      Object.entries(data).forEach(([key, value]) => {
        dataAttrs[`data-${key}`] = value;
      });
    }
    if (analytics) {
      if (analytics.category) dataAttrs['data-analytics-category'] = analytics.category;
      if (analytics.action) dataAttrs['data-analytics-action'] = analytics.action;
      if (analytics.label) dataAttrs['data-analytics-label'] = analytics.label;
      if (analytics.value !== undefined) dataAttrs['data-analytics-value'] = analytics.value;
    }

    const allProps = {
      ...props,
      ...animationEntries,
      onClick: disabled ? undefined : onClick,
      style: finalStyle,
      className,
      ...dataAttrs,
    };

    const MotionComponent = getMotionComponent(Tag);
    return (
      <MotionComponent ref={ref as any} {...allProps}>
        {children}
      </MotionComponent>
    );
  }
);

MotionBox.displayName = 'MotionBox';

export default MotionBox;
