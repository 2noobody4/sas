import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useComptes } from '../hooks/useComptabilite';
import { useGrandLivre } from '../hooks/useComptabiliteRapports';
import { Calendar } from 'lucide-react';

const inputCls =
  'px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]';

const fmt = (n: number) => Math.round(n).toLocaleString();

// Affiche un solde avec son sens (D/C). Un solde negatif = sens oppose au sens naturel.
const fmtSolde = (solde: number, sens: 'debit' | 'credit') => {
  const lettre = solde >= 0 ? (sens === 'debit' ? 'D' : 'C') : sens === 'debit' ? 'C' : 'D';
  return `${fmt(Math.abs(solde))} ${lettre}`;
};

export const GrandLivrePage: React.FC = () => {
  const [compteId, setCompteId] = useState('');
  const [dateDebut, setDateDebut] = useState(`${new Date().getFullYear()}-01-01`);
  const [dateFin, setDateFin] = useState(new Date().toISOString().split('T')[0]);

  const { data: comptes = [] } = useComptes(true);
  const { data: gl, isLoading, isError, error } = useGrandLivre(compteId || undefined, dateDebut, dateFin);

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📚 Grand Livre</h1>
        <p className="text-sm text-[var(--color-textSecondary)]">
          Mouvements et solde courant d'un compte
        </p>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <select
          value={compteId}
          onChange={(e) => setCompteId(e.target.value)}
          className={inputCls}
          style={{ minWidth: 240 }}
        >
          <option value="">— Choisir un compte —</option>
          {comptes.map((c) => (
            <option key={c.id} value={c.id}>
              {c.numero} - {c.nom}
            </option>
          ))}
        </select>
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--color-textSecondary)]" />
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className={inputCls} />
          <span className="text-[var(--color-textSecondary)]">à</span>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className={inputCls} />
        </div>
      </div>

      {!compteId && (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Sélectionnez un compte pour afficher son grand livre.
        </MotionBox>
      )}

      {compteId && isLoading && (
        <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>
      )}

      {compteId && isError && (
        <div className="p-6 text-center text-[var(--color-danger)]">
          Erreur de chargement{error instanceof Error ? ` : ${error.message}` : ''}
        </div>
      )}

      {gl && (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="px-4 py-3 border-b border-[var(--color-borderColor)]">
            <div className="font-semibold text-[var(--color-textPrimary)]">
              {gl.compte.numero} - {gl.compte.nom}
            </div>
            <div className="text-xs text-[var(--color-textSecondary)]">
              Compte à solde naturellement {gl.sens === 'debit' ? 'débiteur' : 'créditeur'} · D = débiteur, C = créditeur
            </div>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Libellé</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Contrepartie</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Débit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Crédit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Solde</th>
                </tr>
              </thead>
              <tbody>
                <tr className="border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)]/40">
                  <td className="px-4 py-2 text-sm text-[var(--color-textSecondary)]" colSpan={5}>
                    Solde à l'ouverture (avant le {new Date(dateDebut).toLocaleDateString()})
                  </td>
                  <td className="px-4 py-2 text-right text-sm font-medium text-[var(--color-textPrimary)]">
                    {fmtSolde(gl.soldeOuverture, gl.sens)}
                  </td>
                </tr>
                {gl.lignes.length === 0 && (
                  <tr className="border-t border-[var(--color-borderColor)]">
                    <td className="px-4 py-6 text-center text-sm text-[var(--color-textSecondary)]" colSpan={6}>
                      Aucun mouvement sur la période.
                    </td>
                  </tr>
                )}
                {gl.lignes.map((l) => (
                  <tr key={l.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(l.date).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">
                      {l.libelle}
                      {l.reference ? (
                        <span className="block text-xs text-[var(--color-textSecondary)]">Réf : {l.reference}</span>
                      ) : null}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{l.contrepartie}</td>
                    <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                      {l.debit ? fmt(l.debit) : ''}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                      {l.credit ? fmt(l.credit) : ''}
                    </td>
                    <td className="px-4 py-3 text-right text-sm font-medium text-[var(--color-textPrimary)]">
                      {fmtSolde(l.solde, gl.sens)}
                    </td>
                  </tr>
                ))}
                <tr className="border-t-2 border-[var(--color-borderColor)] bg-[var(--color-secondary)] font-bold">
                  <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]" colSpan={3}>
                    Totaux de la période / Solde final
                  </td>
                  <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">{fmt(gl.totalDebit)}</td>
                  <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">{fmt(gl.totalCredit)}</td>
                  <td className="px-4 py-3 text-right text-sm text-[var(--color-primary)]">
                    {fmtSolde(gl.soldeFinal, gl.sens)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default GrandLivrePage;
