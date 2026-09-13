import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { 
  TrendingUp, Package, FolderTree, Truck, GitBranch,
  Plus, ClipboardList
} from 'lucide-react';

interface ModuleCardProps {
  icon: React.ReactNode;
  title: string;
  description: string;
  to: string;
  badge?: string;
}

const ModuleCard: React.FC<ModuleCardProps> = ({ icon, title, description, to, badge }) => (
  <Link to={to} className="block">
    <MotionBox
      type="card"
      variant="elevated"
      className="p-5 shadow-md rounded-xl border border-[var(--color-borderColor)] hover:shadow-xl transition-all hover:scale-[1.02] active:scale-[0.98] h-full flex flex-col"
      animation={{
        declenchees: [{ trigger: 'hover', animation: 'liftHover' }],
      }}
    >
      <div className="flex items-start justify-between">
        <div className="p-2 rounded-lg bg-[var(--color-secondary)] text-[var(--color-primary)]">
          {icon}
        </div>
        {badge && (
          <span className="text-xs font-medium px-2 py-1 rounded-full bg-[var(--color-primary)] text-white">
            {badge}
          </span>
        )}
      </div>
      <h3 className="text-lg font-semibold mt-3 text-[var(--color-textPrimary)]">{title}</h3>
      <p className="text-sm text-[var(--color-textSecondary)] flex-1">{description}</p>
    </MotionBox>
  </Link>
);

export const StockModulePage: React.FC = () => {
  const cards: ModuleCardProps[] = [
    {
      icon: <TrendingUp size={24} />,
      title: 'Tableau de bord',
      description: "Vue d'ensemble des stocks, indicateurs et alertes.",
      to: '/gestion/stocks/dashboard',
    },
    {
      icon: <Package size={24} />,
      title: 'Produits',
      description: 'Gestion du catalogue : ajout, modification, recherche.',
      to: '/gestion/stocks',
      badge: 'CRUD',
    },
    {
      icon: <FolderTree size={24} />,
      title: 'Catégories',
      description: 'Organisez vos produits par catégories et sous-catégories.',
      to: '/gestion/stocks/categories',
    },
    {
      icon: <Truck size={24} />,
      title: 'Fournisseurs',
      description: 'Liste et gestion des fournisseurs.',
      to: '/gestion/stocks/fournisseurs',
    },
    {
      icon: <GitBranch size={24} />,
      title: 'Mouvements',
      description: 'Historique des entrées, sorties et ajustements.',
      to: '/gestion/stocks/mouvements',
    },
    {
      icon: <ClipboardList size={24} />,
      title: 'Inventaire',
      description: "Gestion des sessions d'inventaire et comptage.",
      to: '/gestion/stocks/inventaire',
    },
  ];

  return (
    <MotionBox as="div" type="page" variant="default" className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            📦 Module Stocks
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Gérez vos produits, catégories, fournisseurs, mouvements et inventaire.
          </p>
        </div>
        <Link
          to="/gestion/stocks"
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau produit
        </Link>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {cards.map((card) => (
          <ModuleCard key={card.to} {...card} />
        ))}
      </div>

      <div className="mt-8 p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-sm">
        <h3 className="font-semibold text-[var(--color-textPrimary)] flex items-center gap-2 mb-3">
          ⚡ Actions rapides
        </h3>
        <div className="flex flex-wrap gap-3">
          <Link
            to="/gestion/stocks"
            className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-[var(--color-textPrimary)] text-sm hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            ➕ Ajouter un produit
          </Link>
          <Link
            to="/gestion/stocks/categories"
            className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-[var(--color-textPrimary)] text-sm hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            📂 Gérer les catégories
          </Link>
          <Link
            to="/gestion/stocks/mouvements"
            className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-[var(--color-textPrimary)] text-sm hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            📊 Voir les mouvements
          </Link>
          <Link
            to="/gestion/stocks/inventaire"
            className="px-4 py-2 rounded-lg bg-[var(--color-secondary)] text-[var(--color-textPrimary)] text-sm hover:bg-[var(--color-primary)] hover:text-white transition"
          >
            📋 Nouvel inventaire
          </Link>
        </div>
      </div>
    </MotionBox>
  );
};

export default StockModulePage;
