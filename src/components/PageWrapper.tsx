// ============================================================
// PAGE WRAPPER — Animation entrée / sortie + propagation
// Version V4.0 — Enregistré au animationController
// ============================================================

import React, { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { animationController } from '../lib/animationController';
import { PageExitContext } from '../contexts/PageExitContext';

interface PageWrapperProps {
  children: React.ReactNode;
  className?: string;
}

const ANIMATOR_ID = 'page-wrapper';
const EXIT_DURATION_MS = 800;
const ENTER_DURATION_S = 0.35;

export const PageWrapper: React.FC<PageWrapperProps> = ({
  children,
  className = '',
}) => {
  const [headerHeight, setHeaderHeight] = useState(64);
  const [navbarHeight, setNavbarHeight] = useState(64);
  const [isExiting, setIsExiting] = useState(false);
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const { pathname } = useLocation();

  // --- Enregistrer l'animator ---
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PageWrapper] ▸ REGISTER animator');
    }

    const unregister = animationController.register(ANIMATOR_ID, async () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PageWrapper] ▸ ANIMATOR CALLED');
      }

      setIsExiting(true);

      await new Promise<void>((resolve) =>
        setTimeout(resolve, EXIT_DURATION_MS)
      );

      if (process.env.NODE_ENV === 'development') {
        console.log('[PageWrapper] ▸ exit done');
      }
    });

    return () => {
      if (process.env.NODE_ENV === 'development') {
        console.log('[PageWrapper] ▸ UNREGISTER animator');
      }
      unregister();
    };
  }, []);

  // --- Reset isExiting à chaque changement de route ---
  useEffect(() => {
    if (process.env.NODE_ENV === 'development') {
      console.log('[PageWrapper] ▸ route change →', pathname);
    }
    setIsExiting(false);
  }, [pathname]);

  // --- Scroll top ---
  useEffect(() => {
    if (scrollContainerRef.current) {
      scrollContainerRef.current.scrollTo({ top: 0, left: 0, behavior: 'smooth' });
    }
  }, [pathname]);

  // --- Mesure header / navbar ---
  useEffect(() => {
    const headerEl = document.querySelector('header') || document.querySelector('.header-wrapper');
    const navEl = document.querySelector('nav') || document.querySelector('.navbar-wrapper');

    if (headerEl) {
      const rect = headerEl.getBoundingClientRect();
      setHeaderHeight(rect.height || 64);
    }
    if (navEl) {
      const rect = navEl.getBoundingClientRect();
      setNavbarHeight(rect.height || 64);
    }
  }, []);

  return (
    <PageExitContext.Provider value={isExiting}>
      <motion.div
        ref={scrollContainerRef as any}
        initial={{ opacity: 0, y: 12 }}
        animate={isExiting ? { opacity: 0, y: -12 } : { opacity: 1, y: 0 }}
        transition={{
          duration: isExiting ? EXIT_DURATION_MS / 1000 : ENTER_DURATION_S,
          ease: 'easeInOut',
        }}
        style={{
          position: 'fixed',
          top: `${headerHeight}px`,
          right: 0,
          left: 0,
          height: `calc(100vh - ${headerHeight}px - ${navbarHeight}px)`,
          overflowY: 'auto',
          backgroundColor: 'var(--color-background)',
          paddingBottom: '100px',
        }}
        className={`lg:left-64 ${className}`}
      >
        {children}
      </motion.div>
    </PageExitContext.Provider>
  );
};

export default PageWrapper;
