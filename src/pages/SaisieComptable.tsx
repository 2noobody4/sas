import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useSaisies, useCreateSaisie, useUpdateStatutPaiement, useDeleteSaisie, useComptes, SaisieComptable as SaisieComptableType } from '../hooks/useComptabilite';
import { useComptabiliserCharge } from '../hooks/useComptabilisation';
import { useChargesUsuelles } from '../hooks/useChargesUsuelles';
import { useFournisseurs } from '../hooks/useFournisseurs';
import { useProduits } from '../hooks/useProduits';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { UploadDocument } from '../components/UploadDocument';
import { CompteSearchSelect } from '../components/CompteSearchSelect';
import { supabase } from '../lib/supabaseClient';
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
  const { data: comptes = [] } = useComptes();
  const { data: chargesUsuelles = [] } = useChargesUsuelles();
  const createSaisie = useCreateSaisie();
  const updateStatut = useUpdateStatutPaiement();
  const deleteSaisie = useDeleteSaisie();
  const comptabiliserCharge = useComptabiliserCharge();

  // 🆕 Pré-remplissage des comptes comptables — AVANT cette correction,
  // ce formulaire ("Nouvelle saisie", le seul point d'entrée réellement
  // accessible depuis la page Charges) ne proposait AUCUNE sélection de
  // comptes et n'appelait jamais la comptabilisation : les saisies créées
  // ici n'apparaissaient donc jamais dans le journal, le bilan ou le
  // compte de résultat.
  const [compteDebitId, setCompteDebitId] = useState('');
  const [compteCreditId, setCompteCreditId] = useState('');
  const [selectedChargeUsuelleId, setSelectedChargeUsuelleId] = useState('');

  const getCompteParNumero = (numero: string) => comptes.find((c: any) => c.numero === numero)?.id || '';

  // Comptes suggérés par défaut selon le type de saisie (SYSCOHADA) :
  //  - facture_fournisseur : Débit 611000 (charge) / Crédit 401000 (fournisseur)
  //  - facture_client      : Débit 411000 (client) / Crédit 701000 (vente)
  //  - salaire             : Débit 641000 (personnel) / Crédit 521000 (banque)
  //  - depense/ajustement/autre : Débit 651000 (autres charges) / Crédit 571000 (caisse)
  const suggererComptesParDefaut = (type: string) => {
    switch (type) {
      case 'facture_fournisseur':
        return { debit: getCompteParNumero('611000'), credit: getCompteParNumero('401000') };
      case 'facture_client':
        return { debit: getCompteParNumero('411000'), credit: getCompteParNumero('701000') };
      case 'salaire':
        return { debit: getCompteParNumero('641000'), credit: getCompteParNumero('521000') };
      default:
        return { debit: getCompteParNumero('651000'), credit: getCompteParNumero('571000') };
    }
  };

  // Sélection d'une charge usuelle : pré-remplit comptes + montant.
  const handleChargeUsuelleSelect = (chargeId: string) => {
    setSelectedChargeUsuelleId(chargeId);
    const charge = chargesUsuelles.find((c: any) => c.id === chargeId);
    if (charge) {
      setCompteDebitId(charge.compte_debit_id || '');
      setCompteCreditId(charge.compte_credit_id || '');
      // 🔧 Bug de build corrigé : `charge.montant_defaut` (number |
      // undefined) n'est pas correctement affiné à l'intérieur de la
      // closure passée à setForm — on l'extrait donc dans une constante
      // locale au type sûr avant de l'utiliser.
      const montantDefaut: number | undefined = charge.montant_defaut;
      if (montantDefaut) {
        setForm(prev => ({ ...prev, montant_ttc: montantDefaut, montant_ht: montantDefaut }));
      }
    }
  };

  const [showForm, setShowForm] = useState(false);
  // 🔧 Bug de build corrigé : sans annotation explicite, `useState({ type:
  // 'facture_fournisseur' as const, ... })` fige `form.type` au seul type
  // littéral "facture_fournisseur" (TypeScript n'élargit pas vers l'union
  // à partir d'un objet littéral). Toute comparaison `form.type ===
  // 'depense'` etc. était donc rejetée à la compilation.
  const [form, setForm] = useState<{
    type: 'facture_fournisseur' | 'facture_client' | 'depense' | 'salaire' | 'ajustement' | 'autre';
    beneficiaire: string;
    beneficiaire_id: string;
    montant_ht: number;
    montant_ttc: number;
    taxe: number;
    date_operation: string;
    date_echeance: string;
    statut_paiement: 'non_paye' | 'partiel' | 'paye';
    description: string;
    piece_jointe: string[];
  }>({
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
    if (compteDebitId && compteCreditId && compteDebitId === compteCreditId) {
      setError('Le compte débit et le compte crédit doivent être différents');
      return;
    }
    setLoading(true);
    try {
      const inserted = await createSaisie.mutateAsync({
        ...form,
        compte_debit_id: compteDebitId || undefined,
        compte_credit_id: compteCreditId || undefined,
        piece_jointe_url: form.piece_jointe[0] || '',
      });

      // 🆕 Comptabilisation — avant cette correction, cette page ne
      // déclenchait JAMAIS d'écriture comptable : les saisies restaient
      // invisibles du journal, du bilan et du compte de résultat.
      if (compteDebitId && compteCreditId && inserted?.id) {
        try {
          const userId = (await supabase.auth.getUser()).data.user?.id;
          if (userId) {
            await comptabiliserCharge.mutateAsync({
              saisieId: inserted.id,
              montant: form.montant_ttc,
              compteDebitId,
              compteCreditId,
              type: form.type as any,
              libelle: form.description || form.beneficiaire,
              userId,
              sourceTable: 'saisies_comptables',
            });
          }
        } catch (comptaErr: any) {
          setError(`Saisie enregistrée, mais la comptabilisation a échoué : ${comptaErr.message}`);
        }
      }

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
      setCompteDebitId('');
      setCompteCreditId('');
      setSelectedChargeUsuelleId('');
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
        <button
          onClick={() => {
            const { debit, credit } = suggererComptesParDefaut(form.type);
            setCompteDebitId(debit);
            setCompteCreditId(credit);
            setSelectedChargeUsuelleId('');
            setShowForm(true);
          }}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
        >
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
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] modal-overlay-safe"
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
                    onChange={(e) => {
                      const nouveauType = e.target.value as any;
                      setForm({ ...form, type: nouveauType });
                      setSelectedChargeUsuelleId('');
                      const { debit, credit } = suggererComptesParDefaut(nouveauType);
                      setCompteDebitId(debit);
                      setCompteCreditId(credit);
                    }}
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
                {(form.type === 'depense' || form.type === 'salaire' || form.type === 'ajustement' || form.type === 'autre') && chargesUsuelles.length > 0 && (
                  <div className="md:col-span-2">
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Charge usuelle (optionnel)</label>
                    <select
                      value={selectedChargeUsuelleId}
                      onChange={(e) => handleChargeUsuelleSelect(e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    >
                      <option value="">Sélectionner une charge usuelle...</option>
                      {chargesUsuelles.map((c: any) => (
                        <option key={c.id} value={c.id}>
                          {c.nom} {c.montant_defaut ? `(${c.montant_defaut.toLocaleString()} FCFA)` : ''}
                        </option>
                      ))}
                    </select>
                  </div>
                )}

                {/* 🆕 Comptes comptables — pré-remplis automatiquement selon le type
                    (et par la charge usuelle si sélectionnée), modifiables au besoin. */}
                <div className="md:col-span-2">
                  <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2 flex items-center gap-2">
                    <DollarSign size={16} /> Comptes comptables
                  </h3>
                  {comptes.length === 0 && (
                    <p className="text-xs text-[var(--color-warning)] mb-2">
                      ⚠️ Aucun compte trouvé. Initialisez le plan comptable OHADA depuis la page « Plan comptable ».
                    </p>
                  )}
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <div>
                      <label className="block text-xs text-[var(--color-textSecondary)] mb-1">Compte débit</label>
                      <CompteSearchSelect
                        value={compteDebitId}
                        onChange={setCompteDebitId}
                        placeholder="Sélectionner un compte débit"
                      />
                    </div>
                    <div>
                      <label className="block text-xs text-[var(--color-textSecondary)] mb-1">Compte crédit</label>
                      <CompteSearchSelect
                        value={compteCreditId}
                        onChange={setCompteCreditId}
                        placeholder="Sélectionner un compte crédit"
                      />
                    </div>
                  </div>
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
