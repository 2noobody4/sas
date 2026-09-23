// ============================================================
// SERVICES ADMIN PAGE — Liste + Modal + Toggle disponible
// Version V6 — Bouton toggle disponible/non disponible
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { ServiceFormModal } from '../components/ServiceFormModal';
import { useServices, useDeleteService, useToggleServiceDisponible } from '../hooks/useServices';
import { useCategoriesService } from '../hooks/useCategoriesService';
import {
  Search, Plus, Edit, Trash2, Eye, Tag, CheckCircle,
  XCircle, Briefcase, RefreshCw, ExternalLink,
  ChevronLeft, ChevronRight, Pause, Play,
} from 'lucide-react';

const PAGE_SIZE = 20;

export const ServicesAdminPage: React.FC = () => {
  const history = useHistory();
  const { data: services = [], isLoading, refetch } = useServices();
  const { data: categoriesService = [] } = useCategoriesService();
  const deleteMutation = useDeleteService();
  const toggleMutation = useToggleServiceDisponible();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreDisponible, setFiltreDisponible] = useState('');
  const [filtreCategorie, setFiltreCategorie] = useState('');
  const [page, setPage] = useState(1);
  const [showFormModal, setShowFormModal] = useState(false);
  const [editingServiceId, setEditingServiceId] = useState<string | undefined>(undefined);

  useEffect(() => {
    setPage(1);
  }, [searchTerm, filtreDisponible, filtreCategorie]);

  const filtered = useMemo(() => {
    return services.filter((s) => {
      const matchSearch =
        s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
        s.description?.toLowerCase().includes(searchTerm.toLowerCase());
      const matchDisponible = filtreDisponible
        ? s.disponible === (filtreDisponible === 'true')
        : true;
      const matchCategorie = filtreCategorie
        ? s.categorie_service_id === filtreCategorie
        : true;
      return matchSearch && matchDisponible && matchCategorie;
    });
  }, [services, searchTerm, filtreDisponible, filtreCategorie]);

  const totalPages = Math.max(1, Math.ceil(filtered.length / PAGE_SIZE));
  const currentPage = Math.min(page, totalPages);
  const paginated = useMemo(() => {
    const start = (currentPage - 1) * PAGE_SIZE;
    return filtered.slice(start, start + PAGE_SIZE);
  }, [filtered, currentPage]);

  const handleToggleDisponible = async (service: any) => {
    const newValue = !service.disponible;
    const msg = newValue
      ? `Activer le service "${service.nom}" ?\n\nIl sera de nouveau proposé aux clients.`
      : `Désactiver le service "${service.nom}" ?\n\nIl ne sera plus proposé aux clients, mais les demandes existantes resteront valides.`;

    if (!window.confirm(msg)) return;

    await toggleMutation.mutateAsync({
      id: service.id,
      disponible: newValue,
      nom: service.nom,
    });
  };

  const handleDelete = async (id: string, nom: string) => {
    if (window.confirm(`Supprimer définitivement le service "${nom}" ?\n\nCette action le désactive (soft delete). Les demandes existantes resteront liées.`)) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const handleNew = () => {
    setEditingServiceId(undefined);
    setShowFormModal(true);
  };

  const handleEdit = (id: string) => {
    setEditingServiceId(id);
    setShowFormModal(true);
  };

  const handleCloseModal = () => {
    setShowFormModal(false);
    setEditingServiceId(undefined);
  };

  const handleSuccess = () => {
    refetch();
  };

  const hasActiveFilters = !!(searchTerm || filtreDisponible || filtreCategorie);

  const nbDisponibles = services.filter((s) => s.disponible).length;
  const nbIndisponibles = services.length - nbDisponibles;

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Briefcase size={28} className="text-[var(--color-primary)]" />
            Services
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            {services.length} service{services.length > 1 ? 's' : ''} ·{' '}
            <span className="text-[var(--color-success)] font-medium">{nbDisponibles} actif{nbDisponibles > 1 ? 's' : ''}</span>
            {nbIndisponibles > 0 && (
              <>
                {' · '}
                <span className="text-[var(--color-textSecondary)]">{nbIndisponibles} inactif{nbIndisponibles > 1 ? 's' : ''}</span>
              </>
            )}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => history.push('/gestion/services/attributs')}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <Tag size={18} /> Attributs
          </button>
          <button
            onClick={handleNew}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
          >
            <Plus size={18} /> Nouveau service
          </button>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>

        <select
          value={filtreCategorie}
          onChange={(e) => setFiltreCategorie(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Toutes les catégories</option>
          {categoriesService.map((cat) => (
            <option key={cat.id} value={cat.id}>{cat.nom}</option>
          ))}
        </select>

        <select
          value={filtreDisponible}
          onChange={(e) => setFiltreDisponible(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous</option>
          <option value="true">Actifs</option>
          <option value="false">Inactifs</option>
        </select>

        {hasActiveFilters && (
          <button
            onClick={() => { setSearchTerm(''); setFiltreDisponible(''); setFiltreCategorie(''); }}
            className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-1"
          >
            <XCircle size={16} /> Réinitialiser
          </button>
        )}

        <button
          onClick={() => refetch()}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-1"
        >
          <RefreshCw size={16} /> Actualiser
        </button>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <Briefcase size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg">Aucun service trouvé</p>
          <p className="text-sm mb-4">
            {hasActiveFilters ? 'Essayez d\'ajuster vos filtres.' : 'Créez votre premier service.'}
          </p>
          {!hasActiveFilters && (
            <button
              onClick={handleNew}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white inline-flex items-center gap-2"
            >
              <Plus size={18} /> Créer un service
            </button>
          )}
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Mode</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Prix</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {paginated.map((service) => (
                  <tr
                    key={service.id}
                    className={`border-t border-[var(--color-borderColor)] transition ${
                      service.disponible ? 'hover:bg-[var(--color-secondary)]/50' : 'bg-[var(--color-secondary)]/30 opacity-70'
                    }`}
                  >
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {service.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                      {service.categorie_service?.nom || '-'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                      {service.mode_paiement === 'horaire' && '⏱️ Horaire'}
                      {service.mode_paiement === 'forfait' && '💰 Forfait'}
                      {service.mode_paiement === 'les_deux' && '💰⏱️ Les deux'}
                      {!service.mode_paiement && '💰 Forfait'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                      {(service.mode_paiement === 'forfait' || !service.mode_paiement) && service.prix > 0 && (
                        <span className="font-medium">{service.prix.toLocaleString()} FCFA</span>
                      )}
                      {service.mode_paiement === 'horaire' && (
                        <span className="font-medium">{(service.prix_horaire || 0).toLocaleString()} FCFA/h</span>
                      )}
                      {service.mode_paiement === 'les_deux' && (
                        <span className="font-medium text-xs">
                          {service.prix.toLocaleString()} FCFA · {(service.prix_horaire || 0).toLocaleString()} FCFA/h
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {/* ✅ Bouton toggle disponible inline */}
                      <button
                        onClick={() => handleToggleDisponible(service)}
                        disabled={toggleMutation.isLoading}
                        className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white transition ${
                          service.disponible
                            ? 'bg-[var(--color-success)] hover:bg-[var(--color-success)]/80'
                            : 'bg-[var(--color-textSecondary)] hover:bg-[var(--color-textSecondary)]/80'
                        } disabled:opacity-50`}
                        title={service.disponible ? 'Cliquer pour désactiver' : 'Cliquer pour activer'}
                      >
                        {service.disponible ? (
                          <>
                            <CheckCircle size={12} /> Actif
                          </>
                        ) : (
                          <>
                            <Pause size={12} /> Inactif
                          </>
                        )}
                      </button>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {service.disponible && (
                          <button
                            onClick={() => window.open(`/services/${service.id}`, '_blank')}
                            className="p-1.5 rounded hover:bg-blue-50 text-[var(--color-primary)]"
                            title="Voir en ligne (nouvel onglet)"
                          >
                            <ExternalLink size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => history.push(`/gestion/services/${service.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleEdit(service.id)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id, service.nom)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                          title="Supprimer (soft)"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {totalPages > 1 && (
            <div className="px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] flex items-center justify-between">
              <span className="text-sm text-[var(--color-textSecondary)]">
                {filtered.length} service{filtered.length > 1 ? 's' : ''} · Page {currentPage} / {totalPages}
              </span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setPage((p) => Math.max(1, p - 1))}
                  disabled={currentPage === 1}
                  className="p-1.5 rounded-lg border border-[var(--color-borderColor)] hover:bg-[var(--color-cardBg)] disabled:opacity-40 transition"
                >
                  <ChevronLeft size={16} />
                </button>
                {Array.from({ length: totalPages }, (_, i) => i + 1)
                  .filter((p) => {
                    if (totalPages <= 7) return true;
                    if (p === 1 || p === totalPages) return true;
                    return Math.abs(p - currentPage) <= 1;
                  })
                  .map((p, idx, arr) => {
                    const prev = arr[idx - 1];
                    const showEllipsis = prev !== undefined && p - prev > 1;
                    return (
                      <React.Fragment key={p}>
                        {showEllipsis && (
                          <span className="px-2 text-[var(--color-textSecondary)]">…</span>
                        )}
                        <button
                          onClick={() => setPage(p)}
                          className={`min-w-[32px] px-2 py-1 rounded-lg border text-sm transition ${
                            p === currentPage
                              ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                              : 'border-[var(--color-borderColor)] text-[var(--color-textPrimary)] hover:bg-[var(--color-cardBg)]'
                          }`}
                        >
                          {p}
                        </button>
                      </React.Fragment>
                    );
                  })}
                <button
                  onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                  disabled={currentPage === totalPages}
                  className="p-1.5 rounded-lg border border-[var(--color-borderColor)] hover:bg-[var(--color-cardBg)] disabled:opacity-40 transition"
                >
                  <ChevronRight size={16} />
                </button>
              </div>
            </div>
          )}

          {totalPages <= 1 && (
            <div className="px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)] flex justify-between">
              <span>
                {filtered.length} service{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}
                {services.length !== filtered.length && ` sur ${services.length}`}
              </span>
              <button onClick={() => refetch()} className="text-[var(--color-primary)] hover:underline flex items-center gap-1">
                <RefreshCw size={14} /> Actualiser
              </button>
            </div>
          )}
        </MotionBox>
      )}

      <ServiceFormModal
        isOpen={showFormModal}
        onClose={handleCloseModal}
        onSuccess={handleSuccess}
        serviceId={editingServiceId}
      />
    </div>
  );
};

export default ServicesAdminPage;
