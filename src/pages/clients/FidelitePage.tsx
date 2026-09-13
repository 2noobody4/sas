import React from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useClients } from '../../hooks/useClients';
import { NiveauFidelite } from '../../types/clients';
import { Trophy, Star, Crown, Gem, Medal } from 'lucide-react';

const niveauConfig: Record<NiveauFidelite, { label: string; icon: any; color: string; bgColor: string; points_min: number; remise: number }> = {
  bronze: {
    label: 'Bronze',
    icon: Medal,
    color: '#CD7F32',
    bgColor: 'rgba(205,127,50,0.1)',
    points_min: 0,
    remise: 0,
  },
  argent: {
    label: 'Argent',
    icon: Star,
    color: '#C0C0C0',
    bgColor: 'rgba(192,192,192,0.1)',
    points_min: 500,
    remise: 5,
  },
  or: {
    label: 'Or',
    icon: Trophy,
    color: '#FFD700',
    bgColor: 'rgba(255,215,0,0.1)',
    points_min: 1500,
    remise: 10,
  },
  platine: {
    label: 'Platine',
    icon: Crown,
    color: '#E5E4E2',
    bgColor: 'rgba(229,228,226,0.1)',
    points_min: 3000,
    remise: 15,
  },
  diamant: {
    label: 'Diamant',
    icon: Gem,
    color: '#B9F2FF',
    bgColor: 'rgba(185,242,255,0.1)',
    points_min: 5000,
    remise: 20,
  },
};

export const FidelitePage: React.FC = () => {
  const { data: clients = [], isLoading } = useClients();

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  const stats = clients.reduce((acc, c) => {
    const niveau = c.niveau_fidelite;
    if (!acc[niveau]) acc[niveau] = { count: 0, points: 0 };
    acc[niveau].count++;
    acc[niveau].points += c.points_fidelite;
    return acc;
  }, {} as Record<NiveauFidelite, { count: number; points: number }>);

  const totalClients = clients.length;
  const totalPoints = clients.reduce((acc, c) => acc + c.points_fidelite, 0);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <Star size={32} className="text-[var(--color-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">⭐ Gestion de la fidélité</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Points et niveaux de fidélité des clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Total clients</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{totalClients}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Points cumulés</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{totalPoints.toLocaleString()}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Moyenne par client</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">
            {totalClients > 0 ? Math.round(totalPoints / totalClients).toLocaleString() : 0}
          </p>
        </MotionBox>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
        {Object.entries(niveauConfig).map(([key, config]) => {
          const Icon = config.icon;
          const stat = stats[key as NiveauFidelite] || { count: 0, points: 0 };
          return (
            <MotionBox
              key={key}
              type="card"
              variant="default"
              className="p-4 text-center"
              style={{
                proprietes: {
                  borderLeft: `4px solid ${config.color}`,
                } as any,
              }}
            >
              <div style={{ color: config.color }}>
                <Icon size={28} style={{ margin: '0 auto' }} />
              </div>
              <p className="text-lg font-bold text-[var(--color-textPrimary)]">{config.label}</p>
              <p className="text-sm text-[var(--color-textSecondary)]">{stat.count} clients</p>
              <p className="text-xs text-[var(--color-textSecondary)]">{stat.points.toLocaleString()} pts</p>
              <p className="text-xs font-medium" style={{ color: config.color }}>{config.remise}% remise</p>
            </MotionBox>
          );
        })}
      </div>

      <MotionBox type="card" variant="elevated" className="overflow-hidden">
        <h3 className="font-semibold text-[var(--color-textPrimary)] p-4 pb-0">📋 Clients par niveau</h3>
        <div className="overflow-x-auto p-4">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
              <tr>
                <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Client</th>
                <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Niveau</th>
                <th className="px-4 py-2 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Points</th>
                <th className="px-4 py-2 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Remise</th>
              </tr>
            </thead>
            <tbody>
              {clients
                .sort((a, b) => b.points_fidelite - a.points_fidelite)
                .slice(0, 20)
                .map((c) => {
                  const config = niveauConfig[c.niveau_fidelite];
                  return (
                    <tr key={c.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-2 text-sm font-medium text-[var(--color-textPrimary)]">
                        {c.nom} {c.prenom || ''}
                      </td>
                      <td className="px-4 py-2 text-sm">
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: config.color }}>
                          {config.label}
                        </span>
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-[var(--color-textPrimary)]">{c.points_fidelite.toLocaleString()}</td>
                      <td className="px-4 py-2 text-center text-sm">{config.remise}%</td>
                    </tr>
                  );
                })}
            </tbody>
          </table>
        </div>
      </MotionBox>
    </div>
  );
};

export default FidelitePage;
