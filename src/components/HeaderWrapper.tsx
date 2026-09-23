// ============================================================
// HEADER WRAPPER — Conteneur fixe en haut
// Version V3.1 — Fond via var(--color-headerBg)
// ============================================================

import React, { useEffect } from 'react';
import { MotionBox } from './MotionBox';

export interface HeaderWrapperProps {
  children: React.ReactNode;
  className?: string;
  height?: number;
}

export const HeaderWrapper: React.FC<HeaderWrapperProps> = ({
  children,
  className = '',
  height = 64,
}) => {
  // ⭐ Expose la hauteur réelle du header en variable CSS globale
  // (--header-h), utilisée par .modal-overlay-safe pour garder une marge
  // de 30px avec le header et éviter tout overflow des modals.
  useEffect(() => {
    document.documentElement.style.setProperty('--header-h', `${height}px`);
  }, [height]);

  return (
    <MotionBox
      as="div"
      type="box"
      variant="default"
      className={`fixed top-0 left-0 right-0 z-50 ${className}`}
      style={{
        proprietes: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: height,
          zIndex: 50,
          // ⭐ Fond dédié header (fallback sur cardBg)
          backgroundColor: 'var(--color-headerBg, var(--color-cardBg))',
        } as any,
      }}
      animation={{
        animationInitiale: 'fadeIn',
      }}
    >
      {children}
    </MotionBox>
  );
};

export default HeaderWrapper;

