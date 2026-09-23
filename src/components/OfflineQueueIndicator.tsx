import React, { useState } from 'react';
import { useOffline } from '../contexts/OfflineContext';
import { MotionBox } from './MotionBox';
import { WifiOff, CloudOff, RefreshCw, X } from 'lucide-react';

export const OfflineQueueIndicator: React.FC = () => {
  const { isOnline, queueCount, processQueue, isProcessing } = useOffline();
  const [isOpen, setIsOpen] = useState(false);

  if (isOnline && queueCount === 0) return null;

  return (
    <div className="relative">
      <button
        onClick={() => setIsOpen(!isOpen)}
        className="relative p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)]"
        title={isOnline ? `${queueCount} actions en attente` : 'Hors ligne'}
      >
        {isOnline ? <CloudOff size={18} /> : <WifiOff size={18} />}
        {queueCount > 0 && (
          <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[var(--color-warning)] rounded-full flex items-center justify-center">
            {queueCount}
          </span>
        )}
      </button>

      {isOpen && queueCount > 0 && (
        <MotionBox
          as="div"
          className="absolute right-0 top-full mt-2 p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-lg w-64 z-50"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <div className="flex items-center justify-between mb-2">
            <span className="text-sm font-medium text-[var(--color-textPrimary)]">
              {isOnline ? 'Actions en attente' : 'Hors ligne'}
            </span>
            <button
              onClick={() => setIsOpen(false)}
              className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
            >
              <X size={16} />
            </button>
          </div>
          <p className="text-sm text-[var(--color-textSecondary)] mb-3">
            {queueCount} action{queueCount > 1 ? 's' : ''} en attente de synchronisation.
          </p>
          {isOnline && (
            <button
              onClick={() => processQueue()}
              disabled={isProcessing}
              className="w-full px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm flex items-center justify-center gap-2 disabled:opacity-50"
            >
              <RefreshCw size={16} className={isProcessing ? 'animate-spin' : ''} />
              {isProcessing ? 'Synchronisation...' : 'Synchroniser maintenant'}
            </button>
          )}
          {!isOnline && (
            <p className="text-xs text-[var(--color-textSecondary)] text-center">
              🔌 La synchronisation se fera automatiquement au retour de la connexion.
            </p>
          )}
        </MotionBox>
      )}
    </div>
  );
};

export default OfflineQueueIndicator;
