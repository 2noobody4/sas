import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { useRapportInventaire } from '../../../hooks/useInventaire';
import { ArrowLeft, Package, CheckCircle, AlertTriangle, TrendingUp, TrendingDown, FileText, Printer } from 'lucide-react';

interface RouteParams {
  id: string;
}

export const RapportInventairePage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { session, lignes, totalProduits, comptes, avecEcart, sansEcart, ecartTotal, isLoading } = useRapportInventaire(id);

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  if (!session) {
    return <div className="p-6 text-center text-[var(--color-danger)]">Session introuvable</div>;
  }

  const getEcartColor = (ecart: number) => {
    if (ecart > 0) return 'text-[var(--color-success)]';
    if (ecart < 0) return 'text-[var(--color-danger)]';
    return 'text-[var(--color-textSecondary)]';
  };

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="p-6 max-w-7xl mx-auto print:p-0">
      <div className="flex items-center justify-between mb-6 print:hidden">
        <div className="flex items-center gap-3">
          <button onClick={() => history.push('/gestion/stocks/inventaire')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
            <ArrowLeft size={24} />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Rapport d'inventaire</h1>
            <p className="text-sm text-[var(--color-textSecondary)]">
              Session: {session.nom || 'Sans nom'} · {new Date(session.date_debut).toLocaleDateString()}
              {session.date_fin && ` · Clôturé le ${new Date(session.date_fin).toLocaleDateString()}`}
            </p>
          </div>
        </div>
        <button
          onClick={handlePrint}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition print:hidden"
        >
          <Printer size={18} /> Imprimer
        </button>
      </div>

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <Package size={28} className="mx-auto text-[var(--color-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{totalProduits}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Total produits</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <CheckCircle size={28} className="mx-auto text-[var(--color-success)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{comptes}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Comptés</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <AlertTriangle size={28} className="mx-auto text-[var(--color-warning)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{avecEcart}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Avec écart</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <CheckCircle size={28} className="mx-auto text-[var(--color-success)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{sansEcart}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Sans écart</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <div className={`text-2xl font-bold ${getEcartColor(ecartTotal)}`}>
            {ecartTotal.toLocaleString()}
          </div>
          <p className="text-sm text-[var(--color-textSecondary)]">Écart total</p>
        </MotionBox>
      </div>

      {/* Note sur l'écart */}
      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 mb-6 print:bg-gray-50">
        <p className="text-sm text-blue-700 print:text-gray-700">
          ℹ️ L'écart est calculé ainsi : <br />
          <strong>Écart = Quantité théorique - Quantité réelle</strong>
        </p>
      </div>

      {/* Tableau détaillé */}
      <MotionBox type="card" variant="elevated" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)] flex items-center justify-between">
          <h3 className="font-semibold text-[var(--color-textPrimary)]">📋 Détail des écarts</h3>
          <span className="text-sm text-[var(--color-textSecondary)]">{lignes.length} produits</span>
        </div>
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Produit</th>
                <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Référence</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Quantité théorique</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Quantité réelle</th>
                <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Écart</th>
                <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
              </tr>
            </thead>
            <tbody>
              {lignes.map((ligne) => {
                const ecart = ligne.ecart ?? 0;
                const isEcart = ecart !== 0;
                return (
                  <tr key={ligne.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {ligne.produit?.nom || 'Produit inconnu'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {ligne.produit?.reference || '-'}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                      {ligne.quantite_theorique}
                    </td>
                    <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                      {ligne.quantite_reelle ?? '-'}
                    </td>
                    <td className="px-4 py-3 text-right font-medium">
                      <span className={isEcart ? (ecart > 0 ? 'text-[var(--color-success)]' : 'text-[var(--color-danger)]') : 'text-[var(--color-textSecondary)]'}>
                        {ecart > 0 ? '+' : ''}{ecart}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      {isEcart ? (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-[var(--color-warning)]">
                          ⚠️ Écart
                        </span>
                      ) : (
                        <span className="px-2 py-1 rounded-full text-xs font-medium text-white bg-[var(--color-success)]">
                          ✅ OK
                        </span>
                      )}
                    </td>
                  </tr>
                );
              })}
              {lignes.length === 0 && (
                <tr>
                  <td colSpan={6} className="px-4 py-8 text-center text-[var(--color-textSecondary)]">
                    Aucune ligne d'inventaire
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot style={{ backgroundColor: 'var(--color-secondary)' }}>
              <tr className="border-t-2 border-[var(--color-borderColor)] font-semibold">
                <td colSpan={4} className="px-4 py-3 text-right text-[var(--color-textPrimary)]">Total écart</td>
                <td className="px-4 py-3 text-right text-[var(--color-textPrimary)]">
                  <span className={getEcartColor(ecartTotal)}>
                    {ecartTotal > 0 ? '+' : ''}{ecartTotal.toLocaleString()}
                  </span>
                </td>
                <td></td>
              </tr>
            </tfoot>
          </table>
        </div>
      </MotionBox>

      {/* Pied de page pour l'impression */}
      <div className="mt-6 text-center text-xs text-[var(--color-textSecondary)] print:block hidden">
        <p>Rapport généré par APP PME V3 - {new Date().toLocaleString()}</p>
      </div>
    </div>
  );
};

export default RapportInventairePage;
