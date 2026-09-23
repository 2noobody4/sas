import React from 'react';
import { Categorie } from '../types/stock';
import { X } from 'lucide-react';
import { MotionBox } from './MotionBox';

interface ProductFiltersProps {
  categories: Categorie[];
  selectedCategorie: string;
  onCategorieChange: (id: string) => void;
  showInactifs: boolean;
  onShowInactifsChange: (show: boolean) => void;
  stockStatus: string;
  onStockStatusChange: (status: string) => void;
  onClose: () => void;
}

const ProductFilters: React.FC<ProductFiltersProps> = ({
  categories,
  selectedCategorie,
  onCategorieChange,
  showInactifs,
  onShowInactifsChange,
  stockStatus,
  onStockStatusChange,
  onClose,
}) => {
  return (
    <MotionBox type="filters" variant="products" usageId="stocks-product-filters" page="StocksPage" parentLevel={1} isChildren className="space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-medium text-[var(--color-textPrimary)]">Filtres</h3>
        <button onClick={onClose} className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]">
          <X size={18} />
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        {/* Catégorie */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Catégorie</label>
          <select
            value={selectedCategorie}
            onChange={(e) => onCategorieChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="">Toutes les catégories</option>
            <option value="null">Sans catégorie</option>
            {categories.map(c => (
              <option key={c.id} value={c.id}>{c.nom}</option>
            ))}
          </select>
        </div>

        {/* Statut de stock */}
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Statut de stock</label>
          <select
            value={stockStatus}
            onChange={(e) => onStockStatusChange(e.target.value)}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="all">Tous</option>
            <option value="out">Rupture de stock</option>
            <option value="low">Stock bas</option>
            <option value="ok">Stock suffisant</option>
          </select>
        </div>
      </div>

      {/* Actif / Inactif */}
      <div className="flex items-center gap-3">
        <label className="flex items-center gap-2 text-sm text-[var(--color-textPrimary)]">
          <input
            type="checkbox"
            checked={showInactifs}
            onChange={(e) => onShowInactifsChange(e.target.checked)}
            className="accent-[var(--color-primary)]"
          />
          Inclure les produits retirés
        </label>
      </div>

      {/* Filtres analytics (désactivés en attendant) */}
      <div className="pt-4 border-t border-[var(--color-borderColor)]">
        <p className="text-xs text-[var(--color-textSecondary)] mb-2">Filtres avancés (disponible prochainement)</p>
        <div className="flex flex-wrap gap-2 opacity-50 pointer-events-none">
          <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
            Meilleure vente
          </span>
          <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
            Pas vendu
          </span>
          <span className="px-3 py-1 text-xs rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
            Peu vendu
          </span>
        </div>
      </div>
    </MotionBox>
  );
};

export default ProductFilters;
