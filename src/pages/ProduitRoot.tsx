import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { 
  Package, 
  FolderTree, 
  Truck, 
  GitBranch, 
  TrendingUp, 
  ClipboardList,
  PlusCircle,
  BarChart,
  AlertTriangle,
  ListChecks
} from 'lucide-react';

// Association d'icônes et de couleurs par fonctionnalité
const featureStyles: Record<string, { icon: any; color: string; bgColor: string; borderColor: string }> = {
  products: {
    icon: Package,
    color: '#2F9E44',
    bgColor: 'rgba(47,158,68,0.08)',
    borderColor: '#2F9E44',
  },
  categories: {
    icon: FolderTree,
    color: '#1971C2',
    bgColor: 'rgba(25,113,194,0.08)',
    borderColor: '#1971C2',
  },
  fournisseurs: {
    icon: Truck,
    color: '#E8590C',
    bgColor: 'rgba(232,89,12,0.08)',
    borderColor: '#E8590C',
  },
  mouvements: {
    icon: GitBranch,
    color: '#6C5CE7',
    bgColor: 'rgba(108,92,231,0.08)',
    borderColor: '#6C5CE7',
  },
  dashboard: {
    icon: TrendingUp,
    color: '#E8A33D',
    bgColor: 'rgba(232,163,61,0.08)',
    borderColor: '#E8A33D',
  },
  inventaire: {
    icon: ClipboardList,
    color: '#E03131',
    bgColor: 'rgba(224,49,49,0.08)',
    borderColor: '#E03131',
  },
  promotions: {
    icon: BarChart,
    color: '#845EF7',
    bgColor: 'rgba(132,94,247,0.08)',
    borderColor: '#845EF7',
  },
  pertes: {
    icon: AlertTriangle,
    color: '#E03131',
    bgColor: 'rgba(224,49,49,0.08)',
    borderColor: '#E03131',
  },
  default: {
    icon: Package,
    color: '#1E3A5F',
    bgColor: 'rgba(30,58,95,0.08)',
    borderColor: '#1E3A5F',
  },
};

const features = [
  { id: 'products', path: '/gestion/stocks/produits', label: 'Liste des produits', description: 'Consultez et gérez tous vos produits' },
  { id: 'categories', path: '/gestion/stocks/categories', label: 'Catégories', description: 'Organisez vos produits par catégorie' },
  { id: 'fournisseurs', path: '/gestion/stocks/fournisseurs', label: 'Fournisseurs', description: 'Gérez vos fournisseurs' },
  { id: 'mouvements', path: '/gestion/stocks/mouvements', label: 'Mouvements', description: 'Historique des entrées et sorties' },
  { id: 'dashboard', path: '/gestion/stocks/dashboard', label: 'Tableau de bord', description: "Vue d'ensemble de votre stock" },
  { id: 'inventaire', path: '/gestion/stocks/inventaire', label: 'Inventaire', description: 'Gérez vos sessions d\'inventaire et suivez les écarts' },
  { id: 'promotions', path: '/gestion/stocks/promotions', label: 'Promotions', description: 'Gérez vos offres promotionnelles' },
  { id: 'pertes', path: '/gestion/stocks/pertes', label: 'Pertes', description: 'Déclarez les pertes de stock' },
];

export const ProduitRoot: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <Package size={28} />
          </span>
          Module Produits & Stock
        </h1>
        <p className="mt-1 text-[var(--color-textSecondary)] text-sm">
          Accédez rapidement à toutes les fonctionnalités de gestion des produits et du stock.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature) => {
          const style = featureStyles[feature.id] || featureStyles.default;
          const Icon = style.icon;

          let badge = null;
          if (feature.id === 'dashboard') badge = { label: 'Statistiques', color: '#E8A33D' };
          else if (feature.id === 'inventaire') badge = { label: 'Comptage', color: '#E03131' };
          else if (feature.id === 'promotions') badge = { label: 'Offres', color: '#845EF7' };
          else if (feature.id === 'pertes') badge = { label: 'Alertes', color: '#E03131' };

          return (
            <Link key={feature.id} to={feature.path} className="block">
              <MotionBox
                type="card"
                variant="medium"
                className="h-full p-5 rounded-2xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col relative overflow-hidden"
                style={{ proprietes: { borderLeft: `4px solid ${style.color}`, transition: 'all 0.25s ease' } as any }}
                animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: style.color }} />

                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: style.bgColor, color: style.color }}>
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                  {badge && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: badge.color }}>
                      {badge.label}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">{feature.label}</h3>
                <p className="text-sm text-[var(--color-textSecondary)] mt-1 flex-1">{feature.description}</p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: style.color }}>
                  Accéder
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </MotionBox>
            </Link>
          );
        })}
      </div>

      <div className="mt-8 flex flex-wrap justify-center gap-4">
        <Link
          to="/gestion/stocks/produits/nouveau"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium hover:bg-[var(--color-primary-dark)] transition shadow-lg hover:shadow-xl"
        >
          <PlusCircle size={20} />
          Ajouter un nouveau produit
        </Link>
        <Link
          to="/gestion/stocks/inventaire"
          className="inline-flex items-center gap-2 px-6 py-3 rounded-xl bg-[var(--color-danger)] text-white font-medium hover:bg-[var(--color-danger-dark)] transition shadow-lg hover:shadow-xl"
        >
          <ClipboardList size={20} />
          Nouvel inventaire
        </Link>
      </div>
    </div>
  );
};

export default ProduitRoot;
