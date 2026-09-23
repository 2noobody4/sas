import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useSaisies, useDeleteSaisie, SaisieComptable as SaisieComptableType } from '../hooks/useComptabilite';
import { Search, Filter, Trash2, Eye, Plus } from 'lucide-react';

export const ChargesPage: React.FC = () => {
  const history = useHistory();
  const { data: saisies = [], isLoading, refetch } = useSaisies();
  const deleteSaisie = useDeleteSaisie();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreType, setFiltreType] = useState('');

  // Filtrer les charges (depense, salaire, ajustement, autre)
  const charges = saisies.filter((s: SaisieComptableType) => 
    s.type === 'depense' || s.type === 'salaire' || s.type === 'ajustement' || s.type === 'autre'
  );

  const filtered = charges.filter((s: SaisieComptableType) => {
    if (filtreType && s.type !== filtreType) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return s.beneficiaire?.toLowerCase().includes(term) || 
             s.description?.toLowerCase().includes(term);
    }
    return true;
  });

  const totalCharges = charges.reduce((acc, s) => acc + s.montant_ttc, 0);

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette charge ?')) {
      await deleteSaisie.mutateAsync(id);
      refetch();
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📉 Charges</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Dépenses, salaires, ajustements et autres charges</p>
        </div>
        <button
          // 🔧 Unification : "Nouvelle charge" pointait vers SaisieComptable
          // (formulaire simplifié) alors que "Modifier une charge" pointait
          // vers ChargeFormPage (formulaire plus riche, avec charges
          // usuelles) — deux logiques différentes pour créer vs modifier
          // la même donnée. Les deux passent désormais par ChargeFormPage.
          onClick={() => history.push('/gestion/comptabilite/charges/nouvelle')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouvelle charge
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Nombre de charges</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{charges.length}</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Total des charges</p>
          <p className="text-2xl font-bold text-[var(--color-danger)]">{totalCharges.toLocaleString()} FCFA</p>
        </MotionBox>
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
          <option value="depense">Dépense</option>
          <option value="salaire">Salaire</option>
          <option value="ajustement">Ajustement</option>
          <option value="autre">Autre</option>
        </select>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune charge trouvée.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Bénéficiaire</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Montant TTC</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Comptabilisée</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((s: SaisieComptableType) => (
                  <tr key={s.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(s.date_operation).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">
                      {s.type === 'depense' ? '💸 Dépense' :
                       s.type === 'salaire' ? '👤 Salaire' :
                       s.type === 'ajustement' ? '🔄 Ajustement' : '📄 Autre'}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{s.beneficiaire || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {s.montant_ttc.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      {/* 🆕 Indicateur : la charge a-t-elle bien été transmise à la
                          comptabilité ? (transaction_id présent). Avant cette
                          correction, il n'y avait aucun moyen de le savoir. */}
                      {(s as any).transaction_id ? (
                        <span className="text-xs text-[var(--color-success)]" title="Comptabilisée">✅</span>
                      ) : (
                        <span className="text-xs text-[var(--color-warning)]" title="Non comptabilisée">⚠️</span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/comptabilite/charges/${s.id}`)}
                          className="p-1.5 rounded hover:bg-blue-50 text-[var(--color-primary)]"
                          title="Modifier"
                        >
                          <Eye size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(s.id)}
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
        </MotionBox>
      )}
    </div>
  );
};

export default ChargesPage;
