import React, { useState } from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useCommandes, useUpdateCommandeStatut, useDeleteCommande } from '../../hooks/useBoutique';
import { STATUTS_COMMANDE, StatutCommande } from '../../types/boutique';
import { Search, Trash2 } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const CommandesPage: React.FC = () => {
  const { data: commandes = [], isLoading, refetch } = useCommandes();
  const updateStatut = useUpdateCommandeStatut();
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

  const handleStatutChange = async (id: string, statut: StatutCommande) => {
    try {
      await updateStatut.mutateAsync({ id, statut });
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette commande ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        refetch();
      } catch (err: any) {
        toastError(err.message);
      }
    }
  };

  const getStatutColor = (statut: StatutCommande) => {
    const found = STATUTS_COMMANDE.find(s => s.value === statut);
    return found?.color || 'var(--color-textSecondary)';
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📦 Commandes</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des commandes boutique</p>
        </div>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher..."
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
                      <select
                        value={c.statut}
                        onChange={(e) => handleStatutChange(c.id, e.target.value as StatutCommande)}
                        className="px-2 py-1 rounded text-xs border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                        style={{ color: getStatutColor(c.statut) }}
                      >
                        {STATUTS_COMMANDE.map((s) => (
                          <option key={s.value} value={s.value}>{s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => handleDelete(c.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                      >
                        <Trash2 size={16} />
                      </button>
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
