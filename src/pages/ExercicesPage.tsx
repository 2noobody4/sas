import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useExercices, useCreateExercice, useCloturerExercice } from '../hooks/useComptabilite';
import { ExerciceFormData } from '../types/comptabilite';
import { Plus, Calendar, Lock, Unlock, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const emptyForm: ExerciceFormData = { nom: '', date_debut: '', date_fin: '' };

export const ExercicesPage: React.FC = () => {
  const { data: exercices = [], isLoading, refetch } = useExercices();
  const createMutation = useCreateExercice();
  const cloturerMutation = useCloturerExercice();
  const { error: toastError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState<ExerciceFormData>(emptyForm);

  const formatDate = (d: string) => {
    if (!d) return '—';
    return new Date(d).toLocaleDateString('fr-FR');
  };

  const handleChange = (field: keyof ExerciceFormData, value: string) => {
    setForm((prev) => ({ ...prev, [field]: value }));
  };

  const handleCreate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim() || !form.date_debut || !form.date_fin) {
      toastError('Nom, date de début et date de fin sont obligatoires');
      return;
    }
    if (new Date(form.date_fin) <= new Date(form.date_debut)) {
      toastError('La date de fin doit être postérieure à la date de début');
      return;
    }
    await createMutation.mutateAsync(form);
    setForm(emptyForm);
    setShowForm(false);
    refetch();
  };

  const handleCloturer = async (id: string, nom: string) => {
    if (
      window.confirm(
        `Clôturer l'exercice "${nom}" ? Cette action calcule le résultat définitif et empêche toute nouvelle écriture sur cette période. Elle est irréversible.`
      )
    ) {
      await cloturerMutation.mutateAsync(id);
      refetch();
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Calendar size={26} /> Exercices comptables
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Créez un exercice et clôturez-le en fin de période pour figer les écritures.
          </p>
        </div>
        <button
          onClick={() => setShowForm((v) => !v)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          {showForm ? <X size={18} /> : <Plus size={18} />}
          {showForm ? 'Annuler' : 'Nouvel exercice'}
        </button>
      </div>

      {showForm && (
        <MotionBox type="card" variant="default" className="p-5 mb-6">
          <form onSubmit={handleCreate} className="grid grid-cols-1 sm:grid-cols-3 gap-4 items-end">
            <div className="sm:col-span-1">
              <label className="block text-sm font-medium text-[var(--color-textSecondary)] mb-1">
                Nom de l'exercice
              </label>
              <input
                type="text"
                value={form.nom}
                onChange={(e) => handleChange('nom', e.target.value)}
                placeholder="Exercice 2026"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textSecondary)] mb-1">
                Date de début
              </label>
              <input
                type="date"
                value={form.date_debut}
                onChange={(e) => handleChange('date_debut', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textSecondary)] mb-1">
                Date de fin
              </label>
              <input
                type="date"
                value={form.date_fin}
                onChange={(e) => handleChange('date_fin', e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div className="sm:col-span-3 flex justify-end">
              <button
                type="submit"
                disabled={createMutation.isLoading}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white disabled:opacity-60"
              >
                {createMutation.isLoading ? 'Création...' : "Créer l'exercice"}
              </button>
            </div>
          </form>
        </MotionBox>
      )}

      {exercices.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <div className="text-4xl mb-4">📅</div>
          <p className="text-lg">Aucun exercice comptable</p>
          <p className="text-sm">Créez le premier exercice pour pouvoir clôturer une période.</p>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Période</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {exercices.map((ex) => (
                  <tr key={ex.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">{ex.nom}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {formatDate(ex.date_debut)} → {formatDate(ex.date_fin)}
                    </td>
                    <td className="px-4 py-3 text-sm">
                      {ex.cloture ? (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-gray-500">
                          <Lock size={12} /> Clôturé
                        </span>
                      ) : (
                        <span className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white bg-[#2F9E44]">
                          <Unlock size={12} /> Ouvert
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      {!ex.cloture && (
                        <button
                          onClick={() => handleCloturer(ex.id, ex.nom)}
                          disabled={cloturerMutation.isLoading}
                          className="px-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] text-sm text-[var(--color-textPrimary)] hover:bg-[var(--color-secondary)] transition disabled:opacity-60 inline-flex items-center gap-1"
                        >
                          <Lock size={14} /> Clôturer
                        </button>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default ExercicesPage;
