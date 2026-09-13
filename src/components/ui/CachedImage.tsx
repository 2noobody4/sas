/**
 * CachedImage – Affiche une image depuis le cache IndexedDB si disponible,
 * sinon télécharge et stocke pour les prochaines fois.
 * Utilise MotionBox pour l’animation et le style.
 * Compatible React 16.14.
 */

import React, { useEffect, useState, useRef } from 'react';
import { useDataLoader } from '../../contexts/DataLoaderContext';
import { MotionBox } from './MotionBox';

interface CachedImageProps extends React.ImgHTMLAttributes<HTMLImageElement> {
  src: string;
  fallback?: string;
  className?: string;
  alt?: string;
  /** Si true, utilise MotionBox pour le conteneur */
  useMotionBox?: boolean;
  /** Si useMotionBox est true, ces props sont passées à MotionBox */
  motionBoxProps?: any;
}

export const CachedImage: React.FC<CachedImageProps> = ({
  src,
  fallback = '',
  className = '',
  alt = '',
  useMotionBox = false,
  motionBoxProps = {},
  ...props
}) => {
  const { getCachedImage } = useDataLoader();
  const [imageSrc, setImageSrc] = useState<string>(src);
  const [loading, setLoading] = useState<boolean>(true);
  const mountedRef = useRef(true);

  useEffect(() => {
    mountedRef.current = true;
    return () => { mountedRef.current = false; };
  }, []);

  useEffect(() => {
    setLoading(true);
    getCachedImage(src)
      .then((cached) => {
        if (mountedRef.current) {
          setImageSrc(cached);
          setLoading(false);
        }
      })
      .catch(() => {
        if (mountedRef.current) {
          setImageSrc(fallback || src);
          setLoading(false);
        }
      });
  }, [src, fallback, getCachedImage]);

  const imgElement = (
    <img
      src={imageSrc}
      alt={alt}
      className={`${className} ${loading ? 'opacity-0' : 'opacity-100'}`}
      style={{ transition: 'opacity 0.3s ease', ...(props.style as any) }}
      onError={(e) => {
        if (fallback) {
          (e.target as HTMLImageElement).src = fallback;
        }
      }}
      {...(props as any)}
    />
  );

  if (useMotionBox) {
    return (
      <MotionBox
        as="div"
        type="box"
        variant="default"
        {...motionBoxProps}
        className={`relative ${motionBoxProps.className || ''}`}
      >
        {imgElement}
        {loading && (
          <MotionBox
            as="div"
            type="box"
            variant="default"
            className="absolute inset-0 flex items-center justify-center bg-[var(--color-secondary)]"
            animation={{ animationInitiale: { nom: 'pulse' } }}
          >
            <span className="text-sm text-[var(--color-textSecondary)]">Chargement...</span>
          </MotionBox>
        )}
      </MotionBox>
    );
  }

  return imgElement;
};

export default CachedImage;
