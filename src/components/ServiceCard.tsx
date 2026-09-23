// ============================================================
// SERVICE CARD — Carte publique d'un service
// Version V5 — Style grisé pour indisponibles + carrousel
// ============================================================

import React, { useState, useCallback } from 'react';
import { MotionBox } from './MotionBox';
import { CachedImage } from './CachedImage';
import { Service } from '../types/services';
import { Briefcase, Clock, ArrowRight, CheckCircle, ChevronLeft, ChevronRight, XCircle } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const images: string[] = (service.images && service.images.length > 0)
    ? service.images
    : (service.image_url ? [service.image_url] : []);

  const [currentImage, setCurrentImage] = useState(0);
  const hasMultipleImages = images.length > 1;
  const isUnavailable = !service.disponible;

  const goPrev = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev - 1 + images.length) % images.length);
  }, [images.length]);

  const goNext = useCallback((e: React.MouseEvent) => {
    e.stopPropagation();
    setCurrentImage((prev) => (prev + 1) % images.length);
  }, [images.length]);

  const attributsAffiches = service.attributs && service.attributs.length > 0
    ? service.attributs.map((a) => a.nom)
    : [];

  const catNom = service.categorie_service?.nom || service.categorie?.nom;

  return (
    <MotionBox
      as="div"
      type="card"
      variant="default"
      className={`overflow-hidden transition-all duration-300 cursor-pointer ${
        isUnavailable
          ? 'opacity-70 grayscale hover:opacity-90 hover:grayscale-0'
          : 'hover:shadow-xl'
      }`}
      onClick={onClick}
      animation={{ declenchees: isUnavailable ? [] : [{ trigger: 'hover', animation: 'liftHover' }] }}
    >
      <div className="aspect-video bg-[var(--color-secondary)] flex items-center justify-center overflow-hidden relative group">
        {images.length > 0 ? (
          <>
            <CachedImage
              key={images[currentImage]}
              src={images[currentImage]}
              alt={service.nom}
              className="w-full h-full object-cover"
            />

            {hasMultipleImages && (
              <>
                <button
                  onClick={goPrev}
                  className="absolute left-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                  aria-label="Image précédente"
                >
                  <ChevronLeft size={18} />
                </button>
                <button
                  onClick={goNext}
                  className="absolute right-2 top-1/2 -translate-y-1/2 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center opacity-0 group-hover:opacity-100 transition hover:bg-black/70"
                  aria-label="Image suivante"
                >
                  <ChevronRight size={18} />
                </button>
                <div className="absolute bottom-2 left-1/2 -translate-x-1/2 flex gap-1.5">
                  {images.map((_, idx) => (
                    <button
                      key={idx}
                      onClick={(e) => { e.stopPropagation(); setCurrentImage(idx); }}
                      className={`w-1.5 h-1.5 rounded-full transition-all ${
                        idx === currentImage ? 'bg-white w-4' : 'bg-white/50 hover:bg-white/80'
                      }`}
                      aria-label={`Image ${idx + 1}`}
                    />
                  ))}
                </div>
                <div className="absolute top-2 left-2 bg-black/50 text-white text-[10px] font-medium px-2 py-0.5 rounded-full">
                  {currentImage + 1} / {images.length}
                </div>
              </>
            )}
          </>
        ) : (
          <Briefcase size={48} className="text-[var(--color-textSecondary)] opacity-30" />
        )}

        {/* ✅ Badge statut : Disponible OU Indisponible */}
        {service.disponible ? (
          <div className="absolute top-2 right-2 bg-[var(--color-success)] text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} /> Disponible
          </div>
        ) : (
          <div className="absolute top-2 right-2 bg-[var(--color-danger)] text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <XCircle size={12} /> Indisponible
          </div>
        )}

        {/* Overlay "Indisponible" sur l'image */}
        {isUnavailable && (
          <div className="absolute inset-0 bg-black/30 flex items-center justify-center pointer-events-none">
            <span className="px-3 py-1.5 rounded-full bg-white/90 text-[var(--color-danger)] text-xs font-semibold uppercase tracking-wider shadow-lg">
              Indisponible
            </span>
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">{service.nom}</h3>
        {catNom && <p className="text-xs text-[var(--color-textSecondary)] mt-1">{catNom}</p>}

        <p className="text-sm text-[var(--color-textSecondary)] mt-2 line-clamp-2">
          {service.description}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-borderColor)]">
          <div className="flex flex-wrap items-center gap-3">
            {(service.mode_paiement === 'forfait' || service.mode_paiement === 'les_deux' || !service.mode_paiement) && service.prix > 0 && (
              <span className="text-lg font-bold text-[var(--color-primary)]">
                {service.prix.toLocaleString()} FCFA
              </span>
            )}
            {(service.mode_paiement === 'horaire' || service.mode_paiement === 'les_deux') && (service.prix_horaire || 0) > 0 && (
              <span className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                <Clock size={14} /> {service.prix_horaire?.toLocaleString()} FCFA/h
              </span>
            )}
          </div>
          <span className="text-[var(--color-primary)]">
            <ArrowRight size={18} />
          </span>
        </div>

        {attributsAffiches.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {attributsAffiches.slice(0, 3).map((nom, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
              >
                📋 {nom}
              </span>
            ))}
            {attributsAffiches.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                +{attributsAffiches.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </MotionBox>
  );
};

export default ServiceCard;
