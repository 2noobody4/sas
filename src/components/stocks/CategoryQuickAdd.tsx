// ============================================================
// CATEGORY QUICK ADD — Pop-up pour créer une catégorie rapidement
// Version V3 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { ColorPicker } from '../ui/ColorPicker';
import { Plus, Tag, X } from 'lucide-react';
import { useCreateCategorie } from '../../hooks/useProduits';
import { useToast } from '../../hooks/useToast';

interface CategoryQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (categoryId: string) => void;
}

export const CategoryQuickAdd: React.FC<CategoryQuickAddProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateCategorie();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({ nom: '', description: '', couleur: '#1E3A5F' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createMutation.mutateAsync(form);
      onSuccess(result.id);
      success('Catégorie créée ✅');
      setForm({ nom: '', description: '', couleur: '#1E3A5F' });
      onClose();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Footer avec les boutons
  const footer = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={onClose}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Annuler
      </button>
      <button
        type="submit"
        form="category-quick-add-form"
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
          loading
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
        } transition`}
      >
        {loading ? 'Création...' : (
          <>
            <Plus size={16} /> Créer la catégorie
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouvelle catégorie"
      subtitle="Ajouter une catégorie pour organiser vos produits"
      icon={<Tag size={24} />}
      maxWidth="md"
      maxHeight="60vh"
      showFooter={true}
      footer={footer}
    >
      <form id="category-quick-add-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom *</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            placeholder="ex: Électronique"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Description</label>
          <textarea
            value={form.description}
            onChange={(e) => setForm({ ...form, description: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            placeholder="Description de la catégorie"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Couleur</label>
          <ColorPicker
            value={form.couleur}
            onChange={(color) => setForm({ ...form, couleur: color })}
          />
        </div>
      </form>
    </Modal>
  );
};

export default CategoryQuickAdd;
