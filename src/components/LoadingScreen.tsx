/**
 * LoadingScreen – Écran de chargement initial avec barre de progression
 * Utilise MotionBox et affiche le logo, le nom de l'app et une barre de progression.
 */

import React from 'react';
import { MotionBox } from './MotionBox';
import { useConfig } from '../contexts/ConfigContext';

interface LoadingScreenProps {
  progress: number;
  message?: string;
}

export const LoadingScreen: React.FC<LoadingScreenProps> = ({ progress, message = 'Chargement des données...' }) => {
  const config = useConfig();
  const appName = config?.storeName || 'App PME';
  const logoUrl = config?.logo_url;
  const loadingScreenUrl = config?.loading_screen_url || '';
  const isVideoFile = /\.(mp4|webm|mov)(\?.*)?$/i.test(loadingScreenUrl);

  return (
    <MotionBox
      as="div"
      type="page"
      variant="default"
      className="fixed inset-0 flex items-center justify-center bg-[var(--color-background)] z-[9999]"
      style={{
        proprietes: {
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          bottom: 0,
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'var(--color-background)',
          zIndex: 9999,
        } as any,
      }}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        type="card"
        variant="large"
        className="max-w-md w-full p-8 text-center"
        animation={{ animationInitiale: { nom: 'popIn' } }}
      >
        {/* Ecran de chargement personnalise (Parametres > Ecran de chargement),
            sinon logo par defaut */}
        {loadingScreenUrl ? (
          isVideoFile ? (
            <video
              src={loadingScreenUrl}
              autoPlay
              loop
              muted
              playsInline
              className="h-32 w-auto mx-auto mb-4 rounded-lg"
            />
          ) : (
            <img
              src={loadingScreenUrl}
              alt={appName}
              className="h-32 w-auto mx-auto mb-4 rounded-lg"
            />
          )
        ) : (
          logoUrl && (
            <img src={logoUrl} alt={appName} className="h-16 w-auto mx-auto mb-4" />
          )
        )}
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{appName}</h1>
        <p className="text-sm text-[var(--color-textSecondary)] mt-1">{message}</p>

        {/* Barre de progression */}
        <div className="mt-6 w-full h-2 bg-[var(--color-borderColor)] rounded-full overflow-hidden">
          <MotionBox
            as="div"
            className="h-full rounded-full transition-all duration-300"
            style={{
              proprietes: {
                width: `${Math.min(progress, 100)}%`,
                backgroundColor: 'var(--color-primary)',
                transition: 'width 0.3s ease',
              } as any,
            }}
          />
        </div>

        {/* Pourcentage */}
        <p className="text-xs text-[var(--color-textSecondary)] mt-2">{Math.round(progress)}%</p>

        {/* Indicateur de version */}
        <p className="text-[10px] text-[var(--color-textSecondary)] mt-4 opacity-50">
          v{config?.app_version || '3.0.0'} · Chargement en cache
        </p>
      </MotionBox>
    </MotionBox>
  );
};

export default LoadingScreen;
