import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useConges, useCreateConge, useUpdateConge, useDeleteConge } from '../../hooks/useRH';
import { useEmployes } from '../../hooks/useRH';
import { Search, Plus, CheckCircle, XCircle, Trash2, Calendar, X, Clock, Filter } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { TypeConge, StatutConge } from '../../types/rh';

export const DemandesAbsencePage: React.FC = () => {
  const history = useHistory();
  const { data: conges = [], isLoading, refetch } = useConges();
  const { data: employes = [] } = useEmployes();
  const createMutation = useCreateConge();
  const updateMutation = useUpdateConge();
  const deleteMutation = useDeleteConge();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    employe_id: '',
    type: 'conge_paye' as TypeConge,
    date_debut: new Date().toISOString().split('T')[0],
    date_fin: new Date().toISOString().split('T')[0],
    motif: '',
  });

  // Filtrer
  const filtered = conges.filter(c => {
    const nom = c.employe?.user?.nom || '';
    const matchNom = nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filtreStatut ? c.statut === filtreStatut : true;
    return matchNom && matchStatut;
  });

  // Stats
  const enAttente = conges.filter(c => c.statut === 'en_attente').length;
  const approuves = conges.filter(c => c.statut === 'approuve').length;
  const refuses = conges.filter(c => c.statut === 'refuse').length;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      success('Demande d\'absence créée ✅');
      setShowForm(false);
      setForm({ employe_id: '', type: 'conge_paye', date_debut: new Date().toISOString().split('T')[0], date_fin: new Date().toISOString().split('T')[0], motif: '' });
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleApprouver = async (id: string) => {
    await updateMutation.mutateAsync({ id, statut: 'approuve' });
    refetch();
    success('Demande approuvée ✅');
  };

  const handleRefuser = async (id: string) => {
    await updateMutation.mutateAsync({ id, statut: 'refuse' });
    refetch();
    success('Demande refusée ❌');
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette demande ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const getTypeLabel = (type: string) => {
    const map: Record<string, string> = {
      conge_paye: 'Congé payé',
      maladie: 'Maladie',
      sans_solde: 'Sans solde',
      autre: 'Autre'
    };
    return map[type] || type;
  };

  const getStatutBadge = (statut: string) => {
    const config = {
      en_attente: { label: '⏳ En attente', color: 'bg-[var(--color-warning)]' },
      approuve: { label: '✅ Approuvé', color: 'bg-[var(--color-success)]' },
      refuse: { label: '❌ Refusé', color: 'bg-[var(--color-danger)]' },
    };
    const info = config[statut as keyof typeof config] || config.en_attente;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${info.color}`}>{info.label}</span>;
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Demandes d'absence</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des congés, maladies et absences</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => { setShowForm(true); }}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle demande
          </button>
        </div>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">En attente</p>
          <p className="text-2xl font-bold text-[var(--color-warning)]">{enAttente}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Approuvées</p>
          <p className="text-2xl font-bold text-[var(--color-success)]">{approuves}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Refusées</p>
          <p className="text-2xl font-bold text-[var(--color-danger)]">{refuses}</p>
        </MotionBox>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
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
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les statuts</option>
          <option value="en_attente">En attente</option>
          <option value="approuve">Approuvé</option>
          <option value="refuse">Refusé</option>
        </select>
      </div>

      {/* Liste */}
      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune demande d'absence trouvée.
        </MotionBox>
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
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {c.employe?.user?.nom} {c.employe?.user?.prenom}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{getTypeLabel(c.type)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{new Date(c.date_debut).toLocaleDateString()}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                      {new Date(c.date_fin).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-center">{getStatutBadge(c.statut)}</td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {c.statut === 'en_attente' && (
                          <>
                            <button
                              onClick={() => handleApprouver(c.id)}
                              className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                              title="Approuver"
                            >
                              <CheckCircle size={16} />
                            </button>
                            <button
                              onClick={() => handleRefuser(c.id)}
                              className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                              title="Refuser"
                            >
                              <XCircle size={16} />
                            </button>
                          </>
                        )}
                        <button
                          onClick={() => handleDelete(c.id)}
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

      {/* Modal de création */}
      {showForm && (
        <MotionBox
          as="div"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            type="card"
            variant="xlarge"
            className="w-full max-w-md p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">
                Nouvelle demande d'absence
              </h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Employé *</label>
                <select
                  value={form.employe_id}
                  onChange={(e) => setForm({ ...form, employe_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner un employé</option>
                  {employes.map((e: any) => (
                    <option key={e.id} value={e.id}>
                      {e.user?.nom} {e.user?.prenom} - {e.poste}
                    </option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type d'absence *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TypeConge })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="course">🏃 Course</option>
                  <option value="maladie">🏥 Maladie</option>
                  <option value="fatigue">😴 Fatigue</option>
                  <option value="evenement">🎉 Événement</option>
                  <option value="autre">📄 Autre</option>
                  <option value="maladie">Maladie</option>
                  <option value="sans_solde">Sans solde</option>
                  <option value="autre">Autre</option>
                </select>
              </div>
              <div className="grid grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date début *</label>
                  <input
                    type="date"
                    value={form.date_debut}
                    onChange={(e) => setForm({ ...form, date_debut: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date fin *</label>
                  <input
                    type="date"
                    value={form.date_fin}
                    onChange={(e) => setForm({ ...form, date_fin: e.target.value })}
                    required
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Motif (optionnel)</label>
                <textarea
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  rows={2}
                  placeholder="Précisez le motif..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
                >
                  Envoyer la demande
                </button>
              </div>
            </form>
          </MotionBox>
        </MotionBox>
      )}
    </div>
  );
};

export default DemandesAbsencePage;
