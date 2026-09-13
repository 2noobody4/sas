import React from 'react';
import { useIsFetching, useIsMutating } from 'react-query';
import { MotionBox } from './MotionBox';

export const FullPageLoader: React.FC = () => {
  const isFetching = useIsFetching();
  const isMutating = useIsMutating();
  const isLoading = isFetching > 0 || isMutating > 0;

  if (!isLoading) return null;

  return (
    <MotionBox
      as="div"
      className="fixed inset-0 z-[9998] flex items-center justify-center bg-black/30 backdrop-blur-sm"
      style={{
        proprietes: {
          position: 'fixed',
          inset: 0,
          zIndex: 9998,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.3)',
          backdropFilter: 'blur(4px)',
        } as any,
      }}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        className="w-12 h-12 border-4 border-[var(--color-primary)] border-t-transparent rounded-full"
        style={{
          proprietes: {
            width: '48px',
            height: '48px',
            borderWidth: '4px',
            borderStyle: 'solid',
            borderColor: 'var(--color-primary)',
            borderTopColor: 'transparent',
            borderRadius: '50%',
            animation: 'spin 0.8s linear infinite',
          } as any,
        }}
      />
    </MotionBox>
  );
};

export default FullPageLoader;
