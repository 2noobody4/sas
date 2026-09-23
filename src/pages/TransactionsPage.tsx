import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useTransactions, useComptes, useCreateTransaction, useDeleteTransaction } from '../hooks/useComptabilite';
import { CompteSearchSelect } from '../components/CompteSearchSelect';
import { Plus, Trash2, Edit, Search } from 'lucide-react';

export const TransactionsPage: React.FC = () => {
  const history = useHistory();
  const { data: transactions = [], isLoading } = useTransactions();
  const { data: comptes = [] } = useComptes();
  const createMutation = useCreateTransaction();
  const deleteMutation = useDeleteTransaction();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    date_transaction: new Date().toISOString().split('T')[0],
    libelle: '',
    montant: 0,
    compte_debit_id: '',
    compte_credit_id: '',
    type: 'autre' as const,
    reference: '',
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      await createMutation.mutateAsync(form);
      setShowForm(false);
      setForm({ date_transaction: new Date().toISOString().split('T')[0], libelle: '', montant: 0, compte_debit_id: '', compte_credit_id: '', type: 'autre', reference: '' });
    } catch {}
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Transactions</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Gestion des écritures comptables</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2">
          <Plus size={18} /> Nouvelle transaction
        </button>
      </div>

      {showForm && (
        <MotionBox type="card" variant="elevated" className="p-4 mb-4">
          <form onSubmit={handleSubmit} className="grid grid-cols-1 md:grid-cols-3 gap-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date</label>
              <input
                type="date"
                value={form.date_transaction}
                onChange={(e) => setForm({ ...form, date_transaction: e.target.value })}
                className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Libellé</label>
              <input
                type="text"
                value={form.libelle}
                onChange={(e) => setForm({ ...form, libelle: e.target.value })}
                className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant (FCFA)</label>
              <input
                type="number"
                value={form.montant}
                onChange={(e) => setForm({ ...form, montant: parseFloat(e.target.value) || 0 })}
                className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                min={0}
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte débit</label>
              <CompteSearchSelect
                value={form.compte_debit_id}
                onChange={(id) => setForm({ ...form, compte_debit_id: id })}
                placeholder="Sélectionner un compte débit"
                typeFilter="actif"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte crédit</label>
              <CompteSearchSelect
                value={form.compte_credit_id}
                onChange={(id) => setForm({ ...form, compte_credit_id: id })}
                placeholder="Sélectionner un compte crédit"
                typeFilter="passif"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="vente">Vente</option>
                <option value="achat">Achat</option>
                <option value="facture_client">Facture client</option>
                <option value="facture_fournisseur">Facture fournisseur</option>
                <option value="service">Service</option>
                <option value="depense">Dépense</option>
                <option value="salaire">Salaire</option>
                <option value="ajustement">Ajustement</option>
                <option value="autre">Autre</option>
              </select>
            </div>
            <div className="md:col-span-3 flex justify-end gap-3">
              <button type="button" onClick={() => setShowForm(false)} className="px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]">
                Annuler
              </button>
              <button type="submit" className="px-4 py-2 rounded bg-[var(--color-primary)] text-white">
                Enregistrer
              </button>
            </div>
          </form>
        </MotionBox>
      )}

      {transactions.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune transaction.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <table className="w-full">
            <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
              <tr>
                <th className="px-4 py-3 text-left">Date</th>
                <th className="px-4 py-3 text-left">Libellé</th>
                <th className="px-4 py-3 text-right">Montant</th>
                <th className="px-4 py-3 text-center">Type</th>
                <th className="px-4 py-3 text-center">Actions</th>
              </tr>
            </thead>
            <tbody>
              {transactions.map(t => (
                <tr key={t.id} className="border-t border-[var(--color-borderColor)]">
                  <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">{new Date(t.date_transaction).toLocaleDateString()}</td>
                  <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{t.libelle}</td>
                  <td className="px-4 py-3 text-right font-medium">{t.montant.toLocaleString()} FCFA</td>
                  <td className="px-4 py-3 text-center"><span className="px-2 py-1 rounded-full text-xs text-white bg-[var(--color-primary)]">{t.type}</span></td>
                  <td className="px-4 py-3 text-center">
                    <button onClick={() => deleteMutation.mutate(t.id)} className="text-[var(--color-danger)]"><Trash2 size={18} /></button>
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

export default TransactionsPage;
