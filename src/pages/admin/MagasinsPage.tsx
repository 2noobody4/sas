import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useMagasins, useDeleteMagasin } from '../../hooks/useMagasins';
import { useMagasinActif } from '../../contexts/MagasinActifContext';
import { Search, Plus, Edit, Trash2, Building, MapPin, Phone, Mail, Star, CheckCircle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const MagasinsPage: React.FC = () => {
  const history = useHistory();
  const { data: magasins = [], isLoading, refetch } = useMagasins();
  const deleteMutation = useDeleteMagasin();
  const { success, error: toastError } = useToast();
  const { magasinActif, setMagasinActif, loading: magasinActifLoading } = useMagasinActif();
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = magasins.filter(m =>
    m.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.code?.toLowerCase().includes(searchTerm.toLowerCase()) ||
    m.adresse?.toLowerCase().includes(searchTerm.toLowerCase())
  );

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer définitivement ce magasin ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const handleSetDefault = async (id: string) => {
    history.push(`/gestion/magasins/${id}`);
  };

  const handleSetActif = async (id: string) => {
    try {
      await setMagasinActif(id);
      success('Magasin actif sélectionné ✅');
    } catch (err: any) {
      toastError(err.message);
    }
  };

  if (isLoading || magasinActifLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            🏪 Magasins
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Gestion des magasins – Sélectionnez votre magasin actif
          </p>
        </div>
        <button
          onClick={() => history.push('/gestion/magasins/nouveau')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau magasin
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un magasin..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun magasin trouvé.
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
          {filtered.map((m) => {
            const isActif = magasinActif?.id === m.id;
            return (
              <MotionBox key={m.id} type="card" variant="default" className="p-4 hover:shadow-lg transition relative">
                {/* Badge principal */}
                {isActif ? (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-success)] text-white flex items-center gap-1">
                      <CheckCircle size={12} /> Actuellement sélectionné
                    </span>
                  </div>
                ) : m.est_defaut ? (
                  <div className="absolute top-3 right-3">
                    <span className="px-2 py-1 rounded-full text-xs font-medium bg-[var(--color-primary)] text-white flex items-center gap-1">
                      <Star size={12} /> Défaut
                    </span>
                  </div>
                ) : null}

                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <Building size={20} className="text-[var(--color-primary)]" />
                      <h3 className="font-semibold text-[var(--color-textPrimary)]">{m.nom}</h3>
                    </div>
                    {m.code && (
                      <p className="text-sm text-[var(--color-textSecondary)]">Code: {m.code}</p>
                    )}
                    {m.adresse && (
                      <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1 mt-1">
                        <MapPin size={14} /> {m.adresse}
                      </p>
                    )}
                    {m.telephone && (
                      <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                        <Phone size={14} /> {m.telephone}
                      </p>
                    )}
                    {m.email && (
                      <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                        <Mail size={14} /> {m.email}
                      </p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1 ml-2">
                    {!isActif && m.actif && (
                      <button
                        onClick={() => handleSetActif(m.id)}
                        className="px-2 py-1 text-xs rounded bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1"
                      >
                        <CheckCircle size={12} /> Sélectionner
                      </button>
                    )}
                    {!m.est_defaut && (
                      <button
                        onClick={() => handleSetDefault(m.id)}
                        className="px-2 py-1 text-xs rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-1"
                      >
                        <Star size={12} /> Défaut
                      </button>
                    )}
                    <button
                      onClick={() => history.push(`/gestion/magasins/${m.id}`)}
                      className="px-2 py-1 text-xs rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-1"
                    >
                      <Edit size={12} /> Modifier
                    </button>
                    <button
                      onClick={() => handleDelete(m.id)}
                      className="px-2 py-1 text-xs rounded border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-red-50 transition flex items-center gap-1"
                    >
                      <Trash2 size={12} /> Supprimer
                    </button>
                  </div>
                </div>
              </MotionBox>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MagasinsPage;
