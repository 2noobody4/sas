import React from 'react';
import { MotionBox } from './MotionBox';
import { useOffline } from '../contexts/OfflineContext';
import { Wifi, WifiOff } from 'lucide-react';

export const OfflineBanner: React.FC = () => {
  const { isOnline } = useOffline();

  if (isOnline) return null;

  return (
    <MotionBox
      as="div"
      type="box"
      variant="default"
      className="fixed top-16 left-0 right-0 z-50 p-2 text-center text-white bg-[var(--color-danger)]"
      style={{
        proprietes: {
          position: 'fixed',
          top: '64px',
          left: 0,
          right: 0,
          zIndex: 50,
          padding: '8px',
          textAlign: 'center',
          backgroundColor: 'var(--color-danger)',
          color: '#fff',
        } as any,
      }}
      animation={{
        animationInitiale: { nom: 'slideDown' },
        animationSortie: { nom: 'slideUpExit' },
      }}
    >
      <div className="flex items-center justify-center gap-2 text-sm font-medium">
        <WifiOff size={18} />
        <span>Vous êtes hors ligne. Les données sont en cache.</span>
      </div>
    </MotionBox>
  );
};

export default OfflineBanner;
