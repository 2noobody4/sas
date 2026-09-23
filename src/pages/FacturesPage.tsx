import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useFactures, useDeleteFacture } from '../hooks/useFactures';
import { Search, Plus, Trash2, Edit, Eye, Filter } from 'lucide-react';

export const FacturesPage: React.FC = () => {
  const history = useHistory();
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const { data: factures = [], isLoading, refetch } = useFactures({ type: filtreType, statut: filtreStatut });
  const deleteMutation = useDeleteFacture();

  const filtered = factures.filter(f => {
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return f.numero.toLowerCase().includes(term) ||
             f.fournisseur_client_nom?.toLowerCase().includes(term) ||
             f.description?.toLowerCase().includes(term);
    }
    return true;
  });

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette facture ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🧾 Gestion des factures</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Factures émises et reçues</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => history.push('/gestion/comptabilite/factures/nouvelle/emise')}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Émettre facture
          </button>
          <button
            onClick={() => history.push('/gestion/comptabilite/factures/nouvelle/recue')}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textPrimary)] flex items-center gap-2"
          >
            <Plus size={18} /> Recevoir facture
          </button>
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
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous types</option>
          <option value="emise">Émises</option>
          <option value="recue">Reçues</option>
        </select>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous statuts</option>
          <option value="brouillon">Brouillon</option>
          <option value="envoyee">Envoyée</option>
          <option value="payee">Payée</option>
          <option value="en_retard">En retard</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune facture trouvée.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Numéro</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Bénéficiaire</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Montant TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((f) => (
                  <tr key={f.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm font-mono text-[var(--color-textPrimary)]">{f.numero}</td>
                    <td className="px-4 py-3 text-sm">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        f.type === 'emise' ? 'bg-[var(--color-primary)]' : 'bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                      }`}>
                        {f.type === 'emise' ? '📤 Émise' : '📥 Reçue'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{f.fournisseur_client_nom || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {f.montant_ttc.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        f.statut === 'payee' ? 'bg-[var(--color-success)]' :
                        f.statut === 'en_retard' ? 'bg-[var(--color-danger)]' :
                        f.statut === 'envoyee' ? 'bg-[var(--color-warning)]' :
                        'bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                      }`}>
                        {f.statut === 'payee' ? 'Payée' :
                         f.statut === 'en_retard' ? 'En retard' :
                         f.statut === 'envoyee' ? 'Envoyée' :
                         'Brouillon'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/comptabilite/factures/${f.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(f.id)}
                          className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
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
        </MotionBox>
      )}
    </div>
  );
};

export default FacturesPage;
