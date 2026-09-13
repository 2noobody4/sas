// ============================================================
// NAVBAR WRAPPER — Conteneur fixe (bottom ou right)
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { MotionBox } from '../ui/MotionBox';

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
  const getStyle = (): React.CSSProperties => {
    if (position === 'bottom') {
      return {
        position: 'fixed',
        bottom: 0,
        left: 0,
        right: 0,
        width: '100%',
        height: size,
        zIndex: 50,
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
