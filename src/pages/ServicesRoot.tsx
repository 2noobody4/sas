// ============================================================
// SERVICES ROOT — Hub du module Services
// Version V2 — Fix route /nouveau + badge demandes en attente
// ============================================================

import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useDemandesEnAttenteCount } from '../hooks/useDemandesService';
import {
  LayoutDashboard, Briefcase, Tag, ClipboardList, BarChart, Users, Clock,
} from 'lucide-react';

export const ServicesRoot: React.FC = () => {
  const { data: demandesEnAttente = 0 } = useDemandesEnAttenteCount();

  const features = [
    {
      id: 'services',
      path: '/gestion/services/liste',
      label: 'Services',
      icon: Briefcase,
      description: 'Gérer le catalogue de services',
      color: '#1E3A5F',
      bgColor: 'rgba(30,58,95,0.08)',
      badge: undefined as string | undefined,
    },
    {
      id: 'categories',
      path: '/gestion/services/categories',
      label: 'Catégories',
      icon: Tag,
      description: 'Organiser les services par catégorie',
      color: '#1971C2',
      bgColor: 'rgba(25,113,194,0.08)',
      badge: undefined,
    },
    {
      id: 'attributs',
      path: '/gestion/services/attributs',
      label: 'Attributs',
      icon: ClipboardList,
      description: 'Champs à demander aux clients',
      color: '#6C5CE7',
      bgColor: 'rgba(108,92,231,0.08)',
      badge: undefined,
    },
    {
      id: 'demandes',
      path: '/gestion/services/demandes',
      label: 'Demandes',
      icon: Clock,
      description: 'Suivi des demandes de service',
      color: '#E8A33D',
      bgColor: 'rgba(232,163,61,0.08)',
      badge: demandesEnAttente > 0 ? `${demandesEnAttente} en attente` : undefined,
    },
  ];

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <LayoutDashboard size={28} />
          </span>
          Module Services
        </h1>
        <p className="mt-1 text-[var(--color-textSecondary)] text-sm">
          Gérez vos prestations, catégories, attributs et demandes clients.
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
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
                animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
              >
                <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: feature.color }} />
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl" style={{ backgroundColor: feature.bgColor, color: feature.color }}>
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                  {feature.badge && (
                    <span
                      className="text-xs font-medium px-2.5 py-1 rounded-full text-white animate-pulse"
                      style={{ backgroundColor: feature.color }}
                    >
                      {feature.badge}
                    </span>
                  )}
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">{feature.label}</h3>
                <p className="text-sm text-[var(--color-textSecondary)] mt-1 flex-1">{feature.description}</p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: feature.color }}>
                  Accéder
                  <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
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

export default ServicesRoot;
