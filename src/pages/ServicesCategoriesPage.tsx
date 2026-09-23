// ============================================================
// SERVICES CATEGORIES PAGE — CRUD catégories de service
// Version V1 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { CategoryQuickAddService } from '../components/CategoryQuickAddService';
import { useCategoriesService, useDeleteCategorieService } from '../hooks/useCategoriesService';
import { ArrowLeft, Plus, Edit, Trash2, Tag } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const ServicesCategoriesPage: React.FC = () => {
  const history = useHistory();
  const { data: categories = [], isLoading, refetch } = useCategoriesService();
  const deleteMutation = useDeleteCategorieService();
  const { error: toastError } = useToast();
  const [showModal, setShowModal] = useState(false);

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette catégorie ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (err: any) {
        toastError(err.message);
      }
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/services')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
          <Tag size={24} className="text-[var(--color-primary)]" />
          Catégories de service
        </h1>
        <button
          onClick={() => setShowModal(true)}
          className="ml-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouvelle catégorie
        </button>
      </div>

      {categories.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <Tag size={48} className="mx-auto opacity-30 mb-4" />
          <p>Aucune catégorie de service</p>
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
          {categories.map((c) => (
            <MotionBox key={c.id} type="card" variant="default" className="p-4 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div
                  className="w-10 h-10 rounded-lg flex items-center justify-center text-white"
                  style={{ backgroundColor: c.couleur || 'var(--color-primary)' }}
                >
                  <Tag size={20} />
                </div>
                <div>
                  <p className="font-medium text-[var(--color-textPrimary)]">{c.nom}</p>
                  {c.description && (
                    <p className="text-sm text-[var(--color-textSecondary)]">{c.description}</p>
                  )}
                </div>
              </div>
              <button
                onClick={() => handleDelete(c.id)}
                className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
              >
                <Trash2 size={16} />
              </button>
            </MotionBox>
          ))}
        </div>
      )}

      <CategoryQuickAddService
        isOpen={showModal}
        onClose={() => setShowModal(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default ServicesCategoriesPage;
