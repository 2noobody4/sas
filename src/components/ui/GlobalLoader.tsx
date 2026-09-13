import React from 'react';
import { useIsFetching, useIsMutating } from 'react-query';
import { MotionBox } from './MotionBox';

export const GlobalLoader: React.FC = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <MotionBox
      as="div"
      className="fixed top-0 left-0 right-0 z-[9999] h-1 bg-[var(--color-primary)]"
      style={{
        proprietes: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          height: '4px',
          zIndex: 9999,
          backgroundColor: 'var(--color-primary)',
          transition: 'opacity 0.3s ease',
        } as any,
      }}
      animation={{
        animationInitiale: { nom: 'slideDown' },
        animationSortie: { nom: 'slideUpExit' },
      }}
    >
      <MotionBox
        as="div"
        className="h-full bg-[var(--color-primary-dark)]"
        style={{
          proprietes: {
            width: '100%',
            height: '100%',
            backgroundColor: 'var(--color-primary-dark)',
            animation: 'shimmer 1.5s infinite linear',
          } as any,
        }}
      />
    </MotionBox>
  );
};

export default GlobalLoader;
