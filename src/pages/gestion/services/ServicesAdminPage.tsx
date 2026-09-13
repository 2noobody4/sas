// ============================================================
// SERVICES ADMIN PAGE - Liste des services
// Version V3 - Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { useServices, useDeleteService } from '../../../hooks/useServices';
import { Search, Plus, Edit, Trash2, Eye, Tag, X, CheckCircle, XCircle, Briefcase, RefreshCw } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export const ServicesAdminPage: React.FC = () => {
  const history = useHistory();
  const { data: services = [], isLoading, refetch } = useServices();
  const deleteMutation = useDeleteService();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreDisponible, setFiltreDisponible] = useState('');

  const filtered = services.filter(s => {
    const matchSearch = s.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        s.descriptif?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchDisponible = filtreDisponible ? s.disponible === (filtreDisponible === 'true') : true;
    return matchSearch && matchDisponible;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer définitivement ce service ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Briefcase size={28} className="text-[var(--color-primary)]" />
            Services
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des services et prestations</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => history.push('/gestion/services/attributs')}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <Tag size={18} /> Attributs
          </button>
          <button
            onClick={() => history.push('/gestion/services/nouveau')}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Ajouter un service
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
          value={filtreDisponible}
          onChange={(e) => setFiltreDisponible(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous</option>
          <option value="true">Disponible</option>
          <option value="false">Indisponible</option>
        </select>
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
          <p className="text-sm">Créez votre premier service en cliquant sur "Ajouter un service".</p>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Service</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Descriptif</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Prix</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Disponible</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Attributs</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((service) => (
                  <tr key={service.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">{service.nom}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                      {service.descriptif?.substring(0, 60)}{service.descriptif?.length > 60 ? '...' : ''}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {service.prix.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      {service.disponible ? (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-[var(--color-success)]">
                          <CheckCircle size={12} /> Disponible
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white bg-[var(--color-danger)]">
                          <XCircle size={12} /> Indisponible
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                        {service.informations_requises?.length || 0}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/services/${service.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Voir"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => history.push(`/gestion/services/${service.id}/edit`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Modifier"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(service.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                          title="Supprimer"
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
          <div className="px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)] flex justify-between">
            <span>{filtered.length} service{filtered.length > 1 ? 's' : ''} affiché{filtered.length > 1 ? 's' : ''}</span>
            <button onClick={() => refetch()} className="text-[var(--color-primary)] hover:underline flex items-center gap-1">
              <RefreshCw size={14} /> Actualiser
            </button>
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default ServicesAdminPage;
