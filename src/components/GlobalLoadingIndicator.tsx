/**
 * GlobalLoadingIndicator — badge flottant affiché automatiquement tant que
 * useLoading().isLoading est true. Monté une seule fois dans App.tsx.
 * Ne concerne pas le chargement initial (voir LoadingScreen.tsx pour ça).
 */
import React from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { useLoading } from '../contexts/LoadingContext';
import { CircleLoader } from './CircleLoader';

export const GlobalLoadingIndicator: React.FC = () => {
  const { isLoading, message } = useLoading();

  return (
    <AnimatePresence>
      {isLoading && (
        <motion.div
          initial={{ opacity: 0, y: 10 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: 10 }}
          transition={{ duration: 0.2 }}
          className="fixed bottom-4 right-4 z-[9998] flex items-center gap-2 px-3 py-2 rounded-full shadow-lg bg-[var(--color-cardBg)] border border-[var(--color-borderColor)]"
        >
          <CircleLoader size={20} strokeWidth={3} />
          {message && <span className="text-xs text-[var(--color-textPrimary)]">{message}</span>}
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default GlobalLoadingIndicator;
