/**
 * HistoriquePage – Affichage de l'historique d'actions
 * Compatible React 16.14
 */

import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useHistorique } from '../hooks/useHistorique';
import { HistoriqueFilter } from '../types/historique';
import { Search, Filter, X, Calendar, User } from 'lucide-react';

export const HistoriquePage: React.FC = () => {
  const [filters, setFilters] = useState<HistoriqueFilter>({});
  const [showFilters, setShowFilters] = useState(false);
  const { data: actions = [], isLoading } = useHistorique(filters);

  const getActionColor = (action: string) => {
    const colors: Record<string, string> = {
      create: 'bg-[var(--color-success)]',
      update: 'bg-[var(--color-info)]',
      delete: 'bg-[var(--color-danger)]',
      open: 'bg-[var(--color-success)]',
      close: 'bg-[var(--color-warning)]',
      validate: 'bg-[var(--color-primary)]',
      cancel: 'bg-[var(--color-danger)]',
      login: 'bg-[var(--color-success)]',
      logout: 'bg-[var(--color-secondary)]',
      login_failed: 'bg-[var(--color-danger)]',
      password_change: 'bg-[var(--color-warning)]',
    };
    return colors[action] || 'bg-[var(--color-secondary)]';
  };

  const getActionLabel = (action: string) => {
    const labels: Record<string, string> = {
      create: 'Création',
      update: 'Modification',
      delete: 'Suppression',
      open: 'Ouverture',
      close: 'Fermeture',
      validate: 'Validation',
      cancel: 'Annulation',
      login: '🔓 Connexion',
      logout: '🔒 Déconnexion',
      login_failed: '⛔ Échec connexion',
      password_change: '🔑 Changement MDP',
    };
    return labels[action] || action;
  };

  const getModuleLabel = (module: string) => {
    const labels: Record<string, string> = {
      caisse: '💰 Caisse',
      stocks: '📦 Stocks',
      clients: '👥 Clients',
      rh: '👔 RH',
      comptabilite: '📊 Comptabilité',
      administration: '🛠️ Administration',
      auth: '🔐 Authentification',
    };
    return labels[module] || module;
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📜 Historique</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Toutes les actions effectuées dans l'application
          </p>
        </div>
        <button
          onClick={() => setShowFilters(!showFilters)}
          className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] flex items-center gap-2"
        >
          <Filter size={18} /> Filtres
        </button>
      </div>

      {showFilters && (
        <MotionBox
          as="div"
          type="card"
          variant="medium"
          className="p-4 mb-6"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Module</label>
              <select
                value={filters.module || ''}
                onChange={(e) => setFilters({ ...filters, module: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="">Tous</option>
                <option value="auth">🔐 Authentification</option>
                <option value="caisse">Caisse</option>
                <option value="stocks">Stocks</option>
                <option value="clients">Clients</option>
                <option value="rh">RH</option>
                <option value="comptabilite">Comptabilité</option>
                <option value="administration">Administration</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Action</label>
              <select
                value={filters.action || ''}
                onChange={(e) => setFilters({ ...filters, action: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="">Toutes</option>
                <option value="login">🔓 Connexion</option>
                <option value="logout">🔒 Déconnexion</option>
                <option value="login_failed">⛔ Échec connexion</option>
                <option value="create">Création</option>
                <option value="update">Modification</option>
                <option value="delete">Suppression</option>
                <option value="open">Ouverture</option>
                <option value="close">Fermeture</option>
                <option value="validate">Validation</option>
                <option value="cancel">Annulation</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type</label>
              <select
                value={filters.entity_type || ''}
                onChange={(e) => setFilters({ ...filters, entity_type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="">Tous</option>
                <option value="user">Utilisateur</option>
                <option value="session">Session</option>
                <option value="vente">Vente</option>
                <option value="produit">Produit</option>
                <option value="categorie">Catégorie</option>
                <option value="fournisseur">Fournisseur</option>
              </select>
            </div>
            <div className="sm:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date</label>
              <div className="flex gap-2">
                <input
                  type="date"
                  value={filters.date_debut || ''}
                  onChange={(e) => setFilters({ ...filters, date_debut: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
                <input
                  type="date"
                  value={filters.date_fin || ''}
                  onChange={(e) => setFilters({ ...filters, date_fin: e.target.value })}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>
          </div>
          <div className="flex justify-end gap-3 mt-4">
            <button
              onClick={() => setFilters({})}
              className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
            >
              Réinitialiser
            </button>
          </div>
        </MotionBox>
      )}

      {isLoading ? (
        <div className="text-center py-12 text-[var(--color-textSecondary)]">Chargement...</div>
      ) : actions.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune action enregistrée
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Utilisateur</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Module</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Action</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden md:table-cell">Type</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">ID</th>
                </tr>
              </thead>
              <tbody>
                {actions.map((action) => (
                  <tr key={action.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(action.created_at).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-textPrimary)]">
                      {action.user?.nom} {action.user?.prenom}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {getModuleLabel(action.module)}
                    </td>
                    <td className="px-4 py-3">
                      <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium text-white ${getActionColor(action.action)}`}>
                        {getActionLabel(action.action)}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                      {action.entity_type}
                    </td>
                    <td className="px-4 py-3 text-sm font-mono text-[var(--color-textSecondary)] hidden lg:table-cell">
                      {action.entity_id.slice(0, 8)}...
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)]">
            {actions.length} actions affichées
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default HistoriquePage;
