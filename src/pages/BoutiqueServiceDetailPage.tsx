// ============================================================
// BOUTIQUE SERVICE DETAIL PAGE
// Version V4 — Galerie d'images (thumbnails) + CachedImage
// ============================================================

import React, { useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { CachedImage } from '../components/CachedImage';
import { useService } from '../hooks/useServices';
import {
  ArrowLeft, Briefcase, Clock, CheckCircle, XCircle,
  Send, DollarSign, Calendar,
} from 'lucide-react';

interface RouteParams {
  id: string;
}

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: service, isLoading } = useService(id);

  const [selectedImage, setSelectedImage] = useState(0);

  // ✅ Liste complète des images
  const images = useMemo(() => {
    if (!service) return [];
    if (service.images && service.images.length > 0) return service.images;
    return service.image_url ? [service.image_url] : [];
  }, [service]);

  if (isLoading) {
    return <div className="p-6 max-w-6xl mx-auto text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }
  if (!service) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center text-[var(--color-danger)]">
        <Briefcase size={48} className="mx-auto opacity-30 mb-4" />
        <p className="text-lg font-medium">Service introuvable</p>
        <button
          onClick={() => history.push('/services')}
          className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
        >
          Retour aux services
        </button>
      </div>
    );
  }

  const attributsAffiches = service.attributs && service.attributs.length > 0
    ? service.attributs.map((a) => a.nom)
    : [];

  const catNom = service.categorie_service?.nom || service.categorie?.nom;
  const currentImage = images[selectedImage];

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-6">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <button
          onClick={() => history.push('/services')}
          className="flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] mb-4"
        >
          <ArrowLeft size={20} /> Retour aux services
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : galerie */}
          <MotionBox type="card" variant="elevated" className="p-4">
            {/* Image principale */}
            <div className="w-full aspect-[4/3] rounded-xl bg-[var(--color-secondary)] flex items-center justify-center overflow-hidden mb-3">
              {currentImage ? (
                <CachedImage
                  key={currentImage}
                  src={currentImage}
                  alt={service.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Briefcase size={80} className="text-[var(--color-textSecondary)] opacity-30" />
              )}
            </div>

            {/* Thumbnails */}
            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img, idx) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      idx === selectedImage
                        ? 'border-[var(--color-primary)]'
                        : 'border-[var(--color-borderColor)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <CachedImage
                      src={img}
                      alt={`${service.nom} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </MotionBox>

          {/* Colonne droite : détails */}
          <MotionBox type="card" variant="elevated" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{service.nom}</h1>
                {catNom && <p className="text-sm text-[var(--color-textSecondary)] mt-1">{catNom}</p>}
              </div>
              {service.disponible ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-success)] flex-shrink-0">
                  <CheckCircle size={16} /> Disponible
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-danger)] flex-shrink-0">
                  <XCircle size={16} /> Indisponible
                </span>
              )}
            </div>

            <div className="mt-4 flex flex-wrap gap-6">
              {(service.mode_paiement === 'forfait' || service.mode_paiement === 'les_deux' || !service.mode_paiement) && service.prix > 0 && (
                <div className="flex items-center gap-2">
                  <DollarSign size={20} className="text-[var(--color-primary)]" />
                  <span className="text-2xl font-bold text-[var(--color-primary)]">
                    {service.prix.toLocaleString()} FCFA
                  </span>
                </div>
              )}
              {(service.mode_paiement === 'horaire' || service.mode_paiement === 'les_deux') && (service.prix_horaire || 0) > 0 && (
                <div className="flex items-center gap-2">
                  <Clock size={20} className="text-[var(--color-textSecondary)]" />
                  <span className="text-lg text-[var(--color-textPrimary)]">
                    {service.prix_horaire?.toLocaleString()} FCFA/h
                  </span>
                </div>
              )}
              {service.duree_estimee_heures && (
                <div className="flex items-center gap-2">
                  <Calendar size={20} className="text-[var(--color-textSecondary)]" />
                  <span className="text-[var(--color-textPrimary)]">{service.duree_estimee_heures}h</span>
                </div>
              )}
            </div>

            <div className="pt-4 mt-4 border-t border-[var(--color-borderColor)]">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">Description</h3>
              <p className="text-[var(--color-textSecondary)] leading-relaxed whitespace-pre-wrap">
                {service.description}
              </p>
            </div>

            {attributsAffiches.length > 0 && (
              <div className="pt-4 mt-4 border-t border-[var(--color-borderColor)]">
                <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">
                  Informations à fournir
                </h3>
                <div className="flex flex-wrap gap-2">
                  {attributsAffiches.map((nom, idx) => (
                    <span
                      key={idx}
                      className="px-3 py-1 rounded-full text-sm bg-[var(--color-secondary)] text-[var(--color-textPrimary)]"
                    >
                      📋 {nom}
                    </span>
                  ))}
                </div>
              </div>
            )}

            {service.disponible ? (
              <button
                onClick={() => history.push(`/services/${service.id}/commander`)}
                className="mt-6 w-full px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center gap-2"
              >
                <Send size={18} /> Commander ce service
              </button>
            ) : (
              <div className="mt-6 p-4 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-center">
                <XCircle size={32} className="mx-auto mb-2" />
                <p className="font-medium">Service indisponible</p>
              </div>
            )}
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
