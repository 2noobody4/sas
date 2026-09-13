import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useCommandesClient } from '../../hooks/useCommandesClient';
import { STATUTS_COMMANDE_CLIENT } from '../../types/commandeClient';
import { Search, Eye, Filter } from 'lucide-react';

export const CommandesPage: React.FC = () => {
  const history = useHistory();
  const { data: commandes = [], isLoading } = useCommandesClient();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');

  const filtered = commandes.filter(c => {
    const num = c.numero.toLowerCase();
    const client = c.client?.nom?.toLowerCase() || '';
    const match = num.includes(searchTerm.toLowerCase()) || client.includes(searchTerm.toLowerCase());
    const matchStatut = filtreStatut ? c.statut === filtreStatut : true;
    return match && matchStatut;
  });

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Mes commandes</h1>
      <div className="flex flex-wrap gap-3 mt-4 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input type="text" placeholder="Rechercher..." value={searchTerm} onChange={e => setSearchTerm(e.target.value)} className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]" />
        </div>
        <select value={filtreStatut} onChange={e => setFiltreStatut(e.target.value)} className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]">
          <option value="">Tous statuts</option>
          {STATUTS_COMMANDE_CLIENT.map(s => <option key={s.value} value={s.value}>{s.icon} {s.label}</option>)}
        </select>
      </div>
      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">Aucune commande trouvée.</MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left text-sm font-semibold">N°</th>
                <th className="px-4 py-3 text-left text-sm font-semibold">Client</th>
                <th className="px-4 py-3 text-right text-sm font-semibold">Total</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Statut</th>
                <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(c => (
                <tr key={c.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50">
                  <td className="px-4 py-3 font-mono text-sm">{c.numero}</td>
                  <td className="px-4 py-3">{c.client?.nom || 'Anonyme'}</td>
                  <td className="px-4 py-3 text-right font-medium">{c.montant_total.toLocaleString()} FCFA</td>
                  <td className="px-4 py-3 text-center">
                    <span className="px-2 py-1 rounded-full text-xs text-white" style={{ backgroundColor: STATUTS_COMMANDE_CLIENT.find(s => s.value === c.statut)?.color }}>
                      {STATUTS_COMMANDE_CLIENT.find(s => s.value === c.statut)?.label}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => history.push(`/clients/commandes/${c.id}`)} className="p-1.5 rounded hover:bg-[var(--color-secondary)]">
                      <Eye size={16} />
                    </button>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </MotionBox>
      )}
    </div>
  );
};
