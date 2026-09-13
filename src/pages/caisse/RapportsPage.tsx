import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useVentes } from '../../hooks/useVentes';
import { useSessions } from '../../hooks/useSessions';
import { Calendar, TrendingUp, TrendingDown, Coins, FileText, Filter } from 'lucide-react';

export const RapportsPage: React.FC = () => {
  const { data: ventes = [], isLoading: ventesLoading } = useVentes();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  const ventesFiltrees = ventes.filter((v: any) => {
    if (dateDebut && new Date(v.date_vente) < new Date(dateDebut)) return false;
    if (dateFin && new Date(v.date_vente) > new Date(dateFin)) return false;
    return true;
  });

  const sessionsFermees = sessions.filter((s: any) => s.statut === 'fermee');
  const sessionsFiltrees = sessionsFermees.filter((s: any) => {
    const date = s.date_fermeture || s.date_ouverture;
    if (dateDebut && new Date(date) < new Date(dateDebut)) return false;
    if (dateFin && new Date(date) > new Date(dateFin)) return false;
    return true;
  });

  const getTotalVentesBySession = (sessionId: string) => {
    return ventes
      .filter((v: any) => v.session_id === sessionId && v.statut === 'validee')
      .reduce((acc: number, v: any) => acc + v.montant_total, 0);
  };

  const getEcartCalcule = (session: any) => {
    const totalVentes = getTotalVentesBySession(session.id);
    const ecart = session.fond_fermeture 
      ? session.fond_fermeture - (session.fond_ouverture + totalVentes)
      : null;
    return ecart;
  };

  const totalVentes = ventesFiltrees.reduce((acc: number, v: any) => acc + v.montant_total, 0);
  const nombreVentes = ventesFiltrees.length;
  const panierMoyen = nombreVentes > 0 ? totalVentes / nombreVentes : 0;

  const nbSessions = sessionsFiltrees.length;
  const ecartTotal = sessionsFiltrees.reduce((acc: number, s: any) => {
    const ecart = getEcartCalcule(s);
    return acc + (ecart || 0);
  }, 0);
  const fondTotalOuverture = sessionsFiltrees.reduce((acc: number, s: any) => acc + s.fond_ouverture, 0);
  const fondTotalFermeture = sessionsFiltrees.reduce((acc: number, s: any) => acc + (s.fond_fermeture || 0), 0);

  if (ventesLoading || sessionsLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  const getEcartColor = (ecart: number) => {
    if (ecart > 0) return 'text-[var(--color-success)]';
    if (ecart < 0) return 'text-[var(--color-danger)]';
    return 'text-[var(--color-textSecondary)]';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Rapports de caisse</h1>
        <span className="ml-auto text-sm text-[var(--color-textSecondary)]">
          {nbSessions} sessions, {nombreVentes} ventes
        </span>
      </div>

      <div className="flex flex-wrap gap-4 mb-6 p-4 rounded-xl bg-[var(--color-secondary)] border border-[var(--color-borderColor)]">
        <div className="flex items-center gap-2">
          <Filter size={18} className="text-[var(--color-textSecondary)]" />
          <span className="text-sm font-medium text-[var(--color-textPrimary)]">Filtrer par période</span>
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-textSecondary)]">Du</label>
          <input
            type="date"
            value={dateDebut}
            onChange={(e) => setDateDebut(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
          />
        </div>
        <div className="flex items-center gap-2">
          <label className="text-sm text-[var(--color-textSecondary)]">Au</label>
          <input
            type="date"
            value={dateFin}
            onChange={(e) => setDateFin(e.target.value)}
            className="px-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
          />
        </div>
        {(dateDebut || dateFin) && (
          <button
            onClick={() => { setDateDebut(''); setDateFin(''); }}
            className="px-3 py-1.5 rounded-lg text-sm text-[var(--color-primary)] hover:underline"
          >
            Réinitialiser
          </button>
        )}
      </div>

      <div className="p-3 rounded-xl bg-blue-50 border border-blue-200 mb-6">
        <p className="text-sm text-blue-700">
          ℹ️ L'écart est calculé ainsi : <br />
          <strong>Écart = Fond de fermeture - (Fond d'ouverture + Total des ventes)</strong>
        </p>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <Coins size={28} className="mx-auto text-[var(--color-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{totalVentes.toLocaleString()} FCFA</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Total des ventes</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <FileText size={28} className="mx-auto text-[var(--color-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{nombreVentes}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Nombre de ventes</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <TrendingUp size={28} className="mx-auto text-[var(--color-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{panierMoyen.toLocaleString()} FCFA</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Panier moyen</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <div className={`text-2xl font-bold ${getEcartColor(ecartTotal)}`}>
            {ecartTotal.toLocaleString()} FCFA
          </div>
          <p className="text-sm text-[var(--color-textSecondary)]">Écart total des sessions</p>
        </MotionBox>
      </div>

      {sessionsFiltrees.length > 0 && (
        <MotionBox type="card" variant="elevated" className="overflow-hidden mb-6">
          <div className="px-4 py-3 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
            <h3 className="font-semibold text-[var(--color-textPrimary)]">📋 Détail des sessions fermées</h3>
          </div>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date d'ouverture</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date de fermeture</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Fond d'ouverture</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Total ventes</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Fond de fermeture</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Écart</th>
                </tr>
              </thead>
              <tbody>
                {sessionsFiltrees.map((session: any) => {
                  const totalVentesSession = getTotalVentesBySession(session.id);
                  const ecart = getEcartCalcule(session);
                  return (
                    <tr key={session.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                        {new Date(session.date_ouverture).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                        {session.date_fermeture ? new Date(session.date_fermeture).toLocaleDateString() : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                        {session.fond_ouverture.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                        {totalVentesSession.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right text-sm text-[var(--color-textPrimary)]">
                        {session.fond_fermeture ? session.fond_fermeture.toLocaleString() + ' FCFA' : '-'}
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${ecart !== null ? getEcartColor(ecart) : 'text-[var(--color-textSecondary)]'}`}>
                          {ecart !== null ? ecart.toLocaleString() + ' FCFA' : '-'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
              <tfoot style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr className="border-t-2 border-[var(--color-borderColor)]">
                  <td colSpan={2} className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    {fondTotalOuverture.toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    {ventes.filter((v: any) => v.statut === 'validee').reduce((acc: number, v: any) => acc + v.montant_total, 0).toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    {fondTotalFermeture.toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    <span className={getEcartColor(ecartTotal)}>
                      {ecartTotal.toLocaleString()} FCFA
                    </span>
                  </td>
                </tr>
              </tfoot>
            </table>
          </div>
        </MotionBox>
      )}

      {sessionsFiltrees.length === 0 && (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <Coins size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg">Aucune session fermée</p>
          <p className="text-sm">Fermez une session pour voir les détails ici.</p>
        </MotionBox>
      )}

      <MotionBox type="card" variant="elevated" className="overflow-hidden">
        <div className="px-4 py-3 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
          <h3 className="font-semibold text-[var(--color-textPrimary)]">🛒 Détail des ventes</h3>
        </div>
        {ventesFiltrees.length === 0 ? (
          <div className="p-8 text-center text-[var(--color-textSecondary)]">
            Aucune vente dans cette période.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Montant</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {ventesFiltrees.map((v: any) => (
                  <tr key={v.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(v.date_vente).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {v.montant_total.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-left">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        v.statut === 'validee' ? 'bg-[var(--color-success)]' :
                        v.statut === 'annulee' ? 'bg-[var(--color-danger)]' :
                        'bg-[var(--color-warning)]'
                      }`}>
                        {v.statut === 'validee' ? 'Validée' : v.statut === 'annulee' ? 'Annulée' : 'En cours'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
              <tfoot style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr className="border-t-2 border-[var(--color-borderColor)]">
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">Total</td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    {totalVentes.toLocaleString()} FCFA
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        )}
      </MotionBox>
    </div>
  );
};

export default RapportsPage;
