// ============================================================
// HEADER WRAPPER — Conteneur fixe en haut
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { MotionBox } from '../ui/MotionBox';

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
