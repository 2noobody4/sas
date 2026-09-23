// ============================================================
// SERVICES PAGE — Catalogue public
// Version V6 — Affiche TOUS les services + filtre disponibilité
// ============================================================

import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { ServiceCard } from '../components/ServiceCard';
import { useServices } from '../hooks/useServices';
import { useConfig } from '../contexts/ConfigContext';
import { useFormat } from '../hooks/useFormat';
import { Search, Briefcase, Filter, X, ChevronLeft, ChevronRight, Clock, CheckCircle } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const history = useHistory();
  // ✅ Plus de filtre côté serveur : on charge TOUT
  const { data: services = [], isLoading } = useServices();
  const config = useConfig();
  const { formatCurrency } = useFormat();

  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [selectedCategorie, setSelectedCategorie] = useState('');
  // ✅ Nouveau : filtre "disponible uniquement" (désactivé par défaut)
  const [onlyAvailable, setOnlyAvailable] = useState(false);
  const [page, setPage] = useState(1);

  const displayMode = config.service_display_mode || 'full';
  const perPage = config.services_per_page ?? 12;

  // Catégories déduites
  const categories: string[] = [];
  services.forEach((s) => {
    if (s.categorie_service?.nom && !categories.includes(s.categorie_service.nom)) {
      categories.push(s.categorie_service.nom);
    }
  });

  const filtered = useMemo(() => {
    return services.filter(s => {
      const matchSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                          s.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchCategorie = selectedCategorie ? s.categorie_service?.nom === selectedCategorie : true;
      const matchDispo = onlyAvailable ? s.disponible === true : true;
      return matchSearch && matchCategorie && matchDispo;
    });
  }, [services, searchTerm, selectedCategorie, onlyAvailable]);

  const dispoCount = services.filter(s => s.disponible).length;

  const totalPages = Math.max(1, Math.ceil(filtered.length / perPage));
  const currentPage = Math.min(page, totalPages);
  const paginated = filtered.slice((currentPage - 1) * perPage, currentPage * perPage);

  if (isLoading) {
    return (
      <div className="p-6 max-w-7xl mx-auto text-center text-[var(--color-textSecondary)]">
        <div className="animate-pulse">Chargement des services...</div>
      </div>
    );
  }

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto min-h-screen">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Briefcase size={28} className="text-[var(--color-primary)]" />
            Nos services
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            {filtered.length} service{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
            {onlyAvailable && ` · ${dispoCount} disponible${dispoCount > 1 ? 's' : ''}`}
          </p>
        </div>

        <div className="flex flex-wrap gap-2">
          {/* ✅ Bouton filtre disponibilité */}
          <button
            onClick={() => { setOnlyAvailable(v => !v); setPage(1); }}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              onlyAvailable
                ? 'bg-[var(--color-success)] text-white border-[var(--color-success)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)]'
            }`}
          >
            <CheckCircle size={18} />
            {onlyAvailable ? 'Disponibles uniquement' : 'Tous les services'}
          </button>

          {categories.length > 0 && (
            <button
              onClick={() => setShowFilters(!showFilters)}
              className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
            >
              <Filter size={18} /> Catégories
            </button>
          )}
        </div>
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => { setSearchTerm(e.target.value); setPage(1); }}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
          />
        </div>
      </div>

      {showFilters && categories.length > 0 && (
        <MotionBox as="div" type="card" variant="medium" className="p-4 mb-6" animation={{ animationInitiale: 'fadeIn' }}>
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-[var(--color-textPrimary)]">Catégorie</span>
            {selectedCategorie && (
              <button
                onClick={() => { setSelectedCategorie(''); setPage(1); }}
                className="text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] flex items-center gap-1"
              >
                <X size={14} /> Effacer
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => { setSelectedCategorie(''); setPage(1); }}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                !selectedCategorie ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)] text-[var(--color-textSecondary)]'
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => { setSelectedCategorie(cat); setPage(1); }}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  selectedCategorie === cat ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)] text-[var(--color-textSecondary)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </MotionBox>
      )}

      {paginated.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-12 text-center text-[var(--color-textSecondary)]">
          <Briefcase size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg font-medium">
            {onlyAvailable ? 'Aucun service disponible' : 'Aucun service trouvé'}
          </p>
          <p className="text-sm">
            {onlyAvailable
              ? 'Essayez de désactiver le filtre de disponibilité.'
              : 'Nous reviendrons bientôt avec de nouveaux services.'}
          </p>
          {onlyAvailable && (
            <button
              onClick={() => setOnlyAvailable(false)}
              className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white inline-flex items-center gap-2"
            >
              <X size={16} /> Voir tous les services
            </button>
          )}
        </MotionBox>
      ) : displayMode === 'compact' ? (
        <div className="space-y-2">
          {paginated.map((service) => {
            const firstImage = (service.images && service.images.length > 0)
              ? service.images[0]
              : service.image_url;
            return (
              <MotionBox
                key={service.id}
                type="card"
                variant="default"
                className={`p-3 flex items-center gap-3 cursor-pointer hover:shadow-md transition ${!service.disponible ? 'opacity-60' : ''}`}
                onClick={() => history.push(`/services/${service.id}`)}
              >
                <div className="w-14 h-14 rounded-xl bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0 overflow-hidden">
                  {firstImage ? (
                    <img
                      src={firstImage}
                      alt={service.nom}
                      className="w-full h-full object-cover rounded-xl"
                      loading="lazy"
                    />
                  ) : (
                    <Briefcase size={24} className="text-[var(--color-textSecondary)] opacity-40" />
                  )}
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <h3 className="font-medium text-[var(--color-textPrimary)] truncate">{service.nom}</h3>
                    {!service.disponible && (
                      <span className="text-[10px] px-1.5 py-0.5 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)] font-medium flex-shrink-0">
                        Indisponible
                      </span>
                    )}
                  </div>
                  <p className="text-xs text-[var(--color-textSecondary)] line-clamp-1">{service.description}</p>
                </div>
                <div className="text-right flex-shrink-0">
                  <p className="font-bold text-[var(--color-primary)]">{formatCurrency(service.prix)}</p>
                  {service.duree && (
                    <p className="text-xs text-[var(--color-textSecondary)] flex items-center gap-1 justify-end">
                      <Clock size={12} /> {service.duree}
                    </p>
                  )}
                </div>
              </MotionBox>
            );
          })}
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {paginated.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => history.push(`/services/${service.id}`)}
            />
          ))}
        </div>
      )}

      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-2 mt-6">
          <button
            onClick={() => setPage(p => Math.max(1, p - 1))}
            disabled={currentPage === 1}
            className="p-2 rounded-lg border border-[var(--color-borderColor)] disabled:opacity-40"
          >
            <ChevronLeft size={18} />
          </button>
          <span className="text-sm text-[var(--color-textSecondary)]">
            Page {currentPage} / {totalPages}
          </span>
          <button
            onClick={() => setPage(p => Math.min(totalPages, p + 1))}
            disabled={currentPage === totalPages}
            className="p-2 rounded-lg border border-[var(--color-borderColor)] disabled:opacity-40"
          >
            <ChevronRight size={18} />
          </button>
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
