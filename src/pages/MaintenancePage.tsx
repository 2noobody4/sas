import React from 'react';
import { MotionBox } from '../components/ui/MotionBox';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from '../hooks/useAuth';

export const MaintenancePage: React.FC = () => {
  const config = useConfig();
  const { user } = useAuth();
  const appName = config.storeName || 'App PME';

  const isAdmin = user?.role?.nom === 'admin' || user?.role?.nom === 'gestionnaire';
  if (isAdmin) return null;

  return (
    <MotionBox
      as="div"
      type="page"
      variant="default"
      className="min-h-screen flex items-center justify-center p-6 bg-[var(--color-background)] text-[var(--color-textPrimary)]"
    >
      <div className="max-w-md w-full text-center space-y-6">
        <div className="text-6xl mb-4">🔧</div>
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)]">
          Maintenance en cours
        </h1>
        <p className="text-lg text-[var(--color-textSecondary)]">
          {appName} est actuellement en maintenance.
          <br />
          Nous revenons très bientôt.
        </p>
        {config.logo_url && (
          <div className="flex justify-center mt-4">
            <img src={config.logo_url} alt="Logo" className="h-16 w-auto" />
          </div>
        )}
        <p className="text-sm text-[var(--color-textSecondary)]">
          Pour toute urgence, contactez le support.
        </p>
      </div>
    </MotionBox>
  );
};

export default MaintenancePage;
