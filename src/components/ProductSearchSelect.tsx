/**
 * ProductSearchSelect – Composant de recherche et sélection de produit
 * Affichage en tuiles avec image, nom, description, stock et date de dernière vente
 * Compatible React 16.14
 */

import React, { useState, useEffect, useRef } from 'react';
import { MotionBox } from './MotionBox';
import { Search, Package, AlertTriangle, Clock, X } from 'lucide-react';
import { useProduits } from '../hooks/useProduits';
import { useVentes } from '../hooks/useVentes';
import { Produit } from '../types/stock';

interface ProductSearchSelectProps {
  value: string;
  onChange: (produitId: string, produit?: Produit) => void;
  onClose?: () => void;
  placeholder?: string;
  className?: string;
  disabled?: boolean;
  autoFocus?: boolean;
  excludeOutOfStock?: boolean;
}

export const ProductSearchSelect: React.FC<ProductSearchSelectProps> = ({
  value,
  onChange,
  onClose,
  placeholder = 'Rechercher un produit...',
  className = '',
  disabled = false,
  autoFocus = false,
  excludeOutOfStock = false,
}) => {
  const { data: produits = [], isLoading } = useProduits();
  const { data: ventes = [] } = useVentes();
  const [isOpen, setIsOpen] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedProduit, setSelectedProduit] = useState<Produit | null>(null);
  const [filteredProduits, setFilteredProduits] = useState<Produit[]>([]);
  const inputRef = useRef<HTMLInputElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);

  // Récupérer la date de dernière vente pour un produit
  const getLastVenteDate = (produitId: string): Date | null => {
    const produitVentes = ventes
      .filter(v => v.lignes?.some(l => l.produit_id === produitId))
      .sort((a, b) => new Date(b.date_vente).getTime() - new Date(a.date_vente).getTime());
    return produitVentes.length > 0 ? new Date(produitVentes[0].date_vente) : null;
  };

  const getLastVenteFormatted = (produitId: string): string => {
    const date = getLastVenteDate(produitId);
    if (!date) return 'Jamais vendu';
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const days = Math.floor(diff / (1000 * 60 * 60 * 24));
    if (days === 0) return "Aujourd'hui";
    if (days === 1) return 'Hier';
    if (days < 7) return `Il y a ${days} jours`;
    if (days < 30) return `Il y a ${Math.floor(days / 7)} semaines`;
    return `Il y a ${Math.floor(days / 30)} mois`;
  };

  // Mettre à jour le produit sélectionné quand la valeur change
  useEffect(() => {
    if (value) {
      const produit = produits.find((p: Produit) => p.id === value);
      if (produit) {
        setSelectedProduit(produit);
        setSearchTerm(produit.nom);
      }
    } else {
      setSelectedProduit(null);
      setSearchTerm('');
    }
  }, [value, produits]);

  // Filtrer les produits
  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredProduits(produits.slice(0, 12));
      return;
    }
    const term = searchTerm.toLowerCase();
    const filtered = produits.filter((p: Produit) => {
      const matchNom = p.nom.toLowerCase().includes(term);
      const matchRef = p.reference?.toLowerCase().includes(term) || false;
      const matchCategorie = p.categorie?.nom?.toLowerCase().includes(term) || false;
      const inStock = !excludeOutOfStock || p.quantite > 0;
      return (matchNom || matchRef || matchCategorie) && inStock;
    });
    setFilteredProduits(filtered.slice(0, 20));
  }, [searchTerm, produits, excludeOutOfStock]);

  // Fermer le dropdown au clic à l'extérieur
  useEffect(() => {
    const handleClickOutside = (e: MouseEvent) => {
      if (containerRef.current && !containerRef.current.contains(e.target as Node)) {
        setIsOpen(false);
        onClose?.();
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [onClose]);

  const handleSelect = (produit: Produit) => {
    setSelectedProduit(produit);
    setSearchTerm(produit.nom);
    onChange(produit.id, produit);
    setIsOpen(false);
    onClose?.();
  };

  const handleClear = (e: React.MouseEvent) => {
    e.stopPropagation();
    setSelectedProduit(null);
    setSearchTerm('');
    onChange('', undefined);
    setIsOpen(false);
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setSearchTerm(e.target.value);
    if (selectedProduit) {
      setSelectedProduit(null);
      onChange('', undefined);
    }
    setIsOpen(true);
  };

  const handleInputFocus = () => {
    if (!disabled) {
      setIsOpen(true);
    }
  };

  // Rendu d'une tuile produit
  const renderProductTile = (produit: Produit) => {
    const isSelected = selectedProduit?.id === produit.id;
    const lastVente = getLastVenteFormatted(produit.id);
    const isLowStock = produit.quantite <= produit.seuil_alerte && produit.quantite > 0;
    const isOutOfStock = produit.quantite === 0;

    return (
      <button
        key={produit.id}
        onClick={() => handleSelect(produit)}
        className={`w-full text-left p-3 rounded-xl border transition-all hover:shadow-md ${
          isSelected
            ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
            : 'border-[var(--color-borderColor)] hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
        } ${isOutOfStock ? 'opacity-60' : ''}`}
      >
        <div className="flex items-center gap-3">
          {/* Image */}
          <div className="w-14 h-14 rounded-lg bg-[var(--color-secondary)] flex items-center justify-center overflow-hidden flex-shrink-0">
            {produit.image_url ? (
              <img src={produit.image_url} alt={produit.nom} className="w-full h-full object-cover" />
            ) : (
              <Package size={24} className="text-[var(--color-textSecondary)] opacity-40" />
            )}
          </div>

          {/* Infos */}
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <span className="font-medium text-[var(--color-textPrimary)] truncate">
                {produit.nom}
              </span>
              {produit.reference && (
                <span className="text-xs text-[var(--color-textSecondary)] font-mono">
                  #{produit.reference}
                </span>
              )}
            </div>
            <div className="flex items-center gap-3 text-sm">
              <span className="text-[var(--color-textSecondary)]">
                {produit.categorie?.nom || 'Non catégorisé'}
              </span>
              <span className="text-xs text-[var(--color-textSecondary)]">
                {produit.prix_vente.toLocaleString()} FCFA
              </span>
            </div>
            <div className="flex items-center gap-3 mt-1 text-xs">
              {/* Stock */}
              <span className={`flex items-center gap-1 ${
                isOutOfStock ? 'text-[var(--color-danger)]' :
                isLowStock ? 'text-[var(--color-warning)]' :
                'text-[var(--color-success)]'
              }`}>
                {isOutOfStock ? (
                  <AlertTriangle size={12} />
                ) : isLowStock ? (
                  <AlertTriangle size={12} />
                ) : null}
                Stock: {produit.quantite} {produit.unite}
              </span>
              {/* Dernière vente */}
              <span className="flex items-center gap-1 text-[var(--color-textSecondary)]">
                <Clock size={12} />
                {lastVente}
              </span>
            </div>
          </div>

          {/* Badge statut stock */}
          {isOutOfStock && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-danger)] text-white flex-shrink-0">
              Rupture
            </span>
          )}
          {isLowStock && !isOutOfStock && (
            <span className="px-2 py-0.5 text-xs font-medium rounded-full bg-[var(--color-warning)] text-white flex-shrink-0">
              Stock bas
            </span>
          )}
        </div>
      </button>
    );
  };

  return (
    <div ref={containerRef} className={`relative ${className}`}>
      {/* Champ de recherche */}
      <div className="relative">
        <div className="flex items-center border rounded-xl border-[var(--color-borderColor)] bg-[var(--color-cardBg)] focus-within:ring-2 focus-within:ring-[var(--color-primary)] focus-within:border-transparent transition">
          <div className="pl-3 text-[var(--color-textSecondary)]">
            <Search size={18} />
          </div>
          <input
            ref={inputRef}
            type="text"
            value={searchTerm}
            onChange={handleInputChange}
            onFocus={handleInputFocus}
            placeholder={placeholder}
            disabled={disabled}
            autoFocus={autoFocus}
            className="flex-1 px-2 py-2.5 bg-transparent text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)] outline-none"
          />
          {searchTerm && !disabled && (
            <button
              onClick={handleClear}
              className="pr-3 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
            >
              <X size={16} />
            </button>
          )}
          {isLoading && (
            <div className="pr-3 text-[var(--color-textSecondary)] animate-pulse">
              <Package size={16} />
            </div>
          )}
        </div>
      </div>

      {/* Liste des produits en tuiles */}
      {isOpen && !disabled && (
        <MotionBox
          as="div"
          className="absolute z-50 w-full mt-2 overflow-hidden rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-lg max-h-96 overflow-y-auto"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          {filteredProduits.length === 0 ? (
            <div className="p-6 text-center text-[var(--color-textSecondary)]">
              {searchTerm.trim() ? (
                <>
                  <Package size={32} className="mx-auto opacity-30 mb-2" />
                  <p>Aucun produit trouvé pour "{searchTerm}"</p>
                </>
              ) : (
                <p>Commencez à taper pour rechercher un produit</p>
              )}
            </div>
          ) : (
            <div className="p-2 space-y-2">
              {filteredProduits.map(renderProductTile)}
              {filteredProduits.length >= 20 && (
                <div className="p-2 text-center text-xs text-[var(--color-textSecondary)] border-t border-[var(--color-borderColor)]">
                  {filteredProduits.length}+ produits — Affinez votre recherche
                </div>
              )}
            </div>
          )}
        </MotionBox>
      )}
    </div>
  );
};

export default ProductSearchSelect;
