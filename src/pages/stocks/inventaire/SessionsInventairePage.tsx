import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { Modal } from '../../../components/ui/Modal';
import { useSessionsInventaire, useCreateSessionInventaire, useCloseSessionInventaire, useDeleteSessionInventaire } from '../../../hooks/useInventaire';
import { Plus, X, Eye, Trash2, CheckCircle, AlertTriangle, Calendar, Package, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

export const SessionsInventairePage: React.FC = () => {
  const history = useHistory();
  const { data: sessions = [], isLoading, refetch } = useSessionsInventaire();
  const createMutation = useCreateSessionInventaire();
  const closeMutation = useCloseSessionInventaire();
  const deleteMutation = useDeleteSessionInventaire();
  const { success, error: toastError } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [nomSession, setNomSession] = useState('');
  const [showCloseModal, setShowCloseModal] = useState<{ id: string; nom: string } | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string; nom: string } | null>(null);

  const handleCreate = async () => {
    try {
      await createMutation.mutateAsync({ nom: nomSession || undefined });
      setShowCreateModal(false);
      setNomSession('');
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleClose = async () => {
    if (!showCloseModal) return;
    try {
      await closeMutation.mutateAsync(showCloseModal.id);
      setShowCloseModal(null);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await deleteMutation.mutateAsync(showDeleteModal.id);
      setShowDeleteModal(null);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const getStatutBadge = (statut: string) => {
    const config: Record<string, { label: string; color: string; icon: any }> = {
      ouverte: { label: 'Ouverte', color: 'bg-[var(--color-success)]', icon: CheckCircle },
      en_cours: { label: 'En cours', color: 'bg-[var(--color-warning)]', icon: AlertTriangle },
      validee: { label: 'Validée', color: 'bg-[var(--color-info)]', icon: CheckCircle },
      annulee: { label: 'Annulée', color: 'bg-[var(--color-danger)]', icon: X },
    };
    const info = config[statut] || config.ouverte;
    const Icon = info.icon;
    return (
      <span className={`inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white ${info.color}`}>
        <Icon size={12} /> {info.label}
      </span>
    );
  };

  const createModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowCreateModal(false)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={handleCreate}
        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2"
      >
        <Plus size={16} /> Créer
      </button>
    </div>
  );

  const closeModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowCloseModal(null)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={handleClose}
        className="px-4 py-2 rounded-xl bg-[var(--color-success)] text-white hover:bg-[var(--color-success-dark)] transition flex items-center gap-2"
      >
        <CheckCircle size={16} /> Valider
      </button>
    </div>
  );

  const deleteModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowDeleteModal(null)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="button"
        onClick={handleDelete}
        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
      >
        <Trash2 size={16} /> Supprimer
      </button>
    </div>
  );

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  const sessionsOuvertes = sessions.filter(s => s.statut === 'ouverte' || s.statut === 'en_cours');
  const sessionsValidees = sessions.filter(s => s.statut === 'validee');

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Package size={28} className="text-[var(--color-primary)]" />
            Sessions d'inventaire
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            {sessions.length} sessions · {sessionsOuvertes.length} en cours · {sessionsValidees.length} validées
          </p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
        >
          <Plus size={18} /> Nouvelle session
        </button>
      </div>

      {sessions.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-12 text-center text-[var(--color-textSecondary)]">
          <Package size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg">Aucune session d'inventaire</p>
          <p className="text-sm">Créez une session pour commencer un inventaire.</p>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Fin</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {s.nom || 'Sans nom'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(s.date_debut).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {s.date_fin ? new Date(s.date_fin).toLocaleDateString() : '-'}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {getStatutBadge(s.statut)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {s.statut === 'ouverte' || s.statut === 'en_cours' ? (
                          <button
                            onClick={() => history.push(`/gestion/stocks/inventaire/controle/${s.id}`)}
                            className="p-1.5 rounded hover:bg-blue-50 text-[var(--color-primary)]"
                            title="Contrôler"
                          >
                            <Package size={16} />
                          </button>
                        ) : (
                          <button
                            onClick={() => history.push(`/gestion/stocks/inventaire/rapport/${s.id}`)}
                            className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                            title="Voir le rapport"
                          >
                            <Eye size={16} />
                          </button>
                        )}
                        {(s.statut === 'ouverte' || s.statut === 'en_cours') && (
                          <button
                            onClick={() => setShowCloseModal({ id: s.id, nom: s.nom || 'Sans nom' })}
                            className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                            title="Valider"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteModal({ id: s.id, nom: s.nom || 'Sans nom' })}
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
        </MotionBox>
      )}

      {/* Modal Création */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Nouvelle session d'inventaire"
        subtitle="Créez une session pour commencer le comptage"
        icon={<Package size={24} />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={createModalFooter}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Nom de la session</label>
            <input
              type="text"
              value={nomSession}
              onChange={(e) => setNomSession(e.target.value)}
              placeholder="Inventaire du 25/08/2025"
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            />
            <p className="text-xs text-gray-400 mt-1">Optionnel. Laissez vide pour un nom automatique.</p>
          </div>
        </div>
      </Modal>

      {/* Modal Fermeture */}
      <Modal
        isOpen={!!showCloseModal}
        onClose={() => setShowCloseModal(null)}
        title="Valider la session"
        subtitle={`Fermer la session "${showCloseModal?.nom}" ?`}
        icon={<CheckCircle size={24} className="text-[var(--color-success)]" />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={closeModalFooter}
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Tous les produits non contrôlés seront considérés comme non comptés.
          </p>
          <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Une fois validée, vous ne pourrez plus modifier les quantités.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal Suppression */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="Confirmation de suppression"
        subtitle={`Supprimer la session "${showDeleteModal?.nom}" ?`}
        icon={<AlertTriangle size={24} className="text-red-500" />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={deleteModalFooter}
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Êtes-vous sûr de vouloir supprimer définitivement cette session ?
          </p>
          <div className="p-3 rounded-xl bg-red-50 border border-red-200">
            <p className="text-sm text-red-600">
              ⚠️ Cette action est irréversible. Toutes les données seront supprimées.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsInventairePage;
