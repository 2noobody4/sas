// ============================================================
// APP LINK — <a> avec interception pour animations
// Version V3 — Compatible React 16
// ------------------------------------------------------------
// preventDefault() bloque la navigation par défaut du navigateur
// puis appelle appHistory.push() qui déclenche l'animation.
// ============================================================

import React from 'react';
import { appHistory } from '../lib/appHistory';

export interface AppLinkProps
  extends Omit<React.AnchorHTMLAttributes<HTMLAnchorElement>, 'href'> {
  to: string;
  replace?: boolean;
  children: React.ReactNode;
  onNavigate?: () => void;
}

export const AppLink: React.FC<AppLinkProps> = ({
  to,
  replace = false,
  children,
  onNavigate,
  onClick,
  target,
  ...props
}) => {
  const handleClick = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (onClick) onClick(e);

    // Ne pas intercepter si :
    // - déjà preventDefault
    // - clic non-gauche
    // - modifieur (ctrl/cmd/shift/alt)
    // - target="_blank"
    if (
      e.defaultPrevented ||
      e.button !== 0 ||
      e.metaKey ||
      e.ctrlKey ||
      e.shiftKey ||
      e.altKey ||
      target === '_blank'
    ) {
      return;
    }

    // ⚡ Bloquer la navigation par défaut
    e.preventDefault();

    if (process.env.NODE_ENV === 'development') {
      console.log('[AppLink] click →', to);
    }

    if (onNavigate) onNavigate();

    if (replace) {
      appHistory.replace(to);
    } else {
      appHistory.push(to);
    }
  };

  return (
    <a href={to} onClick={handleClick} target={target} {...props}>
      {children}
    </a>
  );
};

export default AppLink;
