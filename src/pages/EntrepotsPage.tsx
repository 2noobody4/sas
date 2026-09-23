import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useEntrepots, useDeleteEntrepot } from '../hooks/useEntrepots';
import { Search, Plus, Edit, Trash2, Building, MapPin, Phone, Mail, Layers, Archive } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const EntrepotsPage: React.FC = () => {
  const history = useHistory();
  const { data: entrepots = [], isLoading, refetch } = useEntrepots();
  const deleteMutation = useDeleteEntrepot();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = entrepots.filter(e =>
    e.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.adresse?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.responsable?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    e.salle?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer définitivement cet entrepôt ?')) {
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
            🏭 Entrepôts
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des entrepôts et de leur emplacement</p>
        </div>
        <button
          onClick={() => history.push('/gestion/entrepots/nouveau')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouvel entrepôt
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un entrepôt, salle, responsable..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun entrepôt trouvé.
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((e) => (
            <MotionBox
              key={e.id}
              type="card"
              variant="default"
              className="p-4 hover:shadow-lg transition"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <Building size={20} className="text-[var(--color-primary)]" />
                    <h3 className="font-semibold text-[var(--color-textPrimary)]">{e.nom}</h3>
                  </div>

                  {/* Emplacement */}
                  <div className="mt-2 space-y-1">
                    {(e.salle || e.etage || e.etagere || e.emplacement) && (
                      <div className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)]">
                        <Layers size={14} />
                        <span>
                          {e.salle && `Salle ${e.salle}`}
                          {e.etage && ` • Étage ${e.etage}`}
                          {e.etagere && ` • Étagère ${e.etagere}`}
                          {e.emplacement && ` • Emplacement ${e.emplacement}`}
                        </span>
                      </div>
                    )}
                    {e.adresse && (
                      <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                        <MapPin size={14} /> {e.adresse}
                      </p>
                    )}
                    {e.telephone && (
                      <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                        <Phone size={14} /> {e.telephone}
                      </p>
                    )}
                    {e.email && (
                      <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                        <Mail size={14} /> {e.email}
                      </p>
                    )}
                    {e.responsable && (
                      <p className="text-sm text-[var(--color-textSecondary)]">
                        Responsable : {e.responsable}
                      </p>
                    )}
                  </div>

                  <div className="mt-2 flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${
                      e.actif ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                      'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
                    }`}>
                      {e.actif ? 'Actif' : 'Inactif'}
                    </span>
                    {(e.salle || e.etage || e.etagere || e.emplacement) && (
                      <span className="px-2 py-0.5 rounded-full text-xs font-medium bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                        <Archive size={12} className="inline mr-1" /> Localisé
                      </span>
                    )}
                  </div>
                </div>
                <div className="flex gap-1">
                  <button
                    onClick={() => history.push(`/gestion/entrepots/${e.id}`)}
                    className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                  >
                    <Edit size={16} />
                  </button>
                  <button
                    onClick={() => handleDelete(e.id)}
                    className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                  >
                    <Trash2 size={16} />
                  </button>
                </div>
              </div>
            </MotionBox>
          ))}
        </div>
      )}
    </div>
  );
};

export default EntrepotsPage;
