import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { Modal } from '../../components/ui/Modal';
import { useClients, useDeleteClient, useRestoreClient } from '../../hooks/useClients';
import { NiveauFidelite } from '../../types/clients';
import { Search, Plus, Edit, Trash2, Eye, RotateCw, Filter, X, AlertTriangle } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const ClientsPage: React.FC = () => {
  const history = useHistory();
  const { data: clients = [], isLoading, refetch } = useClients();
  const deleteMutation = useDeleteClient();
  const restoreMutation = useRestoreClient();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreSegment, setFiltreSegment] = useState('');
  const [filtreNiveau, setFiltreNiveau] = useState('');
  const [showInactifs, setShowInactifs] = useState(false);
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedClientId, setSelectedClientId] = useState<string | null>(null);
  const [selectedClientName, setSelectedClientName] = useState<string>('');

  const filtered = clients.filter(c => {
    const nom = `${c.nom} ${c.prenom || ''}`.toLowerCase();
    const matchSearch = nom.includes(searchTerm.toLowerCase()) || c.email?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchSegment = filtreSegment ? c.segment === filtreSegment : true;
    const matchNiveau = filtreNiveau ? c.niveau_fidelite === filtreNiveau : true;
    const matchActif = showInactifs ? true : c.actif;
    return matchSearch && matchSegment && matchNiveau && matchActif;
  });

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedClientId(id);
    setSelectedClientName(name);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedClientId) return;
    try {
      await deleteMutation.mutateAsync(selectedClientId);
      refetch();
      success('Client désactivé ✅');
      setDeleteModalOpen(false);
      setSelectedClientId(null);
      setSelectedClientName('');
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleRestore = async (id: string) => {
    await restoreMutation.mutateAsync(id);
    refetch();
  };

  const deleteModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setDeleteModalOpen(false)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={handleConfirmDelete}
        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
      >
        <Trash2 size={16} /> Désactiver
      </button>
    </div>
  );

  const getNiveauColor = (niveau: NiveauFidelite) => {
    const colors: Record<NiveauFidelite, string> = {
      bronze: 'bg-amber-700',
      argent: 'bg-gray-400',
      or: 'bg-yellow-500',
      platine: 'bg-blue-400',
      diamant: 'bg-purple-600',
    };
    return colors[niveau] || 'bg-gray-400';
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">👥 Clients</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion complète des clients</p>
        </div>
        <button
          onClick={() => history.push('/gestion/clients/nouveau')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau client
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <select
          value={filtreSegment}
          onChange={(e) => setFiltreSegment(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous segments</option>
          <option value="A">Segment A (VIP)</option>
          <option value="B">Segment B</option>
          <option value="C">Segment C</option>
          <option value="D">Segment D</option>
        </select>
        <select
          value={filtreNiveau}
          onChange={(e) => setFiltreNiveau(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous niveaux</option>
          <option value="bronze">Bronze</option>
          <option value="argent">Argent</option>
          <option value="or">Or</option>
          <option value="platine">Platine</option>
          <option value="diamant">Diamant</option>
        </select>
        <button
          onClick={() => setShowInactifs(!showInactifs)}
          className={`px-3 py-2 rounded-xl border text-sm transition ${
            showInactifs ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]' : 'border-[var(--color-borderColor)] text-[var(--color-textPrimary)] hover:bg-[var(--color-secondary)]'
          }`}
        >
          {showInactifs ? 'Voir actifs' : 'Voir inactifs'}
        </button>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun client trouvé.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Email</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">Téléphone</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Segment</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Niveau</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Points</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className={`border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition ${!c.actif ? 'opacity-50' : ''}`}>
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {c.nom} {c.prenom || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">{c.email || '-'}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden lg:table-cell">{c.telephone || '-'}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        c.segment === 'A' ? 'bg-[var(--color-primary)]' :
                        c.segment === 'B' ? 'bg-[var(--color-success)]' :
                        c.segment === 'C' ? 'bg-[var(--color-warning)]' :
                        'bg-[var(--color-secondary)]'
                      }`}>
                        {c.segment}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${getNiveauColor(c.niveau_fidelite)}`}>
                        {c.niveau_fidelite}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center font-medium text-[var(--color-textPrimary)]">{c.points_fidelite}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/clients/${c.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => history.push(`/gestion/clients/${c.id}/edit`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Edit size={16} />
                        </button>
                        {!c.actif ? (
                          <button
                            onClick={() => handleRestore(c.id)}
                            className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                          >
                            <RotateCw size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleDeleteClick(c.id, `${c.nom} ${c.prenom || ''}`)}
                            className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        )}
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmation de désactivation"
        subtitle={`Désactiver le client "${selectedClientName}" ?`}
        icon={<AlertTriangle size={24} className="text-red-500" />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={deleteModalFooter}
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir désactiver ce client ?
          </p>
          <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Le client ne pourra plus effectuer de commandes ni utiliser ses points de fidélité.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Client :</span> {selectedClientName}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default ClientsPage;
