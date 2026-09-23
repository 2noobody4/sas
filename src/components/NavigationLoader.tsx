// ============================================================
// NAVIGATION LOADER — Barre + overlay pendant la navigation
// Version V3 — Compatible React 16
// ============================================================

import React, { useEffect, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { useLocation } from 'react-router-dom';

export const NavigationLoader: React.FC = () => {
  const { pathname } = useLocation();
  const [isLoading, setIsLoading] = useState(false);
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Déclenche le loader à chaque changement de route
    setIsLoading(true);
    setProgress(0);

    // Progression simulée
    const steps = [30, 60, 85, 100];
    const timers = steps.map((value, i) =>
      setTimeout(() => setProgress(value), 60 * (i + 1))
    );

    const endTimer = setTimeout(() => {
      setIsLoading(false);
      setProgress(100);
    }, 400);

    return () => {
      timers.forEach(clearTimeout);
      clearTimeout(endTimer);
    };
  }, [pathname]);

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.3 }}
          className="fixed top-0 left-0 right-0 h-0.5 bg-transparent z-[9999] pointer-events-none"
        >
          <div
            className="h-full bg-[var(--color-primary)] transition-all duration-200"
            style={{ width: `${progress}%` }}
          />
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default NavigationLoader;
