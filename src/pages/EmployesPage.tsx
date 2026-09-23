import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { Modal } from '../components/Modal';
import { useEmployes, useDeleteEmploye } from '../hooks/useRH';
import { Search, Plus, Edit, Trash2, Eye, Users, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const EmployesPage: React.FC = () => {
  const history = useHistory();
  const { data: employes = [], isLoading, refetch } = useEmployes();
  const deleteMutation = useDeleteEmploye();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [deleteModalOpen, setDeleteModalOpen] = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState<string | null>(null);
  const [selectedEmployeName, setSelectedEmployeName] = useState<string>('');

  const filtered = employes.filter(e => {
    const nom = `${e.user?.prenom || ''} ${e.user?.nom || ''}`.toLowerCase();
    return nom.includes(searchTerm.toLowerCase()) || e.poste.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleDeleteClick = (id: string, name: string) => {
    setSelectedEmployeId(id);
    setSelectedEmployeName(name);
    setDeleteModalOpen(true);
  };

  const handleConfirmDelete = async () => {
    if (!selectedEmployeId) return;
    try {
      await deleteMutation.mutateAsync(selectedEmployeId);
      refetch();
      success('Employé supprimé ✅');
      setDeleteModalOpen(false);
      setSelectedEmployeId(null);
      setSelectedEmployeName('');
    } catch (err: any) {
      toastError(err.message);
    }
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
        <Trash2 size={16} /> Supprimer
      </button>
    </div>
  );

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">👥 Employés</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des employés</p>
        </div>
        <button
          onClick={() => history.push('/gestion/rh/employes/nouveau')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouvel employé
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun employé trouvé.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Poste</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Salaire</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((e) => (
                  <tr key={e.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {e.user?.prenom} {e.user?.nom}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{e.poste}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {e.salaire_base.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        e.statut === 'actif' ? 'bg-[var(--color-success)]' :
                        e.statut === 'conge' ? 'bg-[var(--color-warning)]' :
                        'bg-[var(--color-danger)]'
                      }`}>
                        {e.statut}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/rh/employes/${e.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDeleteClick(e.id, `${e.user?.prenom} ${e.user?.nom}`)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
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
        </MotionBox>
      )}

      {/* Modal de confirmation de suppression */}
      <Modal
        isOpen={deleteModalOpen}
        onClose={() => setDeleteModalOpen(false)}
        title="Confirmation de suppression"
        subtitle={`Supprimer l'employé "${selectedEmployeName}" ?`}
        icon={<AlertTriangle size={24} className="text-red-500" />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={deleteModalFooter}
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer définitivement cet employé ?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">
              ⚠️ Cette action est irréversible. Toutes les données associées à cet employé seront supprimées.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Employé :</span> {selectedEmployeName}
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default EmployesPage;
