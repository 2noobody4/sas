// ============================================================
// FOURNISSEUR QUICK ADD — Pop-up pour créer un fournisseur rapidement
// Version V3 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { Modal } from '../ui/Modal';
import { Plus, Truck, X } from 'lucide-react';
import { useCreateFournisseur } from '../../hooks/useFournisseurs';
import { useToast } from '../../hooks/useToast';

interface FournisseurQuickAddProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (fournisseurId: string) => void;
}

export const FournisseurQuickAdd: React.FC<FournisseurQuickAddProps> = ({
  isOpen,
  onClose,
  onSuccess,
}) => {
  const createMutation = useCreateFournisseur();
  const { success, error: toastError } = useToast();
  const [form, setForm] = useState({ nom: '', contact: '', email: '', adresse: '' });
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const result = await createMutation.mutateAsync(form);
      onSuccess(result.id);
      success('Fournisseur créé ✅');
      setForm({ nom: '', contact: '', email: '', adresse: '' });
      onClose();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

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
        form="fournisseur-quick-add-form"
        disabled={loading}
        className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
          loading
            ? 'bg-gray-300 cursor-not-allowed opacity-60'
            : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
        } transition`}
      >
        {loading ? 'Création...' : (
          <>
            <Plus size={16} /> Créer le fournisseur
          </>
        )}
      </button>
    </div>
  );

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Nouveau fournisseur"
      subtitle="Ajouter un fournisseur à votre catalogue"
      icon={<Truck size={24} />}
      maxWidth="md"
      maxHeight="70vh"
      showFooter={true}
      footer={footer}
    >
      <form id="fournisseur-quick-add-form" onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700">Nom *</label>
          <input
            type="text"
            value={form.nom}
            onChange={(e) => setForm({ ...form, nom: e.target.value })}
            required
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            placeholder="ex: Fournisseur X"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Contact</label>
          <input
            type="text"
            value={form.contact}
            onChange={(e) => setForm({ ...form, contact: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            placeholder="Nom du contact"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Email</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            placeholder="contact@fournisseur.com"
          />
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700">Adresse</label>
          <textarea
            value={form.adresse}
            onChange={(e) => setForm({ ...form, adresse: e.target.value })}
            rows={2}
            className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 placeholder:text-gray-400 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            placeholder="Adresse du fournisseur"
          />
        </div>
      </form>
    </Modal>
  );
};

export default FournisseurQuickAdd;
