import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useTransactions } from '../../hooks/useComptabilite';
import { Filter, Search, Calendar } from 'lucide-react';

export const JournalPage: React.FC = () => {
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');
  const [typeFiltre, setTypeFiltre] = useState('');
  const { data: transactions = [], isLoading } = useTransactions({ date_debut: dateDebut, date_fin: dateFin, type: typeFiltre });

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📖 Journal (Livre d'or)</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Chronologie des opérations comptables</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--color-textSecondary)]" />
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
          <span className="text-[var(--color-textSecondary)]">à</span>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <select
          value={typeFiltre}
          onChange={(e) => setTypeFiltre(e.target.value)}
          className="px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous types</option>
          <option value="vente">Vente</option>
          <option value="achat">Achat</option>
          <option value="depense">Dépense</option>
          <option value="salaire">Salaire</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {transactions.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune transaction enregistrée.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Libellé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Compte débit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Compte crédit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Montant</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                </tr>
              </thead>
              <tbody>
                {transactions.map((t) => (
                  <tr key={t.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(t.date_transaction).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{t.libelle}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{t.compte_debit?.numero} - {t.compte_debit?.nom}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{t.compte_credit?.numero} - {t.compte_credit?.nom}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {t.montant.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-[var(--color-primary)]">
                        {t.type}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default JournalPage;
