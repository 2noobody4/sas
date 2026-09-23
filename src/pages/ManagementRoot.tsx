import React, { useMemo } from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { MODULES_REGISTRY } from '../registres/modulesRegistry';
import { resolveLucideIcon } from '../registres/lucideRegistry';
import { useAuth } from '../hooks/useAuth';
import { LayoutDashboard } from 'lucide-react';
import type { ModuleDefinition } from '../registres/modulesTypes';

export const ManagementRoot: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.nom || 'client';
  const isAdmin = role === 'admin' || role === 'gestionnaire';

  // ✅ Calcul DIRECT depuis le registry (sans useNavigation)
  const modules: ModuleDefinition[] = useMemo(() => {
    return MODULES_REGISTRY.filter((m) => {
      if (m.visible === false) return false;
      if (m.isManagement !== true) return false;
      if (m.isSidebarItem === false) return false;
      return true;
    }).sort((a, b) => (a.order ?? 0) - (b.order ?? 0));
  }, []);


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
          Accédez rapidement à tous les outils de gestion.
        </p>
        <p className="text-xs text-[var(--color-textSecondary)] mt-1">
          Rôle : <span className="font-medium text-[var(--color-primary)] capitalize">{role}</span>
          {' · '}
          {modules.length} module(s)
          {isAdmin && ' (admin)'}
        </p>
      </div>

      {modules.length === 0 ? (
        <div className="text-center p-12 text-[var(--color-textSecondary)]">
          <p className="text-lg font-medium">Aucun module de gestion</p>
          <p className="text-xs mt-2 font-mono">
            Registry total : {MODULES_REGISTRY.length} modules
          </p>
          <p className="text-xs mt-2 font-mono">
            isManagement=true : {MODULES_REGISTRY.filter(m => m.isManagement === true).length}
          </p>
          <p className="text-xs mt-2 font-mono">
            isSidebarItem !== false : {MODULES_REGISTRY.filter(m => m.isSidebarItem !== false).length}
          </p>
        </div>
      ) : (
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
          {modules.map((mod) => {
            const Icon = resolveLucideIcon(mod.icon);
            return (
              <Link key={mod.id} to={mod.path} className="block">
                <MotionBox
                  type="card"
                  variant="medium"
                  className="h-full p-5 rounded-2xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col relative overflow-hidden"
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
                    <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                    </svg>
                  </div>
                </MotionBox>
              </Link>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default ManagementRoot;
