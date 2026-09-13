import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useNegociations, useCreateNegociation, useUpdateNegociation } from '../../hooks/usePromotions';
import { useProduits } from '../../hooks/useProduits';
import { useClients } from '../../hooks/useClients';
import { useTarifications } from '../../hooks/usePromotions';
import { Search, Plus, CheckCircle, XCircle, Clock, DollarSign, TrendingUp, X } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

export const NegociationPage: React.FC = () => {
  const history = useHistory();
  const { data: negociations = [], isLoading, refetch } = useNegociations();
  const { data: produits = [] } = useProduits();
  const { data: clients = [] } = useClients();
  const { data: tarifications = [] } = useTarifications();
  const createMutation = useCreateNegociation();
  const updateMutation = useUpdateNegociation();
  const { success, error: toastError } = useToast();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    produit_id: '',
    prix_achat: 0,
    prix_vente_propose: 0,
    client_id: '',
    notes: '',
  });
  const [searchTerm, setSearchTerm] = useState('');

  const filtered = negociations.filter((n: any) => {
    const nom = n.produit?.nom || '';
    return nom.toLowerCase().includes(searchTerm.toLowerCase());
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.prix_vente_propose <= 0) {
      toastError('Le prix de vente proposé doit être supérieur à 0');
      return;
    }
    try {
      await createMutation.mutateAsync(form);
      success('Négociation créée ✅');
      setShowForm(false);
      setForm({ produit_id: '', prix_achat: 0, prix_vente_propose: 0, client_id: '', notes: '' });
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleUpdateStatut = async (id: string, statut: string) => {
    await updateMutation.mutateAsync({ id, statut });
    refetch();
  };

  const getPrixAchat = (produitId: string) => {
    const tarif = tarifications.find((t: any) => t.produit_id === produitId && !t.date_fin);
    return tarif?.prix_achat || 0;
  };

  const getStatutBadge = (statut: string) => {
    const config: Record<string, { label: string; color: string }> = {
      en_cours: { label: '⏳ En cours', color: 'bg-[var(--color-warning)]' },
      accepte: { label: '✅ Accepté', color: 'bg-[var(--color-success)]' },
      refuse: { label: '❌ Refusé', color: 'bg-[var(--color-danger)]' },
      annule: { label: '🚫 Annulé', color: 'bg-[var(--color-secondary)]' },
    };
    const info = config[statut] || config.en_cours;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${info.color}`}>{info.label}</span>;
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Négociations</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Visualisation des marges et prix d'achat</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouvelle négociation
        </button>
      </div>

      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un produit..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune négociation en cours.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Produit</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Prix achat</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Prix proposé</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Marge</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((n: any) => {
                  const prixAchat = n.prix_achat || getPrixAchat(n.produit_id);
                  const marge = prixAchat > 0 ? Math.round(((n.prix_vente_propose - prixAchat) / prixAchat) * 100) : 0;
                  return (
                    <tr key={n.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                        {n.produit?.nom || 'Produit inconnu'}
                      </td>
                      <td className="px-4 py-3 text-right text-[var(--color-textSecondary)]">
                        {prixAchat.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                        {n.prix_vente_propose.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right">
                        <span className={`font-bold ${marge >= 30 ? 'text-[var(--color-success)]' : marge >= 15 ? 'text-[var(--color-warning)]' : 'text-[var(--color-danger)]'}`}>
                          {marge}%
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">{getStatutBadge(n.statut)}</td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {n.statut === 'en_cours' && (
                            <>
                              <button
                                onClick={() => handleUpdateStatut(n.id, 'accepte')}
                                className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                                title="Accepter"
                              >
                                <CheckCircle size={16} />
                              </button>
                              <button
                                onClick={() => handleUpdateStatut(n.id, 'refuse')}
                                className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                                title="Refuser"
                              >
                                <XCircle size={16} />
                              </button>
                            </>
                          )}
                          {n.statut === 'accepte' && (
                            <button
                              onClick={() => history.push(`/gestion/caisse/ventes/nouvelle?produit_id=${n.produit_id}`)}
                              className="p-1.5 rounded hover:bg-blue-50 text-[var(--color-primary)]"
                              title="Vendre"
                            >
                              <DollarSign size={16} />
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}

      {showForm && (
        <MotionBox
          as="div"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] p-4"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            type="card"
            variant="xlarge"
            className="w-full max-w-md p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">Nouvelle négociation</h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Produit *</label>
                <select
                  value={form.produit_id}
                  onChange={(e) => {
                    const produitId = e.target.value;
                    const prixAchat = getPrixAchat(produitId);
                    setForm({ ...form, produit_id: produitId, prix_achat: prixAchat });
                  }}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner</option>
                  {produits.filter((p: any) => p.actif).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nom}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prix d'achat (FCFA)</label>
                <input
                  type="number"
                  value={form.prix_achat}
                  disabled
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] cursor-not-allowed opacity-70"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prix de vente proposé (FCFA) *</label>
                <input
                  type="number"
                  value={form.prix_vente_propose}
                  onChange={(e) => setForm({ ...form, prix_vente_propose: parseFloat(e.target.value) || 0 })}
                  min={0}
                  step={100}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Client (optionnel)</label>
                <select
                  value={form.client_id}
                  onChange={(e) => setForm({ ...form, client_id: e.target.value })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner</option>
                  {clients.filter((c: any) => c.actif).map((c: any) => (
                    <option key={c.id} value={c.id}>{c.nom} {c.prenom || ''}</option>
                  ))}
                </select>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Notes</label>
                <textarea
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  rows={2}
                  placeholder="Informations complémentaires..."
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
                <button
                  type="button"
                  onClick={() => setShowForm(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-1"
                >
                  <TrendingUp size={16} /> Créer
                </button>
              </div>
            </form>
          </MotionBox>
        </MotionBox>
      )}
    </div>
  );
};

export default NegociationPage;
