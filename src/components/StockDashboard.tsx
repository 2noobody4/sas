import React from 'react';
import { MotionBox } from './MotionBox';
import { useProduits, useCategories } from '../hooks/useProduits';
import { Produit } from '../types/stock';
import { Package, AlertTriangle, ShoppingBag, TrendingUp, Folder, Box, Clock } from 'lucide-react';

export const StockDashboard: React.FC = () => {
  const { data: produits = [], isLoading: pLoading } = useProduits();
  const { data: categories = [], isLoading: cLoading } = useCategories();

  if (pLoading || cLoading) {
    return <div className="p-6 text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  const total = produits.length;
  const stockCritique = produits.filter((p: Produit) => p.quantite <= p.seuil_alerte && p.quantite > 0).length;
  const rupture = produits.filter((p: Produit) => p.quantite === 0).length;
  const valeurStock = produits.reduce((sum: number, p: Produit) => sum + (p.quantite * p.prix_achat), 0);

  const stats = [
    { icon: Box, label: 'Total produits', value: total, color: 'var(--color-primary)' },
    { icon: Folder, label: 'Catégories', value: categories.length, color: 'var(--color-info)' },
    { icon: AlertTriangle, label: 'Stock critique', value: stockCritique, color: 'var(--color-warning)' },
    { icon: ShoppingBag, label: 'En rupture', value: rupture, color: 'var(--color-danger)' },
    { icon: TrendingUp, label: 'Valeur du stock', value: `${valeurStock.toLocaleString()} FCFA`, color: 'var(--color-success)' },
  ];

  const topProduits = [...produits]
    .filter((p: Produit) => p.actif)
    .sort((a: Produit, b: Produit) => b.quantite - a.quantite)
    .slice(0, 5);

  return (
    <MotionBox as="div" type="page" variant="default" className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Tableau de bord des stocks</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Vue d'ensemble de votre inventaire</p>
        </div>
        <button className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2">
          <Clock size={18} /> Actualiser
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-8">
        {stats.map((stat, idx) => (
          <MotionBox key={idx} type="card" variant="default" className="p-4 text-center">
            <stat.icon size={28} style={{ color: stat.color, margin: '0 auto' }} />
            <p className="text-2xl font-bold mt-2 text-[var(--color-textPrimary)]">{stat.value}</p>
            <p className="text-sm text-[var(--color-textSecondary)]">{stat.label}</p>
          </MotionBox>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">🔝 Produits les plus stockés</h3>
          {topProduits.length === 0 ? (
            <p className="text-[var(--color-textSecondary)] text-sm">Aucun produit</p>
          ) : (
            topProduits.map((p: Produit, idx: number) => (
              <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--color-borderColor)] last:border-0">
                <span className="text-[var(--color-textPrimary)]">{idx + 1}. {p.nom}</span>
                <span className="text-sm font-medium text-[var(--color-textSecondary)]">{p.quantite} {p.unite}</span>
              </div>
            ))
          )}
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">⚠️ Produits à réapprovisionner</h3>
          {produits.filter((p: Produit) => p.quantite <= p.seuil_alerte).slice(0, 5).map((p: Produit) => (
            <div key={p.id} className="flex items-center justify-between py-2 border-b border-[var(--color-borderColor)] last:border-0">
              <span className="text-[var(--color-textPrimary)]">{p.nom}</span>
              <span className="text-sm font-medium text-[var(--color-warning)]">{p.quantite} / {p.seuil_alerte}</span>
            </div>
          ))}
          {produits.filter((p: Produit) => p.quantite <= p.seuil_alerte).length === 0 && (
            <p className="text-[var(--color-textSecondary)] text-sm">✅ Tout est bien approvisionné</p>
          )}
        </MotionBox>
      </div>
    </MotionBox>
  );
};
export default StockDashboard;
