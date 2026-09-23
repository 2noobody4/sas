import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useVentes } from '../hooks/useVentes';
import { useSessionActive } from '../hooks/useSessions';
import { Plus, Search, Filter } from 'lucide-react';

export const VentesPage: React.FC = () => {
  const history = useHistory();
  const { data: ventes = [], isLoading } = useVentes();
  const { data: sessionActive } = useSessionActive();
  const [search, setSearch] = useState('');

  const filteredVentes = ventes.filter(v => 
    v.id.toLowerCase().includes(search.toLowerCase())
  );

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Historique des ventes</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Consultez toutes les ventes enregistrées</p>
        </div>
        {sessionActive && (
          <button
            onClick={() => history.push('/gestion/caisse/ventes/nouvelle')}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle vente
          </button>
        )}
      </div>

      {!sessionActive && (
        <MotionBox type="card" variant="default" className="p-4 mb-4 text-center text-[var(--color-textSecondary)]">
          ⚠️ Aucune session ouverte. Ouvrez une session pour enregistrer des ventes.
        </MotionBox>
      )}

      <div className="flex gap-3 mb-4">
        <div className="flex-1 relative">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher une vente par ID..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {ventes.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune vente enregistrée.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">ID</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Montant</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                </tr>
              </thead>
              <tbody>
                {filteredVentes.map((vente) => (
                  <tr key={vente.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-[var(--color-textSecondary)]">{vente.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(vente.date_vente).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {vente.montant_total.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        vente.statut === 'validee' ? 'bg-[var(--color-success)]' :
                        vente.statut === 'annulee' ? 'bg-[var(--color-danger)]' :
                        'bg-[var(--color-warning)]'
                      }`}>
                        {vente.statut}
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

export default VentesPage;
