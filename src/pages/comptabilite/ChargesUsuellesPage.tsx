import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useChargesUsuelles, useInitChargesUsuelles, useDeleteChargeUsuelle } from '../../hooks/useChargesUsuelles';
import { useComptes } from '../../hooks/useComptabilite';
import { CHARGES_USUELLES_PAR_DEFAUT, COMPTES_CHARGES, COMPTES_CREDIT } from '../../types/charge';
import { Plus, Trash2, Edit, RefreshCw, Search, Filter } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const ChargesUsuellesPage: React.FC = () => {
  const history = useHistory();
  const { data: charges = [], isLoading, refetch } = useChargesUsuelles();
  const { data: comptes = [] } = useComptes();
  const initMutation = useInitChargesUsuelles();
  const deleteMutation = useDeleteChargeUsuelle();
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreType, setFiltreType] = useState('');

  const filtered = charges.filter((c: any) => {
    const matchSearch = c.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        c.description?.toLowerCase().includes(searchTerm.toLowerCase());
    const matchType = filtreType ? c.type === filtreType : true;
    return matchSearch && matchType;
  });

  const getCompteNumero = (compteId: string) => {
    return comptes.find((c: any) => c.id === compteId)?.numero || 'N/A';
  };

  const getCompteNom = (compteId: string) => {
    return comptes.find((c: any) => c.id === compteId)?.nom || 'N/A';
  };

  const getTypeIcon = (type: string) => {
    const icons: Record<string, string> = {
      fixe: '🏠',
      variable: '📊',
      frais_financier: '💰',
      impot: '📋',
      service: '🔧',
      personnel: '👤',
      dotation: '📉',
      autre: '📄',
    };
    return icons[type] || '📄';
  };

  const getTypeLabel = (type: string) => {
    const labels: Record<string, string> = {
      fixe: 'Fixe',
      variable: 'Variable',
      frais_financier: 'Frais financier',
      impot: 'Impôt',
      service: 'Service',
      personnel: 'Personnel',
      dotation: 'Dotation',
      autre: 'Autre',
    };
    return labels[type] || type;
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette charge usuelle ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const handleInit = async () => {
    if (window.confirm('Initialiser les charges usuelles par défaut ?')) {
      await initMutation.mutateAsync();
      refetch();
    }
  };

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            📋 Charges usuelles
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Gérez les charges récurrentes pour une saisie rapide
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInit}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <RefreshCw size={18} /> Initialiser les charges
          </button>
          <button
            onClick={() => history.push('/gestion/comptabilite/charges-usuelles/nouveau')}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Nouvelle charge
          </button>
        </div>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher une charge..."
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
          <option value="fixe">🏠 Fixe</option>
          <option value="variable">📊 Variable</option>
          <option value="frais_financier">💰 Frais financier</option>
          <option value="impot">📋 Impôt</option>
          <option value="service">🔧 Service</option>
          <option value="personnel">👤 Personnel</option>
          <option value="dotation">📉 Dotation</option>
          <option value="autre">📄 Autre</option>
        </select>
      </div>

      {charges.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <div className="text-4xl mb-4">📋</div>
          <p className="text-lg">Aucune charge usuelle</p>
          <p className="text-sm">Cliquez sur "Initialiser les charges" pour charger les charges par défaut.</p>
          <button
            onClick={handleInit}
            className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
          >
            Initialiser les charges
          </button>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Nom</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Périodicité</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">Compte débit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">Compte crédit</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((charge: any) => (
                  <tr key={charge.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">
                      <span className="text-xl">{getTypeIcon(charge.type)}</span>
                      <span className="ml-1 text-xs text-[var(--color-textSecondary)]">{getTypeLabel(charge.type)}</span>
                    </td>
                    <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                      {charge.nom}
                      {charge.description && (
                        <p className="text-xs text-[var(--color-textSecondary)]">{charge.description}</p>
                      )}
                      {charge.montant_defaut && (
                        <span className="text-xs text-[var(--color-primary)]">
                          {charge.montant_defaut.toLocaleString()} FCFA
                        </span>
                      )}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                      {charge.periodicite}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden lg:table-cell">
                      {getCompteNumero(charge.compte_debit_id)} - {getCompteNom(charge.compte_debit_id).slice(0, 20)}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden lg:table-cell">
                      {getCompteNumero(charge.compte_credit_id)} - {getCompteNom(charge.compte_credit_id).slice(0, 20)}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        <button
                          onClick={() => history.push(`/gestion/comptabilite/charges-usuelles/${charge.id}`)}
                          className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          <Edit size={16} />
                        </button>
                        <button
                          onClick={() => handleDelete(charge.id)}
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

export default ChargesUsuellesPage;
