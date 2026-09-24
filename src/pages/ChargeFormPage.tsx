import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { BeneficiaireSelect } from '../components/BeneficiaireSelect';
import { FournisseurQuickAdd } from '../components/FournisseurQuickAdd';
import { useCreateSaisie, useUpdateSaisie, useSaisies } from '../hooks/useComptabilite';
import { useChargesUsuelles } from '../hooks/useChargesUsuelles';
import { useComptes } from '../hooks/useComptabilite';
import { useComptabiliserCharge } from '../hooks/useComptabilisation';
import { supabase } from '../lib/supabaseClient';
import { ArrowLeft, Save, Plus, X, DollarSign, Receipt, Tag } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface RouteParams {
  id?: string;
}

export const ChargeFormPage: React.FC = () => {
  const history = useHistory();
  const { id } = useParams<RouteParams>();
  const isEdit = !!id;
  const { data: saisies = [] } = useSaisies();
  const { data: chargesUsuelles = [] } = useChargesUsuelles();
  const { data: comptes = [] } = useComptes();
  const createMutation = useCreateSaisie();
  const updateMutation = useUpdateSaisie();
  const comptabiliserCharge = useComptabiliserCharge();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [showFournisseurModal, setShowFournisseurModal] = useState(false);
  const [selectedChargeId, setSelectedChargeId] = useState<string>('');
  const [form, setForm] = useState({
    type: 'depense' as 'depense' | 'salaire' | 'ajustement' | 'autre',
    beneficiaire: '',
    beneficiaire_id: '',
    montant_ttc: 0,
    montant_ht: 0,
    taxe: 0,
    date_operation: new Date().toISOString().split('T')[0],
    date_echeance: '',
    statut_paiement: 'non_paye' as 'non_paye' | 'partiel' | 'paye',
    description: '',
    piece_jointe_url: '',
    compte_debit_id: '',
    compte_credit_id: '',
  });
  // 🔧 Bug corrigé : mémorise si la saisie est déjà liée à une écriture
  // comptable (transaction_id), pour ne JAMAIS recomptabiliser en double
  // à chaque enregistrement en mode édition.
  const [transactionIdExistante, setTransactionIdExistante] = useState<string>('');

  // Charger les données si édition
  useEffect(() => {
    if (isEdit && id) {
      const saisie = saisies.find((s: any) => s.id === id);
      if (saisie) {
        const typeMap: Record<string, 'depense' | 'salaire' | 'ajustement' | 'autre'> = {
          depense: 'depense',
          salaire: 'salaire',
          ajustement: 'ajustement',
          autre: 'autre',
        };
        setForm({
          type: typeMap[saisie.type] || 'depense',
          beneficiaire: saisie.beneficiaire || '',
          beneficiaire_id: saisie.beneficiaire_id || '',
          montant_ttc: saisie.montant_ttc,
          montant_ht: saisie.montant_ht || 0,
          taxe: saisie.taxe || 0,
          date_operation: saisie.date_operation,
          date_echeance: saisie.date_echeance || '',
          statut_paiement: saisie.statut_paiement || 'non_paye',
          description: saisie.description || '',
          piece_jointe_url: saisie.piece_jointe_url || '',
          // 🔧 Avant : réinitialisé à '' → les comptes déjà choisis étaient
          // perdus à chaque ouverture du formulaire d'édition.
          compte_debit_id: (saisie as any).compte_debit_id || '',
          compte_credit_id: (saisie as any).compte_credit_id || '',
        });
        setTransactionIdExistante((saisie as any).transaction_id || '');
      }
    }
  }, [isEdit, id, saisies]);

  // Charger une charge usuelle
  const handleChargeUsuelleSelect = (chargeId: string) => {
    const charge = chargesUsuelles.find((c: any) => c.id === chargeId);
    if (charge) {
      setSelectedChargeId(chargeId);
      setForm(prev => ({
        ...prev,
        type: charge.type === 'personnel' ? 'salaire' : 'depense',
        description: charge.description || charge.nom,
        compte_debit_id: charge.compte_debit_id || '',
        compte_credit_id: charge.compte_credit_id || '',
        montant_ttc: charge.montant_defaut || 0,
      }));
    }
  };

  const handleBeneficiaireChange = (nom: string, id?: string) => {
    setForm(prev => ({ ...prev, beneficiaire: nom, beneficiaire_id: id || '' }));
  };

  const calculateTaxe = (montant: number, taux: number = 18) => {
    const ht = montant / (1 + taux / 100);
    const taxe = montant - ht;
    return { ht, taxe };
  };

  const handleMontantChange = (value: number) => {
    const { ht, taxe } = calculateTaxe(value);
    setForm(prev => ({ ...prev, montant_ttc: value, montant_ht: ht, taxe }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (form.montant_ttc <= 0) {
      toastError('Le montant doit être supérieur à 0');
      return;
    }
    if (form.compte_debit_id && form.compte_credit_id && form.compte_debit_id === form.compte_credit_id) {
      toastError('Le compte débit et le compte crédit doivent être différents');
      return;
    }
    setLoading(true);
    try {
      const data = {
        type: form.type,
        beneficiaire: form.beneficiaire || 'Non spécifié',
        beneficiaire_id: form.beneficiaire_id || undefined,
        montant_ht: form.montant_ht || form.montant_ttc / 1.18,
        montant_ttc: form.montant_ttc,
        taxe: form.taxe || form.montant_ttc - form.montant_ttc / 1.18,
        date_operation: form.date_operation,
        date_echeance: form.date_echeance || undefined,
        statut_paiement: form.statut_paiement,
        description: form.description,
        piece_jointe_url: form.piece_jointe_url || undefined,
        // 🔧 Persister les comptes choisis sur la saisie elle-même, pour
        // pouvoir les recharger correctement en édition (voir useEffect
        // ci-dessus) et pour tracer quels comptes ont été utilisés.
        compte_debit_id: form.compte_debit_id || undefined,
        compte_credit_id: form.compte_credit_id || undefined,
      };

      let result;
      if (isEdit && id) {
        result = await updateMutation.mutateAsync({ id, data });
      } else {
        result = await createMutation.mutateAsync(data);
      }

      // 🔥 COMPTABILISATION — 🔧 Bug corrigé : ne comptabilise que si la
      // saisie n'est pas déjà liée à une transaction, pour éviter de créer
      // une écriture en double à chaque modification en mode édition.
      if (result && form.compte_debit_id && form.compte_credit_id && !transactionIdExistante) {
        const userId = (await supabase.auth.getUser()).data.user?.id;
        if (userId) {
          await comptabiliserCharge.mutateAsync({
            saisieId: result.id,
            montant: form.montant_ttc,
            compteDebitId: form.compte_debit_id,
            compteCreditId: form.compte_credit_id,
            type: form.type,
            libelle: form.description || form.beneficiaire || 'Charge',
            userId: userId,
            sourceTable: 'saisies_comptables',
          });
        }
      }

      success(isEdit ? 'Charge mise à jour ✅' : 'Charge enregistrée ✅');
      history.replace('/gestion/comptabilite/charges');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.replace('/gestion/comptabilite/charges')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">
          {isEdit ? 'Modifier la charge' : 'Nouvelle charge'}
        </h1>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* Charge usuelle pré-sélectionnée */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                <Tag size={16} className="inline mr-1" />
                Charge usuelle
              </label>
              <div className="flex gap-2">
                <select
                  value={selectedChargeId}
                  onChange={(e) => handleChargeUsuelleSelect(e.target.value)}
                  className="flex-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Sélectionner une charge usuelle...</option>
                  {chargesUsuelles.map((c: any) => (
                    <option key={c.id} value={c.id}>
                      {c.nom} {c.montant_defaut ? `(${c.montant_defaut.toLocaleString()} FCFA)` : ''}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Type */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type de charge *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              >
                <option value="depense">💸 Dépense</option>
                <option value="salaire">👤 Salaire</option>
                <option value="ajustement">🔄 Ajustement</option>
                <option value="autre">📄 Autre</option>
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

            {/* Bénéficiaire */}
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Bénéficiaire *</label>
              <BeneficiaireSelect
                value={form.beneficiaire}
                onChange={handleBeneficiaireChange}
                placeholder="Sélectionner ou saisir un bénéficiaire"
                type="all"
                onAddNew={() => setShowFournisseurModal(true)}
              />
            </div>

            {/* Montant */}
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant TTC (FCFA) *</label>
              <input
                type="number"
                value={form.montant_ttc}
                onChange={(e) => handleMontantChange(parseFloat(e.target.value) || 0)}
                min={0}
                step={100}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
              {form.taxe > 0 && (
                <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                  HT: {form.montant_ht.toLocaleString()} FCFA · TVA: {form.taxe.toLocaleString()} FCFA
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Statut de paiement</label>
              <select
                value={form.statut_paiement}
                onChange={(e) => setForm({ ...form, statut_paiement: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="non_paye">❌ Non payé</option>
                <option value="partiel">⚠️ Partiellement payé</option>
                <option value="paye">✅ Payé</option>
              </select>
            </div>

            {/* Comptes comptables */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
                <Receipt size={18} /> Comptes comptables
              </h3>
              {transactionIdExistante && (
                <p className="text-xs text-[var(--color-success)] mb-2">
                  ✅ Cette charge est déjà comptabilisée. Modifier les comptes ci-dessous ne créera pas de
                  nouvelle écriture — annulez puis recréez la charge si les comptes utilisés étaient incorrects.
                </p>
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte débit</label>
                  <select
                    value={form.compte_debit_id}
                    onChange={(e) => setForm({ ...form, compte_debit_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="">Sélectionner</option>
                    {comptes.filter((c: any) => c.type === 'charge' || c.type === 'actif').map((c: any) => (
                      <option key={c.id} value={c.id}>{c.numero} - {c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte crédit</label>
                  <select
                    value={form.compte_credit_id}
                    onChange={(e) => setForm({ ...form, compte_credit_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="">Sélectionner</option>
                    {comptes.filter((c: any) => c.type === 'passif' || c.type === 'actif').map((c: any) => (
                      <option key={c.id} value={c.id}>{c.numero} - {c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            {/* Description */}
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
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.replace('/gestion/comptabilite/charges')}
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
              {loading ? 'Enregistrement...' : (
                <span>
                  <Save size={18} className="inline mr-1" />
                  {isEdit ? 'Mettre à jour' : 'Enregistrer'}
                </span>
              )}
            </button>
          </div>
        </form>
      </MotionBox>

      <FournisseurQuickAdd
        isOpen={showFournisseurModal}
        onClose={() => setShowFournisseurModal(false)}
        onSuccess={(fournisseurId) => {
          const nom = prompt('Nom du fournisseur ajouté ?') || '';
          setForm(prev => ({ ...prev, beneficiaire: nom }));
        }}
      />
    </div>
  );
};

export default ChargeFormPage;
