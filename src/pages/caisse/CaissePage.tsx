import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { 
  LayoutDashboard, 
  Coins, 
  Receipt, 
  BarChart, 
  PlusCircle
} from 'lucide-react';

const features = [
  {
    id: 'sessions',
    path: '/gestion/caisse/sessions',
    label: 'Sessions',
    icon: Coins,
    description: 'Gérer les sessions de caisse',
    color: '#1E3A5F',
    bgColor: 'rgba(30,58,95,0.08)',
    badge: 'Actives',
  },
  {
    id: 'ventes',
    path: '/gestion/caisse/ventes',
    label: 'Ventes',
    icon: Receipt,
    description: 'Historique des ventes',
    color: '#2F9E44',
    bgColor: 'rgba(47,158,68,0.08)',
    badge: null,
  },
  {
    id: 'nouvelle-vente',
    path: '/gestion/caisse/ventes/nouvelle',
    label: 'Nouvelle vente',
    icon: PlusCircle,
    description: 'Enregistrer une vente',
    color: '#E03131',
    bgColor: 'rgba(224,49,49,0.08)',
    badge: 'Urgent',
  },
  {
    id: 'rapports',
    path: '/gestion/caisse/rapports',
    label: 'Rapports',
    icon: BarChart,
    description: 'Statistiques et analyses',
    color: '#E8A33D',
    bgColor: 'rgba(232,163,61,0.08)',
    badge: null,
  },
];

export const CaissePage: React.FC = () => {
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <LayoutDashboard size={28} />
          </span>
          Module Caisse
        </h1>
        <p className="mt-1 text-[var(--color-textSecondary)] text-sm">
          Gérez vos sessions de caisse, enregistrez les ventes et consultez les rapports.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-5">
        {features.map((feature) => {
          const Icon = feature.icon;
          return (
            <Link key={feature.id} to={feature.path} className="block">
              <MotionBox
                type="card"
                variant="medium"
                className="h-full p-5 rounded-2xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col relative overflow-hidden"
                style={{
                  proprietes: {
                    borderLeft: `4px solid ${feature.color}`,
                    transition: 'all 0.25s ease',
                  } as any,
                }}
                animation={{
                  declenchees: [{ trigger: 'hover', animation: 'liftHover' }],
                }}
              >
                <div
                  className="absolute top-0 left-0 right-0 h-1"
                  style={{ backgroundColor: feature.color }}
                />

                <div className="flex items-start justify-between mb-3">
                  <div
                    className="p-3 rounded-xl"
                    style={{ backgroundColor: feature.bgColor, color: feature.color }}
                  >
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                  {feature.badge && (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full text-white"
                      style={{ backgroundColor: feature.color }}
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
                  {feature.label}
                </h3>
                <p className="text-sm text-[var(--color-textSecondary)] mt-1 flex-1">
                  {feature.description}
                </p>

                <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: feature.color }}>
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
    </div>
  );
};

export default CaissePage;
