// ============================================================
// MOTIONBOX — Composant UI universel (avec toutes les props HTML)
// ============================================================

import React, { forwardRef } from 'react';
import { motion, MotionProps } from 'framer-motion';
import { useComponentStyle } from '../theme/ThemeContext';
import { resolveAnimation } from '../../registres/animationPresets';
import { Style, Animation } from '../../types/theme';

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
  /** Identifiant stable correspondant au registre des éditeurs. */
  usageId?: string;
  /** Page logique affichée dans les éditeurs de thème et d'animation. */
  page?: string;
  parentLevel?: number;
  isChildren?: boolean;
  // Props drag & drop
  onDrop?: React.DragEventHandler;
  onDragOver?: React.DragEventHandler;
  onDragLeave?: React.DragEventHandler;
}

const motionComponentCache = new Map<ElementType, React.ComponentType<any>>();

function getMotionComponent(Tag: ElementType) {
  if (!motionComponentCache.has(Tag)) {
    motionComponentCache.set(Tag, motion(Tag) as any);
  }
  const component = motionComponentCache.get(Tag);
  if (!component) {
    throw new Error(`MotionBox: impossible de créer le composant "${Tag}"`);
  }
  return component;
}

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
      ...props
    },
    ref
  ) => {
    const typeComponent = variant ? `${type}:${variant}` : type;

    const { proprietes, animation: animRes } = useComponentStyle(
      typeComponent,
      styleOverride,
      animationOverride
    );

    const motionProps = resolveAnimation(animRes);

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
      ...motionProps,
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
