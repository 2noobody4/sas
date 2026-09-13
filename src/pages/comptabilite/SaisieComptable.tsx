import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useSaisies, useCreateSaisie, useUpdateStatutPaiement, useDeleteSaisie, SaisieComptable as SaisieComptableType } from '../../hooks/useComptabilite';
import { useFournisseurs } from '../../hooks/useFournisseurs';
import { useProduits } from '../../hooks/useProduits';
import { useDataLoader } from '../../contexts/DataLoaderContext';
import { UploadDocument } from '../../components/ui/UploadDocument';
import { 
  Plus, Search, Filter, X, 
  Calendar, DollarSign, FileText, 
  CheckCircle, XCircle, Clock, 
  Trash2, Eye, Edit, Download 
} from 'lucide-react';

export const SaisiePage: React.FC = () => {
  const history = useHistory();
  const { data: saisies = [], isLoading, refetch } = useSaisies();
  const { data: fournisseurs = [] } = useFournisseurs();
  const createSaisie = useCreateSaisie();
  const updateStatut = useUpdateStatutPaiement();
  const deleteSaisie = useDeleteSaisie();

  const [showForm, setShowForm] = useState(false);
  const [form, setForm] = useState({
    type: 'facture_fournisseur' as const,
    beneficiaire: '',
    beneficiaire_id: '',
    montant_ht: 0,
    montant_ttc: 0,
    taxe: 0,
    date_operation: new Date().toISOString().split('T')[0],
    date_echeance: '',
    statut_paiement: 'non_paye' as const,
    description: '',
    piece_jointe: [] as string[],
  });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [filtreType, setFiltreType] = useState('');
  const [filtreStatut, setFiltreStatut] = useState('');
  const [searchTerm, setSearchTerm] = useState('');

  const tvaParDefaut = 0.18;
  useEffect(() => {
    if (form.montant_ht > 0) {
      const tva = form.montant_ht * tvaParDefaut;
      setForm(prev => ({ ...prev, taxe: tva, montant_ttc: form.montant_ht + tva }));
    }
  }, [form.montant_ht]);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.montant_ht <= 0) {
      setError('Le montant doit être supérieur à 0');
      return;
    }
    setLoading(true);
    try {
      await createSaisie.mutateAsync({
        ...form,
        piece_jointe_url: form.piece_jointe[0] || '',
      });
      setShowForm(false);
      setForm({
        type: 'facture_fournisseur',
        beneficiaire: '',
        beneficiaire_id: '',
        montant_ht: 0,
        montant_ttc: 0,
        taxe: 0,
        date_operation: new Date().toISOString().split('T')[0],
        date_echeance: '',
        statut_paiement: 'non_paye',
        description: '',
        piece_jointe: [],
      });
      refetch();
    } catch (err: any) {
      setError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  const handleStatutChange = async (id: string, statut: 'paye' | 'non_paye' | 'partiel') => {
    await updateStatut.mutateAsync({ id, statut });
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette saisie ?')) {
      await deleteSaisie.mutateAsync(id);
      refetch();
    }
  };

  const filteredSaisies = saisies.filter((s: SaisieComptableType) => {
    if (filtreType && s.type !== filtreType) return false;
    if (filtreStatut && s.statut_paiement !== filtreStatut) return false;
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      return s.beneficiaire?.toLowerCase().includes(term) || 
             s.description?.toLowerCase().includes(term);
    }
    return true;
  });

  const totalImpayes = saisies
    .filter((s: SaisieComptableType) => s.statut_paiement !== 'paye')
    .reduce((acc: number, s: SaisieComptableType) => acc + s.montant_ttc, 0);

  const totalDepensesMois = saisies
    .filter((s: SaisieComptableType) => {
      const now = new Date();
      const d = new Date(s.date_operation);
      return d.getMonth() === now.getMonth() && d.getFullYear() === now.getFullYear();
    })
    .reduce((acc: number, s: SaisieComptableType) => acc + s.montant_ttc, 0);

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📋 Saisie comptable simplifiée</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Factures, dépenses, salaires – tout en un formulaire</p>
        </div>
        <button onClick={() => setShowForm(true)} className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2">
          <Plus size={18} /> Nouvelle saisie
        </button>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Total impayés</p>
          <p className="text-2xl font-bold text-[var(--color-danger)]">{totalImpayes.toLocaleString()} FCFA</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Dépenses du mois</p>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{totalDepensesMois.toLocaleString()} FCFA</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <p className="text-sm text-[var(--color-textSecondary)]">Nombre de saisies</p>
          <p className="text-2xl font-bold text-[var(--color-primary)]">{saisies.length}</p>
        </MotionBox>
      </div>

      {/* Filtres */}
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
          <option value="facture_fournisseur">Facture fournisseur</option>
          <option value="facture_client">Facture client</option>
          <option value="depense">Dépense</option>
          <option value="salaire">Salaire</option>
          <option value="ajustement">Ajustement</option>
          <option value="autre">Autre</option>
        </select>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous statuts</option>
          <option value="paye">Payé</option>
          <option value="non_paye">Non payé</option>
          <option value="partiel">Partiel</option>
        </select>
      </div>

      {/* Liste */}
      {filteredSaisies.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucune saisie trouvée.
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
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filteredSaisies.map((s: SaisieComptableType) => (
                  <tr key={s.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(s.date_operation).toLocaleDateString()}
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{s.type}</td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">{s.beneficiaire || '-'}</td>
                    <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                      {s.montant_ttc.toLocaleString()} FCFA
                    </td>
                    <td className="px-4 py-3 text-center">
                      <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${
                        s.statut_paiement === 'paye' ? 'bg-[var(--color-success)]' :
                        s.statut_paiement === 'partiel' ? 'bg-[var(--color-warning)]' :
                        'bg-[var(--color-danger)]'
                      }`}>
                        {s.statut_paiement === 'paye' ? '✅ Payé' :
                         s.statut_paiement === 'partiel' ? '⚠️ Partiel' :
                         '❌ Non payé'}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-center">
                      <div className="flex justify-center gap-1">
                        {s.statut_paiement !== 'paye' && (
                          <button
                            onClick={() => handleStatutChange(s.id, 'paye')}
                            className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                            title="Marquer comme payé"
                          >
                            <CheckCircle size={16} />
                          </button>
                        )}
                        <button
                          onClick={() => handleDelete(s.id)}
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

      {/* Formulaire de saisie */}
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
            className="w-full max-w-2xl max-h-[90vh] overflow-y-auto p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">Nouvelle saisie</h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type *</label>
                  <select
                    value={form.type}
                    onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    required
                  >
                    <option value="facture_fournisseur">Facture fournisseur</option>
                    <option value="facture_client">Facture client</option>
                    <option value="depense">Dépense</option>
                    <option value="salaire">Salaire</option>
                    <option value="ajustement">Ajustement</option>
                    <option value="autre">Autre</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date *</label>
                  <input
                    type="date"
                    value={form.date_operation}
                    onChange={(e) => setForm({ ...form, date_operation: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    required
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Bénéficiaire *</label>
                  <input
                    type="text"
                    value={form.beneficiaire}
                    onChange={(e) => setForm({ ...form, beneficiaire: e.target.value })}
                    placeholder="Nom du fournisseur / client / bénéficiaire"
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant HT (FCFA)</label>
                  <input
                    type="number"
                    value={form.montant_ht}
                    onChange={(e) => setForm({ ...form, montant_ht: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step={100}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant TTC (FCFA)</label>
                  <input
                    type="number"
                    value={form.montant_ttc}
                    onChange={(e) => setForm({ ...form, montant_ttc: parseFloat(e.target.value) || 0 })}
                    min={0}
                    step={100}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    required
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date d'échéance</label>
                  <input
                    type="date"
                    value={form.date_echeance}
                    onChange={(e) => setForm({ ...form, date_echeance: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Statut paiement</label>
                  <select
                    value={form.statut_paiement}
                    onChange={(e) => setForm({ ...form, statut_paiement: e.target.value as any })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="non_paye">Non payé</option>
                    <option value="partiel">Partiellement payé</option>
                    <option value="paye">Payé</option>
                  </select>
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Description / Motif</label>
                  <textarea
                    value={form.description}
                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                    rows={2}
                    placeholder="Détails supplémentaires..."
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
                <div className="md:col-span-2">
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Pièce jointe (optionnel)</label>
                  <UploadDocument
                    files={form.piece_jointe}
                    onChange={(urls) => setForm({ ...form, piece_jointe: urls })}
                    max={1}
                    bucket="documents"
                    label="Ajouter une facture ou un justificatif"
                  />
                </div>
              </div>

              {error && <div className="p-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm">{error}</div>}

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
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-white ${
                    loading
                      ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                      : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {loading ? 'Enregistrement...' : '✅ Enregistrer'}
                </button>
              </div>
            </form>
          </MotionBox>
        </MotionBox>
      )}
    </div>
  );
};

export default SaisiePage;
