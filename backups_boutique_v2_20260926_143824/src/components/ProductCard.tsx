// ============================================================
// PRODUCT CARD — Card produit boutique
// Version V1
// ------------------------------------------------------------
// - Image défilante (carousel) à bord arrondi
// - Icônes superposées verticalement en haut à droite de l'image
//   (Favoris ❤️ + Aperçu rapide 👁️)
// - Bouton "Commander"
// - Clic sur la card (hors boutons) → ouvre la page produit
// ============================================================

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { Heart, Eye, Send } from 'lucide-react';
import { MotionBox } from './MotionBox';
import { ProductImageCarousel } from './ProductImageCarousel';
import { useFormat } from '../hooks/useFormat';
import { useToast } from '../hooks/useToast';

export interface ProductCardProps {
  produit: any;
  onCommander: (produit: any) => void;
}

export const ProductCard: React.FC<ProductCardProps> = ({ produit, onCommander }) => {
  const history = useHistory();
  const { formatCurrency } = useFormat();
  const { info } = useToast();
  const [favori, setFavori] = useState(false);

  const images: string[] =
    produit.images && produit.images.length > 0
      ? produit.images
      : produit.image_url
      ? [produit.image_url]
      : [];

  const enStock = produit.quantite > 0;

  const ouvrirPageProduit = () => {
    history.push(`/boutique/${produit.id}`);
  };

  const toggleFavori = (e: React.MouseEvent) => {
    e.stopPropagation();
    setFavori((f) => {
      const next = !f;
      info(next ? `${produit.nom} ajouté aux favoris ❤️` : `${produit.nom} retiré des favoris`);
      return next;
    });
  };

  const apercuRapide = (e: React.MouseEvent) => {
    e.stopPropagation();
    ouvrirPageProduit();
  };

  return (
    <MotionBox
      type="card"
      variant="default"
      onClick={ouvrirPageProduit}
      className="group overflow-hidden hover:shadow-xl transition-all duration-300 cursor-pointer"
    >
      <div className="relative">
        <ProductImageCarousel images={images} alt={produit.nom} />

        {/* Icônes superposées verticalement */}
        <div className="absolute top-2 right-2 flex flex-col items-center gap-2 z-10">
          <button
            type="button"
            onClick={toggleFavori}
            className={`p-2 rounded-full shadow-md backdrop-blur-sm transition ${
              favori ? 'bg-[var(--color-danger)] text-white' : 'bg-white/85 text-[var(--color-textPrimary)] hover:bg-white'
            }`}
            title="Ajouter aux favoris"
            aria-label="Ajouter aux favoris"
          >
            <Heart size={16} fill={favori ? 'currentColor' : 'none'} />
          </button>
          <button
            type="button"
            onClick={apercuRapide}
            className="p-2 rounded-full shadow-md bg-white/85 text-[var(--color-textPrimary)] hover:bg-white backdrop-blur-sm transition"
            title="Aperçu rapide"
            aria-label="Aperçu rapide"
          >
            <Eye size={16} />
          </button>
        </div>
      </div>

      <div className="p-4">
        <h3 className="font-semibold text-[var(--color-textPrimary)] truncate">{produit.nom}</h3>
        {produit.categorie?.nom && (
          <p className="text-xs text-[var(--color-textSecondary)]">{produit.categorie.nom}</p>
        )}
        <p className="text-lg font-bold text-[var(--color-primary)] mt-2">
          {formatCurrency(produit.prix_vente)}
        </p>
        <p className="text-sm text-[var(--color-textSecondary)]">
          {enStock ? `Stock : ${produit.quantite}` : '⚠️ Rupture'}
        </p>
        <button
          onClick={(e) => {
            e.stopPropagation();
            onCommander(produit);
          }}
          disabled={!enStock}
          className={`mt-3 w-full px-4 py-2 rounded-xl text-white flex items-center justify-center gap-2 ${
            enStock
              ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              : 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
          } transition`}
        >
          <Send size={16} />
          {enStock ? 'Commander' : 'Rupture'}
        </button>
      </div>
    </MotionBox>
  );
};

export default ProductCard;
