import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { Modal } from '../components/Modal';
import { useConges, useCreateConge, useUpdateConge, useDeleteConge } from '../hooks/useRH';
import { useEmployes } from '../hooks/useRH';
import { Search, Plus, CheckCircle, XCircle, Trash2, Calendar, X, User, Clock } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { TypeConge, StatutConge } from '../types/rh';

export const CongesPage: React.FC = () => {
  const history = useHistory();
  const { data: conges = [], isLoading, refetch } = useConges();
  const { data: employes = [] } = useEmployes();
  const createMutation = useCreateConge();
  const updateMutation = useUpdateConge();
  const deleteMutation = useDeleteConge();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employe_id: '',
    type: 'conge_paye' as TypeConge,
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
  });

  const filtered = conges.filter(c => {
    const nom = c.employe?.user?.nom || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      success('Demande de congé créée ✅');
      setShowForm(false);
      setForm({ employe_id: '', type: 'conge_paye', date_debut: new Date().toISOString().split('T')[0], date_fin: new Date().toISOString().split('T')[0] });
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleApprouver = async (id: string) => {
    await updateMutation.mutateAsync({ id, statut: 'approuve' });
    refetch();
  };

  const handleRefuser = async (id: string) => {
    await updateMutation.mutateAsync({ id, statut: 'refuse' });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette demande ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = { conge_paye: 'Congé payé', maladie: 'Maladie', sans_solde: 'Sans solde', autre: 'Autre' };
    return map[type] || type;
  };

  // Footer de la modal
  const modalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowForm(false)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="submit"
        form="conge-form"
        className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition"
      >
        Envoyer la demande
      </button>
    </div>
  );

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📅 Congés</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des congés et absences</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2">
          <Plus size={18} /> Nouvelle demande
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input type="text" placeholder="Rechercher un employé..." value={searchTerm} onChange={(e) => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]" />
        </div>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">Aucune demande de congé.</MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Employé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Début</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Fin</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c) => (
                  <tr key={c.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">{c.employe?.user?.nom} {c.employe?.user?.prenom}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{getTypeLabel(c.type)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{new Date(c.date_debut).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">{new Date(c.date_fin).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${c.statut === 'approuve' ? 'bg-[var(--color-success)]' : c.statut === 'refuse' ? 'bg-[var(--color-danger)]' : 'bg-[var(--color-warning)]'}`}>
                        {c.statut === 'approuve' ? '✅ Approuvé' : c.statut === 'refuse' ? '❌ Refusé' : '⏳ En attente'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {c.statut === 'en_attente' && (
                          <>
                            <button onClick={() => handleApprouver(c.id)} className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"><CheckCircle size={16} /></button>
                            <button onClick={() => handleRefuser(c.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"><XCircle size={16} /></button>
                          </>
                        )}
                        <button onClick={() => handleDelete(c.id)} className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"><Trash2 size={16} /></button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}

      {/* Modal avec le composant Modal réutilisable */}
      <Modal
        isOpen={showForm}
        onClose={() => setShowForm(false)}
        title="Nouvelle demande de congé"
        subtitle="Saisissez les informations du congé"
        icon={<Calendar size={24} />}
        maxWidth="md"
        maxHeight="70vh"
        showFooter={true}
        footer={modalFooter}
      >
        <form id="conge-form" onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Employé *</label>
            <select
              value={form.employe_id}
              onChange={(e) => setForm({ ...form, employe_id: e.target.value })}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            >
              <option value="">Sélectionner</option>
              {employes.map((e: any) => (
                <option key={e.id} value={e.id}>{e.user?.nom} {e.user?.prenom} - {e.poste}</option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700">Type *</label>
            <select
              value={form.type}
              onChange={(e) => setForm({ ...form, type: e.target.value as TypeConge })}
              required
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            >
              <option value="conge_paye">🏖️ Congé payé</option>
              <option value="maladie">🏥 Maladie</option>
              <option value="sans_solde">💰 Sans solde</option>
              <option value="autre">📄 Autre</option>
            </select>
          </div>

          <div className="grid grid-cols-2 gap-3">
            <div>
              <label className="block text-sm font-medium text-gray-700">Début *</label>
              <input
                type="date"
                value={form.date_debut}
                onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700">Fin *</label>
              <input
                type="date"
                value={form.date_fin}
                onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                required
                className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
              />
            </div>
          </div>
        </form>
      </Modal>
    </div>
  );
};

export default CongesPage;
