import React, { useState, useEffect } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useMouvements, useCreateMouvement } from '../hooks/useMouvements';
import { useProduits } from '../hooks/useProduits';
import { useMagasins } from '../hooks/useMagasins';
import { useEntrepots } from '../hooks/useEntrepots';
import { supabase } from '../lib/supabaseClient';
import { TypeMouvement } from '../types/stock';
import { Search, Plus, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

const typeLabels: Record<TypeMouvement, string> = {
  entree: '📥 Entrée',
  sortie: '📤 Sortie',
  ajustement: '🔄 Ajustement',
  perte: '🚨 Perte',
  transfert: '🔄 Transfert',
  transfert_magasin: '🏪 Transfert magasin',
  transfert_entrepot: '🏭 Transfert entrepôt',
  vente: '🛒 Vente',
};

const typeColors: Record<TypeMouvement, string> = {
  entree: '#2F9E44',
  sortie: '#E03131',
  ajustement: '#F76707',
  perte: '#E03131',
  transfert: '#6C5CE7',
  transfert_magasin: '#1971C2',
  transfert_entrepot: '#1971C2',
  vente: '#1E3A5F',
};

export const MouvementsPage: React.FC = () => {
  const { success, error: toastError } = useToast();
  const [searchTerm, setSearchTerm] = useState('');
  const [filtreType, setFiltreType] = useState<TypeMouvement | ''>('');
  const [showForm, setShowForm] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    produit_id: '',
    type: 'entree' as TypeMouvement,
    quantite: 1,
    motif: '',
    provenance_id: '',
    destination_id: '',
    provenance_type: 'magasin' as 'magasin' | 'entrepot',
    destination_type: 'magasin' as 'magasin' | 'entrepot',
  });

  const { data: mouvements = [], isLoading, refetch } = useMouvements();
  const { data: produits = [] } = useProduits();
  const { data: magasins = [] } = useMagasins();
  const { data: entrepots = [] } = useEntrepots();
  const createMouvement = useCreateMouvement();

  const selectedProduit = produits.find(p => p.id === form.produit_id);

  useEffect(() => {
    if (form.type === 'transfert_magasin') {
      setForm(prev => ({
        ...prev,
        provenance_type: 'magasin',
        destination_type: 'magasin',
        provenance_id: selectedProduit?.magasin_id || '',
        destination_id: '',
      }));
    } else if (form.type === 'transfert_entrepot') {
      setForm(prev => ({
        ...prev,
        provenance_type: 'entrepot',
        destination_type: 'entrepot',
        provenance_id: selectedProduit?.entrepot_id || '',
        destination_id: '',
      }));
    }
  }, [form.type, selectedProduit]);

  useEffect(() => {
    if (selectedProduit) {
      if (form.type === 'transfert_magasin' && selectedProduit.magasin_id) {
        setForm(prev => ({ ...prev, provenance_id: selectedProduit.magasin_id || '' }));
      } else if (form.type === 'transfert_entrepot' && selectedProduit.entrepot_id) {
        setForm(prev => ({ ...prev, provenance_id: selectedProduit.entrepot_id || '' }));
      }
    }
  }, [selectedProduit, form.type]);

  const filtered = mouvements.filter(m => {
    const produit = produits.find(p => p.id === m.produit_id);
    const nomMatch = produit?.nom?.toLowerCase().includes(searchTerm.toLowerCase()) ||
      m.motif?.toLowerCase().includes(searchTerm.toLowerCase());
    const typeMatch = filtreType ? m.type === filtreType : true;
    return nomMatch && typeMatch;
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!form.produit_id) { toastError('Veuillez sélectionner un produit'); return; }
    if (form.quantite <= 0) { toastError('La quantité doit être supérieure à 0'); return; }

    if (form.type === 'transfert_magasin' || form.type === 'transfert_entrepot') {
      if (!form.provenance_id) { toastError('Veuillez sélectionner la provenance'); return; }
      if (!form.destination_id) { toastError('Veuillez sélectionner la destination'); return; }
      if (form.provenance_id === form.destination_id) {
        toastError('Provenance et destination doivent être différentes');
        return;
      }
    }

    setLoading(true);
    try {
      const isTransfert = form.type === 'transfert_magasin' || form.type === 'transfert_entrepot';
      const nouvelleQuantite = form.type === 'entree'
        ? (selectedProduit?.quantite || 0) + form.quantite
        : (selectedProduit?.quantite || 0) - form.quantite;

      let mouvementData: any = {
        produit_id: form.produit_id,
        type: form.type,
        quantite: form.quantite,
        ancienne_quantite: selectedProduit?.quantite || 0,
        nouvelle_quantite: isTransfert ? (selectedProduit?.quantite || 0) : nouvelleQuantite,
        motif: form.motif || 'Mouvement manuel',
        magasin_id: selectedProduit?.magasin_id || undefined,
        entrepot_id: selectedProduit?.entrepot_id || undefined,
      };

      if (isTransfert) {
        mouvementData.provenance_id = form.provenance_id;
        mouvementData.destination_id = form.destination_id;
        mouvementData.provenance_type = form.provenance_type;
        mouvementData.destination_type = form.destination_type;
        mouvementData.motif = `Transfert vers ${form.destination_id}`;
      }

      await createMouvement.mutateAsync(mouvementData);

      let updateData: any = {};
      if (!isTransfert) updateData.quantite = nouvelleQuantite;
      if (form.type === 'transfert_magasin') updateData.magasin_id = form.destination_id;
      else if (form.type === 'transfert_entrepot') updateData.entrepot_id = form.destination_id;

      if (Object.keys(updateData).length > 0) {
        await supabase.from('produits').update(updateData).eq('id', form.produit_id);
      }

      success('Mouvement enregistré ✅');
      setShowForm(false);
      setForm({
        produit_id: '',
        type: 'entree',
        quantite: 1,
        motif: '',
        provenance_id: '',
        destination_id: '',
        provenance_type: 'magasin',
        destination_type: 'magasin',
      });
      refetch();
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setLoading(false);
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  const isTransfert = form.type === 'transfert_magasin' || form.type === 'transfert_entrepot';
  const provenanceList = form.type === 'transfert_magasin' ? magasins : entrepots;
  const destinationList = form.type === 'transfert_magasin' ? magasins : entrepots;
  const provenanceLabel = form.type === 'transfert_magasin' ? 'Magasin source' : 'Entrepôt source';
  const destinationLabel = form.type === 'transfert_magasin' ? 'Magasin destination' : 'Entrepôt destination';

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📊 Mouvements de stock</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Historique complet des mouvements</p>
        </div>
        <button
          onClick={() => setShowForm(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
          <Plus size={18} /> Nouveau mouvement
        </button>
      </div>

      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher par produit ou motif..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <select
          value={filtreType}
          onChange={(e) => setFiltreType(e.target.value as TypeMouvement | '')}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les types</option>
          {Object.entries(typeLabels).map(([type, label]) => (
            <option key={type} value={type}>{label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun mouvement trouvé.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Produit</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Type</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Qté</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)] hidden lg:table-cell">Motif</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((m) => {
                  const produit = produits.find(p => p.id === m.produit_id);
                  return (
                    <tr key={m.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                        {new Date(m.date_mouvement).toLocaleString()}
                      </td>
                      <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                        {produit?.nom || 'Produit inconnu'}
                      </td>
                      <td className="px-4 py-3">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: typeColors[m.type] }}
                        >
                          {typeLabels[m.type]}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center font-medium text-[var(--color-textPrimary)]">
                        {m.quantite}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden lg:table-cell">
                        {m.motif || '-'}
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        </MotionBox>
      )}

      {/* Modal de nouveau mouvement */}
      {showForm && (
        <MotionBox
          as="div"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] modal-overlay-safe"
          onClick={(e) => e.target === e.currentTarget && setShowForm(false)}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            type="card"
            variant="xlarge"
            className="w-full max-w-md p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl modal-content-safe overflow-y-auto"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">Nouveau mouvement</h3>
              <button onClick={() => setShowForm(false)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>

            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type *</label>
                <select
                  value={form.type}
                  onChange={(e) => setForm({ ...form, type: e.target.value as TypeMouvement, provenance_id: '', destination_id: '' })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  {Object.entries(typeLabels).map(([type, label]) => (
                    <option key={type} value={type}>{label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Produit *</label>
                <select
                  value={form.produit_id}
                  onChange={(e) => setForm({ ...form, produit_id: e.target.value })}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner un produit</option>
                  {produits.filter((p: any) => p.actif).map((p: any) => (
                    <option key={p.id} value={p.id}>{p.nom} - Stock: {p.quantite}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Quantité *</label>
                <input
                  type="number"
                  value={form.quantite}
                  onChange={(e) => setForm({ ...form, quantite: parseInt(e.target.value) || 1 })}
                  min={1}
                  required
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              {isTransfert && (
                <>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">{provenanceLabel} *</label>
                    <select
                      value={form.provenance_id}
                      onChange={(e) => setForm({ ...form, provenance_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    >
                      <option value="">Sélectionner</option>
                      {provenanceList.map((item: any) => (
                        <option key={item.id} value={item.id}>{item.nom}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">{destinationLabel} *</label>
                    <select
                      value={form.destination_id}
                      onChange={(e) => setForm({ ...form, destination_id: e.target.value })}
                      required
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    >
                      <option value="">Sélectionner</option>
                      {destinationList.map((item: any) => (
                        <option key={item.id} value={item.id}>{item.nom}</option>
                      ))}
                    </select>
                  </div>
                </>
              )}

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Motif</label>
                <textarea
                  value={form.motif}
                  onChange={(e) => setForm({ ...form, motif: e.target.value })}
                  rows={2}
                  placeholder="Raison du mouvement..."
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
                  disabled={loading}
                  className={`px-4 py-2 rounded-xl text-white ${
                    loading ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  }`}
                >
                  {loading ? 'Enregistrement...' : 'Enregistrer'}
                </button>
              </div>
            </form>
          </MotionBox>
        </MotionBox>
      )}
    </div>
  );
};

export default MouvementsPage;
