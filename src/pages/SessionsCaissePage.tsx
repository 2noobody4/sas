import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useSessions } from '../hooks/useSessions';
import { useVentes } from '../hooks/useVentes';
import { TrendingUp, TrendingDown, Coins, Calendar, Filter, Eye } from 'lucide-react';
import { useHistory } from 'react-router-dom';

export const SessionsCaissePage: React.FC = () => {
  const history = useHistory();
  const { data: sessions = [], isLoading: sessionsLoading } = useSessions();
  const { data: ventes = [], isLoading: ventesLoading } = useVentes();
  const [dateDebut, setDateDebut] = useState('');
  const [dateFin, setDateFin] = useState('');

  // Sessions fermées uniquement
  const sessionsFermees = sessions.filter(s => s.statut === 'fermee');
  
  // Filtrer par date
  const sessionsFiltrees = sessionsFermees.filter(s => {
    const date = s.date_fermeture || s.date_ouverture;
    if (dateDebut && new Date(date) < new Date(dateDebut)) return false;
    if (dateFin && new Date(date) > new Date(dateFin)) return false;
    return true;
  });

  // Calculer les statistiques
  const nbSessions = sessionsFiltrees.length;
  const ecartTotal = sessionsFiltrees.reduce((acc, s) => acc + (s.ecart || 0), 0);
  const fondTotalOuverture = sessionsFiltrees.reduce((acc, s) => acc + s.fond_ouverture, 0);
  const fondTotalFermeture = sessionsFiltrees.reduce((acc, s) => acc + (s.fond_fermeture || 0), 0);
  
  // Total des ventes par session
  const getTotalVentesBySession = (sessionId: string) => {
    return ventes
      .filter(v => v.session_id === sessionId && v.statut === 'validee')
      .reduce((acc, v) => acc + v.montant_total, 0);
  };

  const getEcartColor = (ecart: number) => {
    if (ecart > 0) return 'text-[var(--color-success)]';
    if (ecart < 0) return 'text-[var(--color-danger)]';
    return 'text-[var(--color-textSecondary)]';
  };

  if (sessionsLoading || ventesLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Coins size={28} className="text-[var(--color-primary)]" />
            Sessions de caisse
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Historique des sessions fermées et leurs écarts
          </p>
        </div>
        <span className="text-sm text-[var(--color-textSecondary)]">
          {nbSessions} sessions fermées
        </span>
      </div>

      {/* Filtres de date */}
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

      {/* Cartes de synthèse */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Nombre de sessions</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{nbSessions}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Fond total d'ouverture</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{fondTotalOuverture.toLocaleString()} FCFA</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Fond total de fermeture</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{fondTotalFermeture.toLocaleString()} FCFA</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Écart total</p>
          <p className={`text-2xl font-bold ${getEcartColor(ecartTotal)}`}>
            {ecartTotal.toLocaleString()} FCFA
          </p>
        </MotionBox>
      </div>

      {/* Tableau des sessions */}
      {sessionsFiltrees.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <Coins size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg">Aucune session fermée</p>
          <p className="text-sm">Les sessions apparaîtront ici après leur fermeture.</p>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date d'ouverture</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date de fermeture</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Fond d'ouverture</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Fond de fermeture</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Total ventes</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Écart</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {sessionsFiltrees.map((session) => {
                  const totalVentesSession = getTotalVentesBySession(session.id);
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
                        {session.fond_fermeture ? session.fond_fermeture.toLocaleString() + ' FCFA' : '-'}
                      </td>
                      <td className="px-4 py-3 text-right text-sm font-medium text-[var(--color-primary)]">
                        {totalVentesSession.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-medium ${getEcartColor(session.ecart || 0)}`}>
                          {session.ecart !== null && session.ecart !== undefined ? session.ecart.toLocaleString() + ' FCFA' : '-'}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <button
                          onClick={() => history.push(`/gestion/caisse/sessions/${session.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Voir les détails"
                        >
                          <Eye size={16} />
                        </button>
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
                    {fondTotalFermeture.toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    {ventes.filter(v => v.statut === 'validee').reduce((acc, v) => acc + v.montant_total, 0).toLocaleString()} FCFA
                  </td>
                  <td className="px-4 py-3 text-right font-semibold text-[var(--color-textPrimary)]">
                    <span className={getEcartColor(ecartTotal)}>
                      {ecartTotal.toLocaleString()} FCFA
                    </span>
                  </td>
                  <td></td>
                </tr>
              </tfoot>
            </table>
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default SessionsCaissePage;
