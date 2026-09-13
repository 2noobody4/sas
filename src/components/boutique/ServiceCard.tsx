// ============================================================
// SERVICE CARD - Carte d'affichage d'un service (public)
// Version V3 - Compatible React 16
// ============================================================

import React from 'react';
import { MotionBox } from '../ui/MotionBox';
import { Service } from '../../types/services';
import { Briefcase, DollarSign, Clock, ArrowRight, CheckCircle } from 'lucide-react';

interface ServiceCardProps {
  service: Service;
  onClick: () => void;
}

export const ServiceCard: React.FC<ServiceCardProps> = ({ service, onClick }) => {
  const categorieNom = service.categorie?.nom || null;

  return (
    <MotionBox
      as="div"
      type="card"
      variant="default"
      className="overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
      onClick={onClick}
      animation={{
        declenchees: [{ trigger: 'hover', animation: 'liftHover' }],
      }}
    >
      <div className="aspect-video bg-[var(--color-secondary)] flex items-center justify-center overflow-hidden relative">
        {service.image_url ? (
          <img
            src={service.image_url}
            alt={service.nom}
            className="w-full h-full object-cover"
          />
        ) : (
          <Briefcase size={48} className="text-[var(--color-textSecondary)] opacity-30" />
        )}
        {service.disponible && (
          <div className="absolute top-3 right-3 bg-[var(--color-success)] text-white text-xs font-medium px-2 py-1 rounded-full flex items-center gap-1">
            <CheckCircle size={12} /> Disponible
          </div>
        )}
      </div>

      <div className="p-4">
        <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">{service.nom}</h3>
        {categorieNom && (
          <p className="text-xs text-[var(--color-textSecondary)] mt-1">{categorieNom}</p>
        )}

        <p className="text-sm text-[var(--color-textSecondary)] mt-2 line-clamp-2">
          {service.descriptif}
        </p>

        <div className="flex items-center justify-between mt-3 pt-3 border-t border-[var(--color-borderColor)]">
          <div className="flex items-center gap-4">
            <span className="text-lg font-bold text-[var(--color-primary)]">
              {service.prix.toLocaleString()} FCFA
            </span>
            {service.duree && (
              <span className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                <Clock size={14} /> {service.duree}
              </span>
            )}
          </div>
          <span className="text-[var(--color-primary)] transition-transform group-hover:translate-x-1">
            <ArrowRight size={18} />
          </span>
        </div>

        {service.informations_requises?.length > 0 && (
          <div className="mt-2 flex flex-wrap gap-1">
            {service.informations_requises.slice(0, 3).map((attr, idx) => (
              <span
                key={idx}
                className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
              >
                📋 {attr}
              </span>
            ))}
            {service.informations_requises.length > 3 && (
              <span className="px-2 py-0.5 rounded-full text-[10px] bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                +{service.informations_requises.length - 3}
              </span>
            )}
          </div>
        )}
      </div>
    </MotionBox>
  );
};

export default ServiceCard;
