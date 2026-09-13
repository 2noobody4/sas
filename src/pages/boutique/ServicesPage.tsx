// ============================================================
// SERVICES PAGE - Liste publique des services
// Version V3 - Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useServices } from '../../hooks/useServices';
import { ServiceCard } from '../../components/boutique/ServiceCard';
import { Search, Briefcase, Filter, X } from 'lucide-react';

export const ServicesPage: React.FC = () => {
  const history = useHistory();
  const { data: services = [], isLoading } = useServices({ disponible: true });
  const [searchTerm, setSearchTerm] = useState('');
  const [showFilters, setShowFilters] = useState(false);

  // Extraire les catégories uniques
  const categories: string[] = [];
  services.forEach((s) => {
    if (s.categorie?.nom && !categories.includes(s.categorie.nom)) {
      categories.push(s.categorie.nom);
    }
  });

  const [selectedCategorie, setSelectedCategorie] = useState('');

  const filtered = services.filter(s => {
    const matchSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.descriptif?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = selectedCategorie ? s.categorie?.nom === selectedCategorie : true;
    return matchSearch && matchCategorie;
  });

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
            {filtered.length} service{filtered.length > 1 ? 's' : ''} disponible{filtered.length > 1 ? 's' : ''}
          </p>
        </div>
        {categories.length > 0 && (
          <button
            onClick={() => setShowFilters(!showFilters)}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <Filter size={18} /> Filtres
          </button>
        )}
      </div>

      <div className="flex gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
          />
        </div>
      </div>

      {showFilters && categories.length > 0 && (
        <MotionBox
          as="div"
          type="card"
          variant="medium"
          className="p-4 mb-6"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <div className="flex items-center justify-between mb-3">
            <span className="font-medium text-[var(--color-textPrimary)]">Catégorie</span>
            {selectedCategorie && (
              <button
                onClick={() => setSelectedCategorie('')}
                className="text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] flex items-center gap-1"
              >
                <X size={14} /> Effacer
              </button>
            )}
          </div>
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setSelectedCategorie('')}
              className={`px-3 py-1.5 rounded-full text-sm transition ${
                !selectedCategorie
                  ? 'bg-[var(--color-primary)] text-white'
                  : 'bg-[var(--color-secondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-borderColor)]'
              }`}
            >
              Tous
            </button>
            {categories.map((cat) => (
              <button
                key={cat}
                onClick={() => setSelectedCategorie(cat)}
                className={`px-3 py-1.5 rounded-full text-sm transition ${
                  selectedCategorie === cat
                    ? 'bg-[var(--color-primary)] text-white'
                    : 'bg-[var(--color-secondary)] text-[var(--color-textSecondary)] hover:bg-[var(--color-borderColor)]'
                }`}
              >
                {cat}
              </button>
            ))}
          </div>
        </MotionBox>
      )}

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-12 text-center text-[var(--color-textSecondary)]">
          <Briefcase size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg font-medium">Aucun service disponible</p>
          <p className="text-sm">Nous reviendrons bientôt avec de nouveaux services.</p>
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-5">
          {filtered.map((service) => (
            <ServiceCard
              key={service.id}
              service={service}
              onClick={() => history.push(`/services/${service.id}`)}
            />
          ))}
        </div>
      )}
    </div>
  );
};

export default ServicesPage;
