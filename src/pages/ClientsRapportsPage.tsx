import React from 'react';
import { MotionBox } from '../components/MotionBox';
import { useClients, useClientStats } from '../hooks/useClients';
import { NiveauFidelite } from '../types/clients';
import { Users, UserCheck, UserX, Star, BarChart, PieChart } from 'lucide-react';

const niveauColors: Record<NiveauFidelite, string> = {
  bronze: '#CD7F32',
  argent: '#C0C0C0',
  or: '#FFD700',
  platine: '#E5E4E2',
  diamant: '#B9F2FF',
};

export const RapportsPage: React.FC = () => {
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const { data: stats, isLoading: statsLoading } = useClientStats();

  if (clientsLoading || statsLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  const total = clients.length;
  const actifs = clients.filter(c => c.actif).length;
  const inactifs = total - actifs;

  // Répartition par segment
  const segmentData: Record<string, number> = { A: 0, B: 0, C: 0, D: 0 };
  clients.forEach(c => {
    if (c.segment) segmentData[c.segment] = (segmentData[c.segment] || 0) + 1;
  });

  // Répartition par niveau
  const niveauData: Record<NiveauFidelite, number> = { bronze: 0, argent: 0, or: 0, platine: 0, diamant: 0 };
  clients.forEach(c => {
    if (c.niveau_fidelite) niveauData[c.niveau_fidelite] = (niveauData[c.niveau_fidelite] || 0) + 1;
  });

  const totalPoints = clients.reduce((acc, c) => acc + c.points_fidelite, 0);
  const pointsMoyen = total > 0 ? Math.round(totalPoints / total) : 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <BarChart size={32} className="text-[var(--color-primary)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Rapports clients</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Statistiques et analyses du portefeuille clients</p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <Users size={28} className="mx-auto text-[var(--color-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{total}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Total clients</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <UserCheck size={28} className="mx-auto text-[var(--color-success)]" />
          <p className="text-2xl font-bold text-[var(--color-success)] mt-2">{actifs}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Clients actifs</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <UserX size={28} className="mx-auto text-[var(--color-danger)]" />
          <p className="text-2xl font-bold text-[var(--color-danger)] mt-2">{inactifs}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Clients inactifs</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <Star size={28} className="mx-auto text-[var(--color-accent)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{pointsMoyen.toLocaleString()}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Points moyens</p>
        </MotionBox>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">📌 Répartition par segment</h3>
          <div className="space-y-2">
            {Object.entries(segmentData).map(([segment, count]) => (
              <div key={segment} className="flex items-center gap-2">
                <span className="w-8 text-sm font-medium text-[var(--color-textSecondary)]">{segment}</span>
                <div className="flex-1 h-4 rounded-full bg-[var(--color-secondary)] overflow-hidden">
                  <div
                    className="h-full rounded-full bg-[var(--color-primary)]"
                    style={{ width: `${total > 0 ? (count / total) * 100 : 0}%` }}
                  />
                </div>
                <span className="text-sm font-medium text-[var(--color-textPrimary)] w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">⭐ Répartition par niveau de fidélité</h3>
          <div className="space-y-2">
            {Object.entries(niveauData).map(([niveau, count]) => (
              <div key={niveau} className="flex items-center gap-2">
                <span
                  className="w-3 h-3 rounded-full flex-shrink-0"
                  style={{ backgroundColor: niveauColors[niveau as NiveauFidelite] || '#ccc' }}
                />
                <span className="flex-1 text-sm capitalize text-[var(--color-textPrimary)]">{niveau}</span>
                <span className="text-sm font-medium text-[var(--color-textPrimary)] w-12 text-right">{count}</span>
              </div>
            ))}
          </div>
        </MotionBox>
      </div>

      <div className="mt-6 grid grid-cols-1 md:grid-cols-3 gap-4">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Points totaux</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{totalPoints.toLocaleString()}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Taux d'activation</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{total > 0 ? Math.round((actifs / total) * 100) : 0}%</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Nombre de segments</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{Object.keys(segmentData).filter(k => segmentData[k] > 0).length}</p>
        </MotionBox>
      </div>
    </div>
  );
};

export default RapportsPage;
