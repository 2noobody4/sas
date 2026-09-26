// ============================================================
// PRODUIT DETAIL PAGE — Page publique boutique
// Version V1
// ------------------------------------------------------------
// - Galerie d'images (thumbnails) + CachedImage
// - Bouton "Commander"
// ============================================================

import React, { useState, useMemo } from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { CachedImage } from '../components/CachedImage';
import { useProduit } from '../hooks/useProduits';
import { usePanier } from '../hooks/useBoutique';
import { useFormat } from '../hooks/useFormat';
import { useToast } from '../hooks/useToast';
import {
  ArrowLeft, Package, CheckCircle, XCircle, Send,
} from 'lucide-react';

interface RouteParams {
  id: string;
}

export const ProduitDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: produit, isLoading } = useProduit(id);
  const { ajouter } = usePanier();
  const { formatCurrency } = useFormat();
  const { success, info } = useToast();

  const [selectedImage, setSelectedImage] = useState(0);

  const images = useMemo(() => {
    if (!produit) return [];
    if ((produit as any).images && (produit as any).images.length > 0) return (produit as any).images;
    return produit.image_url ? [produit.image_url] : [];
  }, [produit]);

  if (isLoading) {
    return <div className="p-6 max-w-6xl mx-auto text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  if (!produit) {
    return (
      <div className="p-6 max-w-6xl mx-auto text-center text-[var(--color-danger)]">
        <Package size={48} className="mx-auto opacity-30 mb-4" />
        <p className="text-lg font-medium">Produit introuvable</p>
        <button
          onClick={() => history.push('/boutique')}
          className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
        >
          Retour à la boutique
        </button>
      </div>
    );
  }

  const enStock = produit.quantite > 0;
  const catNom = produit.categorie?.nom;
  const currentImage = images[selectedImage];

  const handleCommander = () => {
    if (!enStock) {
      info('⚠️ Ce produit est en rupture de stock');
      return;
    }
    ajouter(produit.id, produit.prix_vente);
    success(`${produit.nom} ajouté à votre commande ✅`);
  };

  return (
    <div className="min-h-screen bg-[var(--color-background)] py-6">
      <div className="p-4 sm:p-6 max-w-6xl mx-auto">
        <button
          onClick={() => history.push('/boutique')}
          className="flex items-center gap-2 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)] mb-4"
        >
          <ArrowLeft size={20} /> Retour à la boutique
        </button>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Colonne gauche : galerie */}
          <MotionBox type="card" variant="elevated" className="p-4">
            <div className="w-full aspect-square rounded-2xl bg-[var(--color-secondary)] flex items-center justify-center overflow-hidden mb-3">
              {currentImage ? (
                <CachedImage
                  key={currentImage}
                  src={currentImage}
                  alt={produit.nom}
                  className="w-full h-full object-cover"
                />
              ) : (
                <Package size={80} className="text-[var(--color-textSecondary)] opacity-30" />
              )}
            </div>

            {images.length > 1 && (
              <div className="grid grid-cols-5 gap-2">
                {images.map((img: string, idx: number) => (
                  <button
                    key={`${img}-${idx}`}
                    onClick={() => setSelectedImage(idx)}
                    className={`aspect-square rounded-lg overflow-hidden border-2 transition ${
                      idx === selectedImage
                        ? 'border-[var(--color-primary)]'
                        : 'border-[var(--color-borderColor)] hover:border-[var(--color-primary)]/50'
                    }`}
                  >
                    <CachedImage
                      src={img}
                      alt={`${produit.nom} - ${idx + 1}`}
                      className="w-full h-full object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </MotionBox>

          {/* Colonne droite : détails */}
          <MotionBox type="card" variant="elevated" className="p-6">
            <div className="flex items-start justify-between">
              <div>
                <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{produit.nom}</h1>
                {catNom && <p className="text-sm text-[var(--color-textSecondary)] mt-1">{catNom}</p>}
              </div>
              {enStock ? (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-success)] flex-shrink-0">
                  <CheckCircle size={16} /> En stock
                </span>
              ) : (
                <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-danger)] flex-shrink-0">
                  <XCircle size={16} /> Rupture
                </span>
              )}
            </div>

            <div className="mt-4 flex items-center gap-2">
              <span className="text-2xl font-bold text-[var(--color-primary)]">
                {formatCurrency(produit.prix_vente)}
              </span>
            </div>

            {produit.description && (
              <div className="pt-4 mt-4 border-t border-[var(--color-borderColor)]">
                <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">Description</h3>
                <p className="text-[var(--color-textSecondary)] leading-relaxed whitespace-pre-wrap">
                  {produit.description}
                </p>
              </div>
            )}

            <button
              onClick={handleCommander}
              disabled={!enStock}
              className={`mt-6 w-full px-6 py-3 rounded-xl text-white font-medium transition flex items-center justify-center gap-2 ${
                enStock
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  : 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
              }`}
            >
              <Send size={18} /> {enStock ? 'Commander' : 'Rupture de stock'}
            </button>
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default ProduitDetailPage;
