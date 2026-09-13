import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useCommandesClient, useUpdateCommandeClientStatut, useDeleteCommandeClient } from '../../hooks/useCommandesClient';
import { STATUTS_COMMANDE_CLIENT, StatutCommandeClient } from '../../types/commandeClient';
import { Search, Plus, Eye, Trash2, Filter, RefreshCw } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const CommandesClientPage: React.FC = () => {
  const history = useHistory();
  const { data: commandes = [], isLoading, refetch } = useCommandesClient();
  const updateStatut = useUpdateCommandeClientStatut();
  const deleteMutation = useDeleteCommandeClient();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutCommandeClient | ''>('');

  const filtered = commandes.filter((c: any) => {
    const matchSearch = c.numero.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.client?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.client?.prenom?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchStatut = filtreStatut ? c.statut === filtreStatut : true;
    return matchSearch && matchStatut;
  });

  const handleStatutChange = async (id: string, statut: StatutCommandeClient) => {
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

  const getStatutColor = (statut: StatutCommandeClient) => {
    const found = STATUTS_COMMANDE_CLIENT.find(s => s.value === statut);
    return found?.color || 'var(--color-textSecondary)';
  };

  const getStatutLabel = (statut: StatutCommandeClient) => {
    const found = STATUTS_COMMANDE_CLIENT.find(s => s.value === statut);
    return found?.label || statut;
  };

  const getStatutIcon = (statut: StatutCommandeClient) => {
    const found = STATUTS_COMMANDE_CLIENT.find(s => s.value === statut);
    return found?.icon || '📌';
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Commandes clients</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des commandes des clients</p>
        </div>
        <button
          onClick={() => history.push('/gestion/clients/commandes/nouvelle')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
        >
          <Plus size={18} /> Nouvelle commande
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher par numéro ou client..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)]"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutCommandeClient | '')}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les statuts</option>
          {STATUTS_COMMANDE_CLIENT.map((s) => (
            <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
          ))}
        </select>
        <button
          onClick={() => refetch()}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-1"
        >
          <RefreshCw size={16} /> Actualiser
        </button>
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
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">N° Commande</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Total</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((c: any) => (
                  <tr key={c.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm font-mono font-medium text-[var(--color-textPrimary)]">{c.numero}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">
                      {c.client?.nom} {c.client?.prenom || ''}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(c.date_commande).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {c.montant_total.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <select
                        value={c.statut}
                        onChange={(e) => handleStatutChange(c.id, e.target.value as StatutCommandeClient)}
                        className="px-2 py-1 rounded text-xs border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                        style={{ color: getStatutColor(c.statut) }}
                      >
                        {STATUTS_COMMANDE_CLIENT.map((s) => (
                          <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                        ))}
                      </select>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/clients/commandes/${c.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Voir la commande"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(c.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                          title="Supprimer"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)]">
            {filtered.length} commandes affichées
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default CommandesClientPage;
