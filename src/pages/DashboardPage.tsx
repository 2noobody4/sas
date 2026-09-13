import React from 'react';
import { MotionBox } from '../components/ui/MotionBox';

export const DashboardPage: React.FC = () => {
  // Statistiques factices (à remplacer par des données réelles)
  const stats = [
    { label: 'Produits', value: 156, icon: '📦' },
    { label: 'Ventes aujourd\'hui', value: 12, icon: '🛒' },
    { label: 'Clients', value: 89, icon: '👤' },
    { label: 'CA mensuel', value: '12 450 €', icon: '💰' },
  ];

  return (
    <MotionBox as="div" type="card" variant="xlarge" className="p-6">
      <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
        📊 Tableau de bord
      </h1>
      <p className="text-sm text-[var(--color-textSecondary)] mt-1">
        Bienvenue dans l'espace de gestion.
      </p>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mt-6">
        {stats.map((stat, idx) => (
          <MotionBox
            key={idx}
            type="card"
            variant="medium"
            className="p-4 text-center"
          >
            <div className="text-3xl">{stat.icon}</div>
            <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">
              {stat.value}
            </p>
            <p className="text-sm text-[var(--color-textSecondary)]">{stat.label}</p>
          </MotionBox>
        ))}
      </div>
    </MotionBox>
  );
};
export default DashboardPage;
