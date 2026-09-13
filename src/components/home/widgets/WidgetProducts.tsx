import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../../ui/MotionBox';
import { useProduits } from '../../../hooks/useProduits';
import { HomeBlock } from '../../../types/homeConfig';
import { ChevronRight } from 'lucide-react';

const WidgetProducts: React.FC<{ block: HomeBlock }> = ({ block }) => {
  const { data: produits = [], isLoading } = useProduits();
  const limit = block.config?.limit || 4;
  const displayed = produits.filter(p => p.actif).slice(0, limit);

  if (isLoading) return <div className="text-center py-8 text-[var(--color-textSecondary)]">Chargement...</div>;
  if (displayed.length === 0) return <div className="text-center py-8 text-[var(--color-textSecondary)]">Aucun produit</div>;

  return (
    <div className="py-4">
      {block.title && <h2 className="text-2xl font-bold text-[var(--color-textPrimary)] text-center mb-2">{block.title}</h2>}
      {block.subtitle && <p className="text-center text-[var(--color-textSecondary)] mb-6">{block.subtitle}</p>}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {displayed.map((p) => (
          <MotionBox key={p.id} type="card" variant="default" className="overflow-hidden hover:shadow-lg transition">
            <div className="aspect-square bg-[var(--color-secondary)] flex items-center justify-center">
              {p.image_url ? <img src={p.image_url} alt={p.nom} className="w-full h-full object-cover" /> : <span className="text-4xl opacity-20">📦</span>}
            </div>
            <div className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)]">{p.nom}</h3>
              <p className="text-sm text-[var(--color-textSecondary)]">{p.categorie?.nom || 'Non catégorisé'}</p>
              <p className="text-lg font-bold text-[var(--color-primary)] mt-2">{p.prix_vente.toLocaleString()} FCFA</p>
            </div>
          </MotionBox>
        ))}
      </div>
      {block.link_url && block.link_label && (
        <div className="text-center mt-6">
          <Link to={block.link_url} className="inline-flex items-center gap-2 text-[var(--color-primary)] hover:underline">{block.link_label} <ChevronRight size={16} /></Link>
        </div>
      )}
    </div>
  );
};

export default WidgetProducts;
