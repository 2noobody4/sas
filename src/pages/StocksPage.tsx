import React, { useState, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import {
  useProduits,
  useRetirerProduit,
  useRestaurerProduit,
  useSupprimerProduit,
} from '../hooks/useProduits';
import { useCategories } from '../hooks/useProduits';
import { Produit } from '../types/stock';
import {
  Search,
  Plus,
  Edit,
  Trash2,
  Package,
  Filter,
  X,
  Archive,
  RotateCw,
  Eye,
  RefreshCw,
} from 'lucide-react';
import ProductFilters from '../components/ProductFilters';
import StockIndicator from '../components/StockIndicator';
import { CachedImage } from '../components/CachedImage';
import { ProductDetailModal } from '../components/ProductDetailModal';
import { ReapprovisionnementModal } from '../components/ReapprovisionnementModal';
import { ProductFormModal } from '../components/ProductFormModal';

export const StocksPage: React.FC = () => {
  const history = useHistory();
  const [showInactifs, setShowInactifs] = useState(false);
  const { data: produits = [], isLoading, error, refetch } = useProduits(showInactifs);
  const { data: categories = [] } = useCategories();

  const retirerMutation = useRetirerProduit();
  const restaurerMutation = useRestaurerProduit();
  const supprimerMutation = useSupprimerProduit();

  const [search, setSearch] = useState('');
  const [selectedCategorie, setSelectedCategorie] = useState<string>('');
  const [stockStatus, setStockStatus] = useState<string>('all');
  const [showFilters, setShowFilters] = useState(false);

  // États pour les modales
  const [selectedProduct, setSelectedProduct] = useState<Produit | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showReapproModal, setShowReapproModal] = useState(false);
  const [showProductForm, setShowProductForm] = useState(false);

  const filteredProduits = useMemo(() => {
    let filtered = produits;

    if (search) {
      const q = search.toLowerCase();
      filtered = filtered.filter(
        (p: Produit) => p.nom.toLowerCase().includes(q) || p.reference?.toLowerCase().includes(q)
      );
    }

    if (selectedCategorie) {
      if (selectedCategorie === 'null') {
        filtered = filtered.filter((p: Produit) => !p.categorie_id);
      } else {
        filtered = filtered.filter((p: Produit) => p.categorie_id === selectedCategorie);
      }
    }

    if (stockStatus !== 'all') {
      filtered = filtered.filter((p: Produit) => {
        if (stockStatus === 'out') return p.quantite === 0;
        if (stockStatus === 'low') return p.quantite > 0 && p.quantite <= p.seuil_alerte;
        if (stockStatus === 'ok') return p.quantite > p.seuil_alerte;
        return true;
      });
    }

    return filtered;
  }, [produits, search, selectedCategorie, stockStatus]);

  const totalProduits = produits.length;
  const stockBas = produits.filter((p: Produit) => p.quantite <= p.seuil_alerte && p.actif).length;
  const categoriesCount = categories.length;

  const handleEdit = (produit: Produit) => {
    history.push(`/gestion/stocks/produits/${produit.id}`);
  };

  const handleView = (produit: Produit) => {
    setSelectedProduct(produit);
    setIsModalOpen(true);
  };

  const handleReappro = (produit: Produit) => {
    setSelectedProduct(produit);
    setShowReapproModal(true);
  };

  const handleRetirer = async (produit: Produit) => {
    if (window.confirm(`Voulez-vous retirer "${produit.nom}" de la boutique ?`)) {
      try {
        await retirerMutation.mutateAsync(produit.id);
        refetch();
      } catch {
        // Erreur déjà affichée via le toast (onError du hook) — on évite
        // ici une rejection de promesse non interceptée (crash React).
      }
    }
  };

  const handleRestaurer = async (produit: Produit) => {
    if (window.confirm(`Voulez-vous restaurer "${produit.nom}" dans la boutique ?`)) {
      try {
        await restaurerMutation.mutateAsync(produit.id);
        refetch();
      } catch {
        // Erreur déjà affichée via le toast (onError du hook) — on évite
        // ici une rejection de promesse non interceptée (crash React).
      }
    }
  };

  const handleSupprimerDefinitif = async (produit: Produit) => {
    if (window.confirm(
      `⚠️ Supprimer définitivement "${produit.nom}" ?\n\nCette action est irréversible et supprimera également :\n- les images associées\n- l'historique de tarification / négociation (tarifications)`
    )) {
      try {
        await supprimerMutation.mutateAsync(produit);
        refetch();
      } catch {
        // Erreur déjà affichée via le toast (onError du hook) — on évite
        // ici une rejection de promesse non interceptée (crash React).
        // Les tarifications liées sont supprimées avant le produit
        // (useSupprimerProduit) pour satisfaire tarifications_produit_id_fkey.
        // Si l'erreur persiste malgré ça, une autre table référence
        // probablement produits.id (ex: mouvements_stock) : utiliser
        // "Retirer" (désactivation) plutôt que "Supprimer définitivement"
        // dans ce cas.
      }
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (error) return <div className="p-6 text-center text-[var(--color-danger)]">Erreur : {(error as any).message}</div>;

  return (
    <div className="p-4 sm:p-6 max-w-7xl mx-auto">
      <div className="flex flex-wrap items-center justify-between gap-4 mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            📦 Gestion des produits
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Gérez votre catalogue produits
          </p>
        </div>
        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setShowInactifs(!showInactifs)}
            className={`px-3 py-2 rounded-xl border text-sm transition ${
              showInactifs
                ? 'bg-[var(--color-primary)] text-white border-[var(--color-primary)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textPrimary)] hover:bg-[var(--color-secondary)]'
            }`}
          >
            {showInactifs ? 'Voir les actifs' : 'Voir les retirés'}
          </button>
          <button
            onClick={() => setShowProductForm(true)}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
          >
            <Plus size={18} /> Nouveau produit
          </button>
        </div>
      </div>

      <div className="grid grid-cols-2 sm:grid-cols-4 gap-4 mb-6">
        <MotionBox as="div" type="card" variant="medium" className="p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{totalProduits}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Total produits</p>
        </MotionBox>
        <MotionBox as="div" type="card" variant="medium" className="p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{categoriesCount}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Catégories</p>
        </MotionBox>
        <MotionBox as="div" type="card" variant="medium" className="p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-warning)]">{stockBas}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Stock bas</p>
        </MotionBox>
        <MotionBox as="div" type="card" variant="medium" className="p-4 text-center">
          <p className="text-2xl font-bold text-[var(--color-success)]">{produits.filter((p: Produit) => p.actif).length}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Actifs</p>
        </MotionBox>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="flex-1 min-w-[200px] relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
          />
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] flex items-center gap-2 hover:bg-[var(--color-secondary)] transition"
        >
          <Filter size={18} /> Filtres
        </button>
        {selectedCategorie && (
          <button
            onClick={() => setSelectedCategorie('')}
            className="px-3 py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center gap-1 text-sm"
          >
            {categories.find((c: any) => c.id === selectedCategorie)?.nom || 'Sans catégorie'}
            <X size={14} />
          </button>
        )}
        {stockStatus !== 'all' && (
          <button
            onClick={() => setStockStatus('all')}
            className="px-3 py-2 rounded-xl bg-[var(--color-primary)]/10 text-[var(--color-primary)] flex items-center gap-1 text-sm"
          >
            {stockStatus === 'out' && 'Rupture'}
            {stockStatus === 'low' && 'Stock bas'}
            {stockStatus === 'ok' && 'Stock suffisant'}
            <X size={14} />
          </button>
        )}
      </div>

      {showFilters && (
        <MotionBox
          as="div"
          type="card"
          variant="medium"
          className="p-4 mb-6"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <ProductFilters
            categories={categories}
            selectedCategorie={selectedCategorie}
            onCategorieChange={setSelectedCategorie}
            showInactifs={showInactifs}
            onShowInactifsChange={setShowInactifs}
            stockStatus={stockStatus}
            onStockStatusChange={setStockStatus}
            onClose={() => setShowFilters(false)}
          />
        </MotionBox>
      )}

      <MotionBox as="div" type="card" variant="large" className="overflow-hidden">
        {filteredProduits.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-textSecondary)]">
            Aucun produit trouvé
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden sm:table-cell">Catégorie</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Prix vente</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Stock</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredProduits.map((produit: Produit) => {
                  const isInactif = !produit.actif;
                  return (
                    <tr
                      key={produit.id}
                      className={`border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition ${isInactif ? 'opacity-60' : ''}`}
                    >
                      <td className="px-4 py-3">
                        <div className="flex items-center gap-3">
                          {produit.image_url ? (
                            <CachedImage
                              src={produit.image_url}
                              alt={produit.nom}
                              className="w-10 h-10 rounded object-cover"
                              useMotionBox={true}
                              motionBoxProps={{ type: 'image', variant: 'thumbnail' }}
                            />
                          ) : (
                            <div className="w-10 h-10 rounded bg-[var(--color-secondary)] flex items-center justify-center text-[var(--color-textSecondary)]">
                              <Package size={20} />
                            </div>
                          )}
                          <div>
                            <div className="font-medium text-[var(--color-textPrimary)]">
                              {produit.nom}
                              {isInactif && <span className="ml-2 text-xs text-[var(--color-warning)]">(Retiré)</span>}
                            </div>
                            <div className="text-xs text-[var(--color-textSecondary)]">
                              Ref: {produit.reference || 'N/A'} · {produit.unite}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden sm:table-cell">
                        {produit.categorie?.nom || '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[var(--color-textPrimary)]">
                        {produit.prix_vente.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-center">
                        <StockIndicator quantite={produit.quantite} seuil={produit.seuil_alerte} />
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex items-center justify-end gap-1">
                          <button
                            onClick={() => handleView(produit)}
                            className="p-1.5 rounded hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)]"
                            aria-label="Voir"
                          >
                            <Eye size={18} />
                          </button>
                          <button
                            onClick={() => handleReappro(produit)}
                            className="p-1.5 rounded hover:bg-green-50 transition text-green-600"
                            aria-label="Réapprovisionner"
                          >
                            <RefreshCw size={18} />
                          </button>
                          <button
                            onClick={() => handleEdit(produit)}
                            className="p-1.5 rounded hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)]"
                            aria-label="Modifier"
                          >
                            <Edit size={18} />
                          </button>

                          {isInactif ? (
                            <button
                              onClick={() => handleRestaurer(produit)}
                              className="p-1.5 rounded hover:bg-green-50 transition text-green-600"
                              aria-label="Restaurer"
                            >
                              <RotateCw size={18} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleRetirer(produit)}
                              className="p-1.5 rounded hover:bg-yellow-50 transition text-yellow-600"
                              aria-label="Retirer"
                            >
                              <Archive size={18} />
                            </button>
                          )}

                          <button
                            onClick={() => handleSupprimerDefinitif(produit)}
                            className="p-1.5 rounded hover:bg-red-50 transition text-[var(--color-danger)]"
                            aria-label="Supprimer définitivement"
                          >
                            <Trash2 size={18} />
                          </button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </MotionBox>

      {/* Modal de détail */}
      <ProductDetailModal
        produit={selectedProduct}
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onEdit={() => {
          if (selectedProduct) {
            history.push(`/gestion/stocks/produits/${selectedProduct.id}`);
          }
        }}
        onRefresh={() => {
          refetch();
        }}
      />

      {/* Modal de réapprovisionnement */}
      <ReapprovisionnementModal
        produit={selectedProduct}
        isOpen={showReapproModal}
        onClose={() => setShowReapproModal(false)}
        onSuccess={() => {
          refetch();
          setIsModalOpen(false);
        }}
      />

      {/* Modal d'ajout de produit (nouveau style) */}
      <ProductFormModal
        isOpen={showProductForm}
        onClose={() => setShowProductForm(false)}
        onSuccess={() => {
          refetch();
        }}
      />
    </div>
  );
};

export default StocksPage;
