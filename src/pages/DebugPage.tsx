// ============================================================
// DEBUG PAGE — Console de débogage intégrée
// Version V3 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { DebugConsole } from '../components/DebugConsole';
import { useAuth } from '../hooks/useAuth';
import { useUserModules } from '../hooks/useUserModules';
import { useNavigation } from '../hooks/useNavigationMenu';
import { useConfig } from '../contexts/ConfigContext';
import { MODULES_REGISTRY } from '../registres/modulesRegistry';

export const DebugPage: React.FC = () => {
  const { user } = useAuth();
  const { data: assignedModuleIds = [] } = useUserModules(user?.id);
  const role = user?.role?.nom || 'client';
  const { navItems, sidebarItems } = useNavigation({ role, assignedModuleIds });
  const config = useConfig();
  const [showConsole, setShowConsole] = useState(false);

  const adminModuleIds = MODULES_REGISTRY
    .filter((m) => m.isManagement && m.isSidebarItem !== false)
    .map((m) => m.id);

  return (
    <div className="p-4 max-w-4xl mx-auto space-y-4 pb-24">
      <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🛠️ Debug</h1>

      <MotionBox type="card" variant="default" className="p-4">
        <h2 className="font-semibold mb-2 text-[var(--color-textPrimary)]">👤 Utilisateur</h2>
        <div className="space-y-1 text-sm font-mono text-[var(--color-textPrimary)] break-all">
          <div>role : <b>{role}</b></div>
          <div>user_id : {user?.id || 'NONE'}</div>
          <div>email : {user?.email || 'NONE'}</div>
          <div>role_id : {user?.role?.id || 'NONE'}</div>
          <div>isAdmin : <b>{String(role === 'admin' || role === 'gestionnaire')}</b></div>
        </div>
      </MotionBox>

      <MotionBox type="card" variant="default" className="p-4">
        <h2 className="font-semibold mb-2 text-[var(--color-textPrimary)]">
          📦 Modules assignés ({assignedModuleIds.length})
        </h2>
        <div className="text-xs font-mono break-all text-[var(--color-textSecondary)]">
          {assignedModuleIds.length === 0 ? 'AUCUN' : assignedModuleIds.join(', ')}
        </div>
      </MotionBox>

      <MotionBox type="card" variant="default" className="p-4">
        <h2 className="font-semibold mb-2 text-[var(--color-textPrimary)]">
          📚 Registry ({MODULES_REGISTRY.length} modules)
        </h2>
        <div className="text-xs text-[var(--color-textSecondary)]">
          Modules admin (isManagement + isSidebarItem) : <b>{adminModuleIds.length}</b>
        </div>
        <div className="text-xs font-mono break-all text-[var(--color-textSecondary)] mt-1">
          {adminModuleIds.slice(0, 10).join(', ')}{adminModuleIds.length > 10 ? '...' : ''}
        </div>
      </MotionBox>

      <MotionBox type="card" variant="default" className="p-4">
        <h2 className="font-semibold mb-2 text-[var(--color-textPrimary)]">
          🧭 Navbar ({navItems.length})
        </h2>
        <div className="space-y-1 text-xs font-mono text-[var(--color-textPrimary)]">
          {navItems.length === 0 ? (
            <div className="text-[var(--color-danger)]">VIDE</div>
          ) : (
            navItems.map((item) => (
              <div key={item.id}>• {item.id} → {item.label} ({item.path})</div>
            ))
          )}
        </div>
      </MotionBox>

      <MotionBox type="card" variant="default" className="p-4">
        <h2 className="font-semibold mb-2 text-[var(--color-textPrimary)]">
          📋 Sidebar ({sidebarItems.length})
        </h2>
        <div className="space-y-1 text-xs font-mono text-[var(--color-textPrimary)]">
          {sidebarItems.length === 0 ? (
            <div className="text-[var(--color-danger)]">VIDE</div>
          ) : (
            sidebarItems.map((item) => (
              <div key={item.id}>• {item.id} → {item.label} ({item.path})</div>
            ))
          )}
        </div>
      </MotionBox>

      <MotionBox type="card" variant="default" className="p-4">
        <h2 className="font-semibold mb-2 text-[var(--color-textPrimary)]">⚙️ Config</h2>
        <div className="text-xs font-mono text-[var(--color-textPrimary)] space-y-1">
          <div>loaded : <b>{String(config.loaded)}</b></div>
          <div>loading : {String(config.loading)}</div>
          <div>error : {config.error || 'none'}</div>
          <div>storeName : {config.storeName}</div>
        </div>
      </MotionBox>

      <button
        onClick={() => setShowConsole(true)}
        className="w-full px-4 py-3 rounded-xl bg-[var(--color-primary)] text-white font-medium"
      >
        📜 Ouvrir la console de logs
      </button>

      <DebugConsole
        isOpen={showConsole}
        onClose={() => setShowConsole(false)}
      />
    </div>
  );
};

export default DebugPage;
