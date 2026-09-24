import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { UploadDocument } from '../components/UploadDocument';
import { BeneficiaireSelect } from '../components/BeneficiaireSelect';
import { FournisseurQuickAdd } from '../components/FournisseurQuickAdd';
import { useCreateFacture, useUpdateFacture, useFactures } from '../hooks/useFactures';
import { useComptes } from '../hooks/useComptabilite';
import { useComptabiliserFacture } from '../hooks/useComptabilisation';
import { supabase } from '../lib/supabaseClient';
import { FactureFormData } from '../types/facture';
import { ArrowLeft, Save, X, Receipt, Sparkles } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface RouteParams {
  id?: string;
  type?: 'emise' | 'recue';
}

export const FactureFormPage: React.FC = () => {
  const history = useHistory();
  const { id, type: typeParam } = useParams<RouteParams>();
  const isEdit = !!id;
  const { data: factures = [] } = useFactures();
  const { data: comptes = [] } = useComptes();
  const createMutation = useCreateFacture();
  const updateMutation = useUpdateFacture();
  const comptabiliserFacture = useComptabiliserFacture();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [comptabilizing, setComptabilizing] = useState(false);
  const [showFournisseurModal, setShowFournisseurModal] = useState(false);
  const [form, setForm] = useState<FactureFormData & { compte_debit_id?: string; compte_credit_id?: string }>({
    type: (typeParam as 'emise' | 'recue') || 'emise',
    numero: '',
    date_emission: new Date().toISOString().split('T')[0],
    date_echeance: '',
    montant_ht: 0,
    tva: 0,
    montant_ttc: 0,
    statut: 'brouillon',
    fournisseur_client_nom: '',
    fournisseur_client_id: '', // 🔧 comptes auxiliaires par tiers
    description: '',
    fichier_url: '',
    compte_debit_id: '',
    compte_credit_id: '',
  });
  const [files, setFiles] = useState<string[]>([]);

  // 🆕 Facture actuellement éditée (si applicable) et son état de liaison
  // comptable — utilisé pour proposer une comptabilisation a posteriori
  // quand la facture existe mais n'a jamais été transmise à la
  // comptabilité (ex : plan comptable pas encore initialisé au moment
  // de la création).
  const factureActuelle = isEdit ? factures.find(f => f.id === id) : undefined;
  const dejaComptabilisee = !!factureActuelle?.transaction_id;

  const handleComptabiliserMaintenant = async () => {
    if (!factureActuelle || !form.compte_debit_id || !form.compte_credit_id) {
      toastError('Sélectionnez les comptes débit et crédit avant de comptabiliser');
      return;
    }
    setComptabilizing(true);
    try {
      const userId = (await supabase.auth.getUser()).data.user?.id;
      if (!userId) throw new Error('Utilisateur non authentifié');
      await comptabiliserFacture.mutateAsync({
        factureId: factureActuelle.id,
        montant: form.montant_ttc,
        compteDebitId: form.compte_debit_id,
        compteCreditId: form.compte_credit_id,
        type: form.type,
        libelle: `N°${form.numero} - ${form.fournisseur_client_nom || 'Sans bénéficiaire'}`,
        userId,
      } as any);
      success('Facture comptabilisée ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setComptabilizing(false);
    }
  };

  useEffect(() => {
    if (isEdit && id) {
      const facture = factures.find(f => f.id === id);
      if (facture) {
        setForm({
          type: facture.type,
          numero: facture.numero,
          date_emission: facture.date_emission,
          date_echeance: facture.date_echeance || '',
          montant_ht: facture.montant_ht,
          tva: facture.tva,
          montant_ttc: facture.montant_ttc,
          statut: facture.statut,
          fournisseur_client_nom: facture.fournisseur_client_nom || '',
          fournisseur_client_id: (facture as any).fournisseur_client_id || '', // 🔧 comptes auxiliaires par tiers
          description: facture.description || '',
          fichier_url: facture.fichier_url || '',
          // 🔧 Bug corrigé : avant, ces champs étaient toujours réinitialisés
          // à '' en édition, alors que la facture les stocke déjà — les
          // comptes réellement utilisés pour l'écriture comptable étaient
          // donc perdus (et remplacés par les valeurs par défaut du type,
          // via le second useEffect ci-dessous, sans lien avec l'écriture
          // déjà postée).
          compte_debit_id: facture.compte_debit_id || '',
          compte_credit_id: facture.compte_credit_id || '',
        });
        if (facture.fichier_url) setFiles([facture.fichier_url]);
      }
      return;
    }

    // Définir les comptes par défaut selon le type (création uniquement)
    const compteDebit = comptes.find(c => c.numero === (form.type === 'emise' ? '411000' : '611000'));
    const compteCredit = comptes.find(c => c.numero === (form.type === 'emise' ? '701000' : '401000'));
    setForm(prev => ({
      ...prev,
      compte_debit_id: compteDebit?.id || '',
      compte_credit_id: compteCredit?.id || '',
    }));
  }, [isEdit, id, factures, comptes]);

  useEffect(() => {
    // Mettre à jour les comptes par défaut quand le type change —
    // 🔧 Bug corrigé : ce useEffect tournait aussi en mode édition et
    // écrasait systématiquement les comptes déjà liés à la facture
    // (chargés ci-dessus) par les valeurs par défaut du type, même sans
    // action de l'utilisateur. On ne l'applique donc plus qu'en création.
    if (isEdit) return;
    const compteDebit = comptes.find(c => c.numero === (form.type === 'emise' ? '411000' : '611000'));
    const compteCredit = comptes.find(c => c.numero === (form.type === 'emise' ? '701000' : '401000'));
    setForm(prev => ({
      ...prev,
      compte_debit_id: compteDebit?.id || '',
      compte_credit_id: compteCredit?.id || '',
    }));
  }, [form.type, comptes, isEdit]);

  const handleMontantChange = () => {
    const tva = form.montant_ht * 0.18;
    const ttc = form.montant_ht + tva;
    setForm(prev => ({ ...prev, tva, montant_ttc: ttc }));
  };

  useEffect(() => {
    handleMontantChange();
  }, [form.montant_ht]);

  const handleBeneficiaireChange = (nom: string, id?: string) => {
    // 🔧 comptes auxiliaires par tiers : on garde l'id du tiers sélectionné
    // pour le rattacher à son sous-compte 401xxx/411xxx à la création de
    // la facture (voir useCreateFacture).
    setForm(prev => ({ ...prev, fournisseur_client_nom: nom, fournisseur_client_id: id || '' }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const data = { 
        ...form, 
        fichier_url: files[0] || '',
        // 🔧 Bug corrigé : une fois la facture comptabilisée, on ne
        // renvoie plus compte_debit_id/compte_credit_id lors d'une mise
        // à jour, pour ne pas désynchroniser ces colonnes de l'écriture
        // déjà postée (qui n'est, elle, jamais mise à jour automatiquement).
        compte_debit_id: dejaComptabilisee ? factureActuelle?.compte_debit_id : form.compte_debit_id,
        compte_credit_id: dejaComptabilisee ? factureActuelle?.compte_credit_id : form.compte_credit_id,
      };
      if (isEdit && id) {
        await updateMutation.mutateAsync({ id, data });
        success('Facture mise à jour ✅');
      } else {
        await createMutation.mutateAsync(data);
        success('Facture créée ✅');
      }
      history.replace('/gestion/comptabilite/factures');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const title = isEdit ? 'Modifier la facture' : `Émettre une facture ${form.type === 'emise' ? 'client' : 'fournisseur'}`;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.replace('/gestion/comptabilite/factures')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{title}</h1>
      </div>

      <MotionBox type="card" variant="elevated" className="p-6">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type *</label>
              <select
                value={form.type}
                onChange={(e) => setForm({ ...form, type: e.target.value as 'emise' | 'recue' })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                disabled={isEdit}
              >
                <option value="emise">Facture client (émise)</option>
                <option value="recue">Facture fournisseur (reçue)</option>
              </select>
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Numéro *</label>
              <input
                type="text"
                value={form.numero}
                onChange={(e) => setForm({ ...form, numero: e.target.value })}
                placeholder="F2025-001"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Date d'émission *</label>
              <input
                type="date"
                value={form.date_emission}
                onChange={(e) => setForm({ ...form, date_emission: e.target.value })}
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
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant HT (FCFA) *</label>
              <input
                type="number"
                value={form.montant_ht}
                onChange={(e) => setForm({ ...form, montant_ht: parseFloat(e.target.value) || 0 })}
                min={0}
                step={100}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">TVA (FCFA)</label>
              <input
                type="number"
                value={form.tva}
                disabled
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] cursor-not-allowed opacity-70"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant TTC (FCFA) *</label>
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
            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Bénéficiaire</label>
              <BeneficiaireSelect
                value={form.fournisseur_client_nom || ''}
                onChange={handleBeneficiaireChange}
                placeholder="Sélectionner ou saisir un bénéficiaire"
                type={form.type === 'recue' ? 'fournisseur' : 'client'}
                onAddNew={() => setShowFournisseurModal(true)}
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Statut</label>
              <select
                value={form.statut}
                onChange={(e) => setForm({ ...form, statut: e.target.value as any })}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="brouillon">Brouillon</option>
                <option value="envoyee">Envoyée</option>
                <option value="payee">Payée</option>
                <option value="en_retard">En retard</option>
              </select>
            </div>

            {/* Comptes comptables */}
            <div className="md:col-span-2">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
                <Receipt size={18} /> Comptes comptables
              </h3>
              {isEdit && (
                dejaComptabilisee ? (
                  <p className="text-xs text-[var(--color-success)] mb-2">
                    ✅ Facture déjà comptabilisée — ces comptes ne sont affichés qu'à titre indicatif.
                  </p>
                ) : (
                  <div className="mb-3 p-3 rounded-xl bg-[var(--color-warning)]/10 flex items-center justify-between gap-3 flex-wrap">
                    <p className="text-xs text-[var(--color-warning)]">
                      ⚠️ Cette facture n'a jamais été transmise à la comptabilité (comptes probablement
                      manquants au moment de sa création).
                    </p>
                    <button
                      type="button"
                      onClick={handleComptabiliserMaintenant}
                      disabled={comptabilizing}
                      className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-xs flex items-center gap-1 whitespace-nowrap"
                    >
                      <Sparkles size={14} /> {comptabilizing ? 'Comptabilisation...' : 'Comptabiliser maintenant'}
                    </button>
                  </div>
                )
              )}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                    Compte débit {form.type === 'emise' ? '(Client)' : '(Charge)'}
                  </label>
                  <select
                    value={form.compte_debit_id}
                    onChange={(e) => setForm({ ...form, compte_debit_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="">Sélectionner</option>
                    {comptes.filter((c: any) => c.type === 'actif' || c.type === 'charge').map((c: any) => (
                      <option key={c.id} value={c.id}>{c.numero} - {c.nom}</option>
                    ))}
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                    Compte crédit {form.type === 'emise' ? '(Vente)' : '(Fournisseur)'}
                  </label>
                  <select
                    value={form.compte_credit_id}
                    onChange={(e) => setForm({ ...form, compte_credit_id: e.target.value })}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="">Sélectionner</option>
                    {comptes.filter((c: any) => c.type === 'produit' || c.type === 'passif').map((c: any) => (
                      <option key={c.id} value={c.id}>{c.numero} - {c.nom}</option>
                    ))}
                  </select>
                </div>
              </div>
            </div>

            <div className="md:col-span-2">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Description</label>
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
                files={files}
                onChange={setFiles}
                max={1}
                bucket="documents"
                label="Ajouter une facture (PDF, image...)"
              />
            </div>
          </div>

          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button
              type="button"
              onClick={() => history.replace('/gestion/comptabilite/factures')}
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
                  {isEdit ? 'Mettre à jour' : 'Créer'}
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
          setForm(prev => ({ ...prev, fournisseur_client_nom: nom }));
        }}
      />
    </div>
  );
};

export default FactureFormPage;
