// ============================================================
// PRODUCT IMAGE CAROUSEL — Galerie défilante pour card produit
// Version V1
// ------------------------------------------------------------
// - Bord d'image arrondi (rounded-2xl)
// - Flèches prev/next si plusieurs images
// - Pastilles (dots) de position
// - stopPropagation sur les contrôles pour ne pas déclencher
//   le clic de la card (ouverture page produit)
// ============================================================

import React, { useState } from 'react';
import { ChevronLeft, ChevronRight, Package } from 'lucide-react';
import { CachedImage } from './CachedImage';

interface ProductImageCarouselProps {
  images: string[];
  alt: string;
  className?: string;
  rounded?: string;
}

export const ProductImageCarousel: React.FC<ProductImageCarouselProps> = ({
  images,
  alt,
  className = '',
  rounded = 'rounded-2xl',
}) => {
  const [index, setIndex] = useState(0);
  const hasImages = images && images.length > 0;
  const hasMultiple = hasImages && images.length > 1;

  const goPrev = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((i) => (i === 0 ? images.length - 1 : i - 1));
  };

  const goNext = (e: React.MouseEvent) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex((i) => (i === images.length - 1 ? 0 : i + 1));
  };

  const goTo = (e: React.MouseEvent, i: number) => {
    e.stopPropagation();
    e.preventDefault();
    setIndex(i);
  };

  return (
    <div
      className={`relative w-full aspect-square bg-[var(--color-secondary)] overflow-hidden ${rounded} ${className}`}
    >
      {hasImages ? (
        <CachedImage
          key={images[index]}
          src={images[index]}
          alt={alt}
          className="w-full h-full object-cover"
        />
      ) : (
        <div className="w-full h-full flex items-center justify-center text-6xl opacity-20">
          <Package size={56} />
        </div>
      )}

      {hasMultiple && (
        <>
          <button
            type="button"
            onClick={goPrev}
            className="absolute left-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition"
            aria-label="Image précédente"
          >
            <ChevronLeft size={16} />
          </button>
          <button
            type="button"
            onClick={goNext}
            className="absolute right-1.5 top-1/2 -translate-y-1/2 p-1.5 rounded-full bg-black/40 text-white opacity-0 group-hover:opacity-100 hover:bg-black/60 transition"
            aria-label="Image suivante"
          >
            <ChevronRight size={16} />
          </button>

          <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex items-center gap-1.5">
            {images.map((_, i) => (
              <button
                type="button"
                key={i}
                onClick={(e) => goTo(e, i)}
                className={`h-1.5 rounded-full transition-all ${
                  i === index ? 'w-4 bg-white' : 'w-1.5 bg-white/60'
                }`}
                aria-label={`Aller à l'image ${i + 1}`}
              />
            ))}
          </div>
        </>
      )}
    </div>
  );
};

export default ProductImageCarousel;
