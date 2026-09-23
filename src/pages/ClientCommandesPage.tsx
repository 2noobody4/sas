import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useCommandes, useDeleteCommande } from '../hooks/useBoutique';
import { STATUTS_COMMANDE, StatutCommande } from '../types/boutique';
import { Search, Plus, Eye, Trash2 } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const CommandesPage: React.FC = () => {
  const history = useHistory();
  const { data: commandes = [], isLoading, refetch } = useCommandes();
  const deleteMutation = useDeleteCommande();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutCommande | ''>('');

  const filtered = commandes.filter((c: any) => {
    const matchSearch = c.client_nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.id.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filtreStatut ? c.statut === filtreStatut : true;
    return matchSearch && matchStatut;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette commande ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const getStatutColor = (statut: StatutCommande) => {
    const found = STATUTS_COMMANDE.find(s => s.value === statut);
    return found?.color || 'var(--color-textSecondary)';
  };

  const getStatutLabel = (statut: StatutCommande) => {
    const found = STATUTS_COMMANDE.find(s => s.value === statut);
    return found?.label || statut;
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📦 Mes commandes</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Suivi de vos commandes</p>
        </div>
        <button
          onClick={() => history.push('/gestion/clients/commandes/nouvelle')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouvelle commande
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher une commande..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutCommande | '')}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les statuts</option>
          {STATUTS_COMMANDE.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune commande trouvée.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">#</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Client</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-[var(--color-textSecondary)]">{c.id.slice(0, 8)}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{c.client_nom || 'Anonyme'}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {c.montant_total.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className="px-2 py-1 rounded-full text-xs font-medium text-white" style={{ backgroundColor: getStatutColor(c.statut) }}>
                        {getStatutLabel(c.statut)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/clients/commandes/${c.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Eye size={16} />
                        </button>
                        {c.statut === 'brouillon' || c.statut === 'en_attente' ? (
                          <button
                            onClick={() => handleDelete(c.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                          >
                            <Trash2 size={16} />
                          </button>
                        ) : null}
                      </div>
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

export default CommandesPage;
