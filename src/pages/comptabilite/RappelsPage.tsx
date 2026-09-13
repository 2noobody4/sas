import React from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useFacturesARegler } from '../../hooks/useFactures';
import { AlertCircle, Calendar, DollarSign } from 'lucide-react';

export const RappelsPage: React.FC = () => {
  const { data: factures = [], isLoading } = useFacturesARegler();

  const totalAPayer = factures.reduce((acc, f) => acc + f.montant_ttc, 0);

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <AlertCircle size={32} className="text-[var(--color-danger)]" />
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🔔 Rappels de paiement</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Factures fournisseurs à régler avant le 26 du mois prochain
          </p>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Nombre de factures</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{factures.length}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Total à payer</p>
          <p className="text-2xl font-bold text-[var(--color-danger)]">{totalAPayer.toLocaleString()} FCFA</p>
        </MotionBox>
      </div>

      {factures.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune facture à régler avant le 26 du mois prochain. ✅
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Numéro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Fournisseur</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Montant TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Échéance</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {factures.map((f) => {
                  const estEnRetard = new Date(f.date_echeance!) < new Date();
                  return (
                    <tr key={f.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-3 text-sm font-mono text-[var(--color-textPrimary)]">{f.numero}</td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{f.fournisseur_client_nom || '-'}</td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                        {f.montant_ttc.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-center text-sm">
                        <span className={estEnRetard ? 'text-[var(--color-danger)]' : 'text-[var(--color-textSecondary)]'}>
                          {f.date_echeance ? new Date(f.date_echeance).toLocaleDateString() : '-'}
                          {estEnRetard && ' ⚠️'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                          f.statut === 'payee' ? 'bg-[var(--color-success)]' :
                          f.statut === 'en_retard' ? 'bg-[var(--color-danger)]' :
                          'bg-[var(--color-warning)]'
                        }`}>
                          {f.statut === 'payee' ? 'Payée' :
                           f.statut === 'en_retard' ? 'En retard' :
                           'À payer'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default RappelsPage;
