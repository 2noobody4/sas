// ============================================================
// NAVBAR WRAPPER — Conteneur fixe (bottom ou right)
// Version V3.1 — Fond via var(--color-navbarBg)
// ============================================================

import React, { useEffect } from 'react';
import { MotionBox } from './MotionBox';

export interface NavbarWrapperProps {
  position?: 'bottom' | 'right';
  size?: number;
  children: React.ReactNode;
  className?: string;
}

export const NavbarWrapper: React.FC<NavbarWrapperProps> = ({
  position = 'bottom',
  size = 64,
  children,
  className = '',
}) => {
  // ⭐ Expose la hauteur réelle de la navbar (quand elle occupe le bas de
  // l'écran) en variable CSS globale (--navbar-h), utilisée par
  // .modal-overlay-safe pour garder une marge de 30px avec la navbar.
  // Si la navbar est sur le côté droit, le bas de l'écran est libre : on
  // remet --navbar-h à 0 pour ne pas réserver un espace inutile.
  useEffect(() => {
    document.documentElement.style.setProperty(
      '--navbar-h',
      position === 'bottom' ? `${size}px` : '0px'
    );
  }, [position, size]);

  const getStyle = (): React.CSSProperties => {
    // ⭐ Fond dédié navbar (fallback sur cardBg)
    const bg = 'var(--color-navbarBg, var(--color-cardBg))';

    if (position === 'bottom') {
      return {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: size,
        zIndex: 50,
        backgroundColor: bg,
      };
    }
    return {
      position: 'fixed',
      top: 0,
      right: 0,
      bottom: 0,
      width: size,
      height: '100%',
      zIndex: 50,
      backgroundColor: bg,
    };
  };

  return (
    <MotionBox
      as="div"
      type="box"
      variant="default"
      className={className}
      style={{ proprietes: getStyle() as any }}
      animation={{
        animationInitiale: 'fadeIn',
      }}
    >
      {children}
    </MotionBox>
  );
};

export default NavbarWrapper;

