import React from 'react';
import { MotionBox } from './MotionBox';
import { useConfig } from '../../contexts/ConfigContext';

export interface FullScreenLoaderProps {
  progress?: number;
  message?: string;
  show?: boolean;
}

export const FullScreenLoader: React.FC<FullScreenLoaderProps> = ({
  progress = 0,
  message = 'Chargement...',
  show = true,
}) => {
  const config = useConfig();
  const appName = config?.storeName || 'App PME';
  const logoUrl = config?.logo_url;

  if (!show) return null;

  return (
    <MotionBox
      as="div"
      type="page"
      variant="default"
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-[var(--color-background)]"
      style={{
        proprietes: {
          position: 'fixed',
          inset: 0,
          zIndex: 9999,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
        } as any,
      }}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        type="card"
        variant="large"
        className="max-w-md w-full p-8 text-center bg-[var(--color-cardBg)] rounded-2xl shadow-xl border border-[var(--color-borderColor)]"
        animation={{ animationInitiale: { nom: 'popIn' } }}
      >
        {logoUrl && (
          <img src={logoUrl} alt={appName} className="h-16 w-auto mx-auto mb-4" />
        )}
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{appName}</h1>
        <p className="text-sm text-[var(--color-textSecondary)] mt-1">{message}</p>

        <div className="mt-6 flex justify-center">
          <MotionBox
            as="div"
            type="box"
            variant="default"
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
              } as any,
            }}
            animation={{ animationInitiale: { nom: 'spin' } }}
          />
        </div>

        <div className="mt-6 w-full h-2 bg-[var(--color-borderColor)] rounded-full overflow-hidden">
          <MotionBox
            as="div"
            className="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
            style={{
              proprietes: {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease',
              } as any,
            }}
          />
        </div>
        <p className="text-xs text-[var(--color-textSecondary)] mt-2">{Math.round(progress)}%</p>
      </MotionBox>
    </MotionBox>
  );
};

export default FullScreenLoader;
