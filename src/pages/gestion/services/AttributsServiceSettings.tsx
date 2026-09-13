// ============================================================
// ATTRIBUTS SERVICE SETTINGS - Gestion des attributs
// Version V3 - Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { useAttributsService, useCreateAttributService, useUpdateAttributService, useDeleteAttributService } from '../../../hooks/useAttributsService';
import { AttributService, AttributType } from '../../../types/attributsService';
import { Plus, Trash2, Edit, X, Check, ArrowLeft, Save, GripVertical } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';

const TYPES: { value: AttributType; label: string }[] = [
  { value: 'text', label: 'Texte court' },
  { value: 'email', label: 'Email' },
  { value: 'tel', label: 'Téléphone' },
  { value: 'textarea', label: 'Texte long' },
  { value: 'number', label: 'Nombre' },
  { value: 'date', label: 'Date' },
];

export const AttributsServiceSettings: React.FC = () => {
  const history = useHistory();
  const { data: attributs = [], isLoading, refetch } = useAttributsService();
  const createMutation = useCreateAttributService();
  const updateMutation = useUpdateAttributService();
  const deleteMutation = useDeleteAttributService();
  const { success, error: toastError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [editing, setEditing] = useState<AttributService | null>(null);
  const [form, setForm] = useState<{
    nom: string;
    type: AttributType;
    obligatoire: boolean;
  }>({
    nom: '',
    type: 'text',
    obligatoire: true,
  });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.nom.trim()) {
      toastError('Le nom est obligatoire');
      return;
    }
    setLoading(true);
    try {
      if (editing) {
        await updateMutation.mutateAsync({ id: editing.id, data: form });
        success('Attribut mis à jour ✅');
      } else {
        await createMutation.mutateAsync(form);
        success('Attribut créé ✅');
      }
      setShowForm(false);
      setEditing(null);
      setForm({ nom: '', type: 'text', obligatoire: true });
      refetch();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cet attribut ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const handleToggleObligatoire = async (attribut: AttributService) => {
    await updateMutation.mutateAsync({
      id: attribut.id,
      data: { obligatoire: !attribut.obligatoire },
    });
    refetch();
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/services')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📚 Attributs des services</h1>
        <span className="ml-auto text-sm text-[var(--color-textSecondary)]">
          {attributs.length} attribut{attributs.length > 1 ? 's' : ''}
        </span>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div>
            <p className="text-sm text-[var(--color-textSecondary)]">
              Gérez la bibliothèque d'attributs pour les services.
            </p>
          </div>
          <button
            onClick={() => { setEditing(null); setForm({ nom: '', type: 'text', obligatoire: true }); setShowForm(true); }}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Nouvel attribut
          </button>
        </div>

        {showForm && (
          <MotionBox as="div" className="p-4 mb-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
            <div className="flex items-center justify-between mb-3">
              <h4 className="font-medium text-[var(--color-textPrimary)]">
                {editing ? 'Modifier l\'attribut' : 'Nouvel attribut'}
              </h4>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-textSecondary)]">
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="flex flex-wrap gap-3">
              <div className="flex-1 min-w-[150px]">
                <input
                  type="text"
                  value={form.nom}
                  onChange={(e) => setForm({ ...form, nom: e.target.value })}
                  placeholder="Nom du champ"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
              <div className="w-[150px]">
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as AttributType })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  {TYPES.map((t) => (
                    <option key={t.value} value={t.value}>{t.label}</option>
                  ))}
                </select>
              </div>
              <label className="flex items-center gap-2 text-sm text-[var(--color-textPrimary)]">
                <input
                  type="checkbox"
                  checked={form.obligatoire}
                  onChange={(e) => setForm({ ...form, obligatoire: e.target.checked })}
                  className="accent-[var(--color-primary)]"
                />
                Obligatoire
              </label>
              <button
                type="submit"
                disabled={loading}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 flex items-center gap-2"
              >
                <Save size={16} /> {loading ? 'En cours...' : (editing ? 'Mettre à jour' : 'Ajouter')}
              </button>
            </form>
          </MotionBox>
        )}

        <div className="space-y-2">
          {attributs.map((attr) => (
            <div
              key={attr.id}
              className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition"
            >
              <div className="flex items-center gap-4 flex-wrap">
                <span className="font-medium text-[var(--color-textPrimary)]">{attr.nom}</span>
                <span className="px-2 py-0.5 rounded-full text-xs bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                  {TYPES.find(t => t.value === attr.type)?.label || attr.type}
                </span>
                <span className={`text-xs px-2 py-0.5 rounded-full ${
                  attr.obligatoire
                    ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]'
                    : 'bg-[var(--color-secondary)] text-[var(--color-textSecondary)]'
                }`}>
                  {attr.obligatoire ? '✅ Obligatoire' : '⬜ Optionnel'}
                </span>
              </div>
              <div className="flex gap-1">
                <button
                  onClick={() => handleToggleObligatoire(attr)}
                  className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                  title={attr.obligatoire ? 'Rendre optionnel' : 'Rendre obligatoire'}
                >
                  {attr.obligatoire ? <Check size={16} /> : <X size={16} />}
                </button>
                <button
                  onClick={() => {
                    setEditing(attr);
                    setForm({ nom: attr.nom, type: attr.type, obligatoire: attr.obligatoire });
                    setShowForm(true);
                  }}
                  className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                >
                  <Edit size={16} />
                </button>
                <button
                  onClick={() => handleDelete(attr.id)}
                  className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>
          ))}
          {attributs.length === 0 && (
            <div className="text-center py-8 text-[var(--color-textSecondary)] border-2 border-dashed border-[var(--color-borderColor)] rounded-xl">
              <p className="text-lg">Aucun attribut</p>
              <p className="text-sm">Créez votre premier attribut pour les services.</p>
            </div>
          )}
        </div>

        <div className="mt-4 pt-4 border-t border-[var(--color-borderColor)]">
          <p className="text-xs text-[var(--color-textSecondary)]">
            💡 Les attributs sélectionnés apparaîtront dans le formulaire de demande de service.
          </p>
        </div>
      </MotionBox>
    </div>
  );
};

export default AttributsServiceSettings;
