import React from 'react';
import { useOffline } from '../contexts/OfflineContext';
import { MotionBox } from './MotionBox';
import { CloudOff, Cloud, RefreshCw, Wifi } from 'lucide-react';

export const SyncStatus: React.FC = () => {
  const { isOnline, queueCount, isProcessing } = useOffline();

  return (
    <MotionBox
      as="div"
      type="box"
      variant="default"
      className="flex items-center gap-2 px-3 py-1 rounded-full text-xs bg-[var(--color-secondary)] text-[var(--color-textSecondary)] border border-[var(--color-borderColor)]"
    >
      {isProcessing ? (
        <>
          <RefreshCw size={14} className="animate-spin text-[var(--color-primary)]" />
          <span className="text-[var(--color-textPrimary)]">Synchronisation...</span>
        </>
      ) : isOnline ? (
        <>
          <Wifi size={14} className="text-[var(--color-success)]" />
          <span className="text-[var(--color-textSecondary)]">En ligne</span>
        </>
      ) : (
        <>
          <CloudOff size={14} className="text-[var(--color-danger)]" />
          <span className="text-[var(--color-danger)]">Hors ligne</span>
        </>
      )}
      {queueCount > 0 && (
        <span className="ml-1 px-1.5 py-0.5 rounded-full bg-[var(--color-warning)] text-white text-[10px] font-bold">
          {queueCount}
        </span>
      )}
    </MotionBox>
  );
};

export default SyncStatus;
