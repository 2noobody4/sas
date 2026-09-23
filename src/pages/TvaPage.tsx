import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useEtatTva, LigneTva } from '../hooks/useComptabiliteRapports';
import { Calendar } from 'lucide-react';

const inputCls =
  'px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]';

const fmt = (n: number) => Math.round(n).toLocaleString();
const pad = (n: number) => (n < 10 ? '0' + n : '' + n);
const iso = (d: Date) => `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
const somme = (l: LigneTva[]) => l.reduce((acc, x) => acc + x.tva, 0);

const TableTva: React.FC<{ titre: string; lignes: LigneTva[] }> = ({ titre, lignes }) => (
  <MotionBox type="card" variant="elevated" className="overflow-hidden">
    <div className="px-4 py-3 border-b border-[var(--color-borderColor)] font-semibold text-[var(--color-textPrimary)]">
      {titre} ({lignes.length})
    </div>
    <div className="overflow-x-auto">
      <table className="w-full">
        <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
          <tr>
            <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-textPrimary)]">Date</th>
            <th className="px-3 py-2 text-left text-xs font-semibold text-[var(--color-textPrimary)]">Pièce / Tiers</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--color-textPrimary)]">HT</th>
            <th className="px-3 py-2 text-right text-xs font-semibold text-[var(--color-textPrimary)]">TVA</th>
            <th className="px-3 py-2 text-center text-xs font-semibold text-[var(--color-textPrimary)]">Source</th>
          </tr>
        </thead>
        <tbody>
          {lignes.length === 0 && (
            <tr>
              <td colSpan={5} className="px-3 py-6 text-center text-sm text-[var(--color-textSecondary)]">
                Aucune opération avec TVA sur la période.
              </td>
            </tr>
          )}
          {lignes.map((l) => (
            <tr key={l.key} className="border-t border-[var(--color-borderColor)]">
              <td className="px-3 py-2 text-sm text-[var(--color-textSecondary)]">{new Date(l.date).toLocaleDateString()}</td>
              <td className="px-3 py-2 text-sm text-[var(--color-textPrimary)]">
                {l.reference}
                {l.tiers ? <span className="block text-xs text-[var(--color-textSecondary)]">{l.tiers}</span> : null}
              </td>
              <td className="px-3 py-2 text-right text-sm text-[var(--color-textPrimary)]">{fmt(l.ht)}</td>
              <td className="px-3 py-2 text-right text-sm font-medium text-[var(--color-textPrimary)]">{fmt(l.tva)}</td>
              <td className="px-3 py-2 text-center text-xs text-[var(--color-textSecondary)]">
                {l.source === 'saisie' ? 'Saisie' : 'Facture'}
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  </MotionBox>
);

export const TvaPage: React.FC = () => {
  const now = new Date();
  const [dateDebut, setDateDebut] = useState(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`);
  const [dateFin, setDateFin] = useState(iso(now));
  const [incSaisies, setIncSaisies] = useState(true);
  const [incFactures, setIncFactures] = useState(true);

  const { data, isLoading, isError, error } = useEtatTva(dateDebut, dateFin);

  const moisCourant = () => {
    setDateDebut(`${now.getFullYear()}-${pad(now.getMonth() + 1)}-01`);
    setDateFin(iso(now));
  };
  const moisPrecedent = () => {
    setDateDebut(iso(new Date(now.getFullYear(), now.getMonth() - 1, 1)));
    setDateFin(iso(new Date(now.getFullYear(), now.getMonth(), 0)));
  };

  const lignes = ((data && data.lignes) || []).filter((l) =>
    l.source === 'saisie' ? incSaisies : incFactures
  );
  const collectees = lignes.filter((l) => l.sens === 'collectee');
  const deductibles = lignes.filter((l) => l.sens === 'deductible');
  const totalCollectee = somme(collectees);
  const totalDeductible = somme(deductibles);
  const net = totalCollectee - totalDeductible;
  const ecr = data ? data.ecritures : { tva_collectee_447: 0, tva_445: 0 };
  const aucuneEcriture = ecr.tva_collectee_447 === 0 && ecr.tva_445 === 0;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🧾 État de TVA</h1>
        <p className="text-sm text-[var(--color-textSecondary)]">
          TVA collectée − TVA déductible sur la période (base de la déclaration)
        </p>
      </div>

      <div className="flex flex-wrap items-center gap-3 mb-4">
        <div className="flex items-center gap-2">
          <Calendar size={18} className="text-[var(--color-textSecondary)]" />
          <input type="date" value={dateDebut} onChange={(e) => setDateDebut(e.target.value)} className={inputCls} />
          <span className="text-[var(--color-textSecondary)]">à</span>
          <input type="date" value={dateFin} onChange={(e) => setDateFin(e.target.value)} className={inputCls} />
        </div>
        <button type="button" onClick={moisCourant} className={inputCls}>Mois en cours</button>
        <button type="button" onClick={moisPrecedent} className={inputCls}>Mois précédent</button>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 text-sm text-[var(--color-textPrimary)]">
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={incSaisies} onChange={(e) => setIncSaisies(e.target.checked)} />
          Inclure les saisies comptables
        </label>
        <label className="flex items-center gap-2">
          <input type="checkbox" checked={incFactures} onChange={(e) => setIncFactures(e.target.checked)} />
          Inclure les factures
        </label>
      </div>

      {isLoading && <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>}
      {isError && (
        <div className="p-6 text-center text-[var(--color-danger)]">
          Erreur de chargement{error instanceof Error ? ` : ${error.message}` : ''}
        </div>
      )}

      {data && (
        <>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
            <MotionBox type="card" variant="default" className="p-4 text-center">
              <p className="text-sm text-[var(--color-textSecondary)]">TVA collectée</p>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{fmt(totalCollectee)} FCFA</p>
            </MotionBox>
            <MotionBox type="card" variant="default" className="p-4 text-center">
              <p className="text-sm text-[var(--color-textSecondary)]">TVA déductible</p>
              <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{fmt(totalDeductible)} FCFA</p>
            </MotionBox>
            <MotionBox type="card" variant="elevated" className="p-4 text-center">
              <p className="text-sm text-[var(--color-textSecondary)]">
                {net >= 0 ? 'TVA à décaisser' : 'Crédit de TVA à reporter'}
              </p>
              <p className="text-2xl font-bold text-[var(--color-primary)]">{fmt(Math.abs(net))} FCFA</p>
            </MotionBox>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
            <TableTva titre="TVA collectée (ventes / factures émises)" lignes={collectees} />
            <TableTva titre="TVA déductible (achats, dépenses / factures reçues)" lignes={deductibles} />
          </div>

          <MotionBox type="card" variant="default" className="p-4 text-sm text-[var(--color-textSecondary)] space-y-2">
            <p>
              <strong className="text-[var(--color-textPrimary)]">Sources :</strong> saisies comptables (montant
              « taxe ») et factures (montant « TVA »). Si une même facture existe à la fois dans « Saisie
              simplifiée » et dans « Factures », elle sera comptée deux fois : décochez l'une des deux sources
              ou vérifiez le détail ci-dessus.
            </p>
            <p>
              <strong className="text-[var(--color-textPrimary)]">Écritures comptables (rapprochement) :</strong>{' '}
              447000 TVA collectée : {fmt(ecr.tva_collectee_447)} FCFA · 445000 TVA à décaisser :{' '}
              {fmt(ecr.tva_445)} FCFA (net créditeur sur la période).
            </p>
            {aucuneEcriture && (
              <p>
                Aucune écriture sur 447000 / 445000 : la TVA n'est pas ventilée dans les écritures (les
                opérations sont comptabilisées TTC), l'état ci-dessus repose donc uniquement sur les documents.
              </p>
            )}
          </MotionBox>
        </>
      )}
    </div>
  );
};

export default TvaPage;
