import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useBilan } from '../../hooks/useComptabilite';
import { Calendar } from 'lucide-react';

export const BilanPage: React.FC = () => {
  const [date, setDate] = useState(new Date().toISOString().split('T')[0]);
  const { data: bilan, isLoading } = useBilan(date);

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!bilan) return <div className="p-6 text-center text-[var(--color-danger)]">Erreur de chargement</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">⚖️ Bilan comptable</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Situation patrimoniale au {new Date(date).toLocaleDateString()}</p>
        </div>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--color-textSecondary)]" />
          <input
            type="date"
            value={date}
            onChange={(e) => setDate(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4">📊 Actif</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Immobilisations</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.actif.immobilisations.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Stocks</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.actif.stocks.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Créances</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.actif.creances.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Trésorerie</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.actif.tresorerie.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 bg-[var(--color-secondary)] rounded font-bold">
              <span className="text-[var(--color-textPrimary)]">Total Actif</span>
              <span className="text-[var(--color-primary)]">{bilan.actif.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-4">📉 Passif</h3>
          <div className="space-y-3">
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Capitaux propres</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.passif.capitaux_propres.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Dettes financières</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.passif.dettes_financieres.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 border-b border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textSecondary)]">Dettes circulantes</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{bilan.passif.dettes_circulantes.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between p-2 bg-[var(--color-secondary)] rounded font-bold">
              <span className="text-[var(--color-textPrimary)]">Total Passif</span>
              <span className="text-[var(--color-primary)]">{bilan.passif.total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </MotionBox>
      </div>
    </div>
  );
};

export default BilanPage;
