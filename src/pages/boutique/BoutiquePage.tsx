import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useProduits } from '../../hooks/useProduits';
import { usePanier } from '../../hooks/useBoutique';
import { useToast } from '../../hooks/useToast';
import { Search, ShoppingCart } from 'lucide-react';
import { Link } from 'react-router-dom';

export const BoutiquePage: React.FC = () => {
  const { data: produits = [], isLoading } = useProduits();
  const { panier, ajouter } = usePanier();
  const { success, info } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [categorieFiltre, setCategorieFiltre] = useState('');

  const produitsActifs = produits.filter((p: any) => p.actif);

  // Extraire les catégories uniques (sans Set pour compatibilité TS)
  const categories: string[] = [];
  produitsActifs.forEach((p: any) => {
    if (p.categorie?.nom && !categories.includes(p.categorie.nom)) {
      categories.push(p.categorie.nom);
    }
  });

  const produitsFiltres = produitsActifs.filter((p: any) => {
    const matchNom = p.nom.toLowerCase().includes(searchTerm.toLowerCase());
    const matchCategorie = categorieFiltre ? p.categorie?.nom === categorieFiltre : true;
    return matchNom && matchCategorie;
  });

  const totalItems = panier.items.reduce((acc: number, item: any) => acc + item.quantite, 0);

  const handleAjouter = (produit: any) => {
    if (produit.quantite <= 0) {
      info('⚠️ Ce produit est en rupture de stock');
      return;
    }
    ajouter(produit.id, produit.prix_vente);
    success(`${produit.nom} ajouté au panier ✅`);
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🛍️ Boutique</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Découvrez nos produits</p>
        </div>
        <Link
          to="/boutique/panier"
          className="relative p-3 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2"
        >
          <ShoppingCart size={20} />
          <span className="text-sm font-medium">Panier</span>
          {totalItems > 0 && (
            <span className="absolute -top-1 -right-1 min-w-[20px] h-[20px] px-1 text-xs font-bold bg-[var(--color-danger)] rounded-full flex items-center justify-center">
              {totalItems}
            </span>
          )}
        </Link>
      </div>

      <div className="flex flex-wrap gap-3 mb-6">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <select
          value={categorieFiltre}
          onChange={(e) => setCategorieFiltre(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Toutes les catégories</option>
          {categories.map((cat: string) => (
            <option key={cat} value={cat}>{cat}</option>
          ))}
        </select>
      </div>

      {produitsFiltres.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun produit trouvé.
        </MotionBox>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {produitsFiltres.map((produit: any) => (
            <MotionBox key={produit.id} type="card" variant="default" className="overflow-hidden hover:shadow-xl transition-all duration-300">
              <div className="aspect-square bg-[var(--color-secondary)] flex items-center justify-center">
                {produit.image_url ? (
                  <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
                ) : (
                  <div className="text-6xl opacity-20">📦</div>
                )}
              </div>
              <div className="p-4">
                <h3 className="font-semibold text-[var(--color-textPrimary)]">{produit.nom}</h3>
                {produit.categorie?.nom && (
                  <p className="text-xs text-[var(--color-textSecondary)]">{produit.categorie.nom}</p>
                )}
                <p className="text-lg font-bold text-[var(--color-primary)] mt-2">
                  {produit.prix_vente.toLocaleString()} FCFA
                </p>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  {produit.quantite > 0 ? `Stock : ${produit.quantite}` : '⚠️ Rupture'}
                </p>
                <button
                  onClick={() => handleAjouter(produit)}
                  disabled={produit.quantite <= 0}
                  className={`mt-3 w-full px-4 py-2 rounded-xl text-white ${
                    produit.quantite > 0 ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]' : 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                  } transition`}
                >
                  {produit.quantite > 0 ? 'Ajouter au panier' : 'Rupture'}
                </button>
              </div>
            </MotionBox>
          ))}
        </div>
      )}
    </div>
  );
};

export default BoutiquePage;
