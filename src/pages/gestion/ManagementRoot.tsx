import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { getManagementModules } from '../../registres/modulesRegistry';
import { resolveLucideIcon } from '../../registres/lucideRegistry';
import { useAuth } from '../../hooks/useAuth';
import { LayoutDashboard } from 'lucide-react';

export const ManagementRoot: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.nom || 'client';

  const modules = getManagementModules(role);
  const parentModules = modules.filter(m => m.isSidebarItem !== false);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <LayoutDashboard size={28} />
          </span>
          Modules de gestion
        </h1>
        <p className="mt-1 text-[var(--color-textSecondary)] text-sm">
          Accédez rapidement à tous les outils de gestion de votre entreprise.
        </p>
        <p className="text-xs text-[var(--color-textSecondary)] mt-1">
          Rôle actif : <span className="font-medium text-[var(--color-primary)] capitalize">{role}</span>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {parentModules.map((mod) => {
          const Icon = resolveLucideIcon(mod.icon);
          return (
            <Link key={mod.id} to={mod.path} className="block">
              <MotionBox
                type="card"
                variant="medium"
                className="h-full p-5 rounded-2xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col relative overflow-hidden"
                animation={{
                  declenchees: [{ trigger: 'hover', animation: 'liftHover' }],
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                </div>
                <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
                  {mod.label}
                </h3>
                <p className="text-sm text-[var(--color-textSecondary)] mt-1 flex-1">
                  {mod.description || 'Gestion du module'}
                </p>
                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
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

      {parentModules.length === 0 && (
        <div className="text-center p-12 text-[var(--color-textSecondary)]">
          <p>Aucun module de gestion disponible pour votre rôle.</p>
          <p className="text-sm mt-2">Contactez l'administrateur pour obtenir les droits nécessaires.</p>
        </div>
      )}
    </div>
  );
};

export default ManagementRoot;
