import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { Modal } from '../../components/ui/Modal';
import { useSessions, useCreateSession, useCloseSession, useDeleteSession } from '../../hooks/useSessions';
import { SessionStatusBadge } from '../../components/caisse/SessionStatusBadge';
import { Plus, X, Eye, Trash2, CheckCircle, ShoppingCart, AlertTriangle, Coins, TrendingUp, TrendingDown } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const SessionsPage: React.FC = () => {
  const history = useHistory();
  const { data: sessions = [], isLoading, refetch } = useSessions();
  const createMutation = useCreateSession();
  const closeMutation = useCloseSession();
  const deleteMutation = useDeleteSession();
  const { success, error: toastError } = useToast();

  const [showCreateModal, setShowCreateModal] = useState(false);
  const [fondOuverture, setFondOuverture] = useState<number>(0);
  const [showCloseModal, setShowCloseModal] = useState<{ id: string; fondOuverture: number } | null>(null);
  const [fondFermeture, setFondFermeture] = useState<number>(0);
  const [showDeleteModal, setShowDeleteModal] = useState<{ id: string } | null>(null);

  const handleOpenSession = async () => {
    if (fondOuverture < 0) {
      toastError('Le fond de caisse doit être positif');
      return;
    }
    try {
      await createMutation.mutateAsync({ fond_ouverture: fondOuverture });
      setShowCreateModal(false);
      setFondOuverture(0);
      refetch();
    } catch (err) {}
  };

  const handleCloseSession = async () => {
    if (!showCloseModal) return;
    if (fondFermeture < 0) {
      toastError('Le fond de fermeture doit être positif');
      return;
    }
    try {
      await closeMutation.mutateAsync({ id: showCloseModal.id, fond_fermeture: fondFermeture });
      setShowCloseModal(null);
      setFondFermeture(0);
      refetch();
    } catch (err) {}
  };

  const handleDelete = async () => {
    if (!showDeleteModal) return;
    try {
      await deleteMutation.mutateAsync(showDeleteModal.id);
      setShowDeleteModal(null);
      refetch();
    } catch (err) {}
  };

  const handleStartSelling = (sessionId: string) => {
    history.push('/gestion/caisse/ventes/nouvelle');
  };

  const getEcartDisplay = (ecart: number | null | undefined) => {
    if (ecart === null || ecart === undefined) return '-';
    const isPositive = ecart >= 0;
    return (
      <span className={`flex items-center gap-1 font-medium ${isPositive ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
        {isPositive ? <TrendingUp size={14} /> : <TrendingDown size={14} />}
        {ecart.toLocaleString()} FCFA
      </span>
    );
  };

  // Footer pour la création
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
        onClick={handleOpenSession}
        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2"
      >
        <Plus size={16} /> Ouvrir
      </button>
    </div>
  );

  // Footer pour la fermeture
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
        onClick={handleCloseSession}
        className="px-4 py-2 rounded-xl bg-[var(--color-success)] text-white hover:bg-[var(--color-success-dark)] transition flex items-center gap-2"
      >
        <CheckCircle size={16} /> Fermer
      </button>
    </div>
  );

  // Footer pour la suppression
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

  // Calculer les statistiques des sessions fermées
  const sessionsFermees = sessions.filter(s => s.statut === 'fermee');
  const ecartTotal = sessionsFermees.reduce((acc, s) => acc + (s.ecart || 0), 0);
  const nbSessionsFermees = sessionsFermees.length;
  const nbSessionsOuvertes = sessions.filter(s => s.statut === 'ouverte').length;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🗂️ Sessions de caisse</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gérez les sessions ouvertes et fermées</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Ouvrir une session
        </button>
      </div>

      {/* Statistiques des sessions fermées */}
      {nbSessionsFermees > 0 && (
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
          <MotionBox type="card" variant="default" className="p-4 text-center">
            <p className="text-sm text-[var(--color-textSecondary)]">Sessions fermées</p>
            <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{nbSessionsFermees}</p>
          </MotionBox>
          <MotionBox type="card" variant="default" className="p-4 text-center">
            <p className="text-sm text-[var(--color-textSecondary)]">Écart total</p>
            <p className={`text-2xl font-bold ${ecartTotal >= 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]'}`}>
              {ecartTotal.toLocaleString()} FCFA
            </p>
          </MotionBox>
          <MotionBox type="card" variant="default" className="p-4 text-center">
            <p className="text-sm text-[var(--color-textSecondary)]">Sessions ouvertes</p>
            <p className="text-2xl font-bold text-[var(--color-warning)]">{nbSessionsOuvertes}</p>
          </MotionBox>
        </div>
      )}

      {sessions.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune session. Ouvrez une session pour commencer.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Fond</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Écart</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((session) => (
                  <tr key={session.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(session.date_ouverture).toLocaleString()}
                    </td>
                    <td className="px-4 py-3">
                      <SessionStatusBadge statut={session.statut} />
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {session.fond_ouverture.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-right">
                      {getEcartDisplay(session.ecart)}
                    </td>
                    <td className="px-4 py-3 text-right">
                      <div className="flex justify-end gap-1">
                        {session.statut === 'ouverte' && (
                          <button
                            onClick={() => handleStartSelling(session.id)}
                            className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                            title="Commencer à vendre"
                          >
                            <ShoppingCart size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => history.push(`/gestion/caisse/sessions/${session.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Eye size={18} />
                        </button>
                        {session.statut === 'ouverte' && (
                          <button
                            onClick={() => {
                              setShowCloseModal({ id: session.id, fondOuverture: session.fond_ouverture });
                              setFondFermeture(session.fond_ouverture);
                            }}
                            className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                          >
                            <CheckCircle size={18} />
                          </button>
                        )}
                        <button
                          onClick={() => setShowDeleteModal({ id: session.id })}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                        >
                          <Trash2 size={18} />
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

      {/* Modal d'ouverture */}
      <Modal
        isOpen={showCreateModal}
        onClose={() => setShowCreateModal(false)}
        title="Ouvrir une session"
        subtitle="Saisissez le fond de caisse initial"
        icon={<Coins size={24} />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={createModalFooter}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fond de caisse (FCFA)</label>
            <input
              type="number"
              value={fondOuverture}
              onChange={(e) => setFondOuverture(parseFloat(e.target.value) || 0)}
              min={0}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">Montant initial dans la caisse</p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700">
              ℹ️ Une session ouverte permet d'enregistrer des ventes.
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de fermeture */}
      <Modal
        isOpen={!!showCloseModal}
        onClose={() => setShowCloseModal(null)}
        title="Fermer la session"
        subtitle={`Fond d'ouverture : ${showCloseModal?.fondOuverture.toLocaleString() || 0} FCFA`}
        icon={<CheckCircle size={24} className="text-[var(--color-success)]" />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={closeModalFooter}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Fond de fermeture (FCFA)</label>
            <input
              type="number"
              value={fondFermeture}
              onChange={(e) => setFondFermeture(parseFloat(e.target.value) || 0)}
              min={0}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              placeholder="0"
            />
            <p className="text-xs text-gray-400 mt-1">Montant final dans la caisse</p>
          </div>
          <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ La session sera fermée et vous ne pourrez plus enregistrer de ventes.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <p className="text-sm text-blue-700">
              ℹ️ L'écart sera calculé automatiquement : <strong>Fond fermeture - Fond ouverture</strong>
            </p>
          </div>
        </div>
      </Modal>

      {/* Modal de suppression */}
      <Modal
        isOpen={!!showDeleteModal}
        onClose={() => setShowDeleteModal(null)}
        title="Confirmation de suppression"
        subtitle="Supprimer cette session ?"
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
              ⚠️ Cette action est irréversible. Toutes les données associées seront supprimées.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default SessionsPage;
