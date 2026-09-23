// ============================================================
// ÉCRITURE MULTI-LIGNES — Modal de saisie/édition
// ------------------------------------------------------------
// Formulaire à lignes dynamiques (ajouter/retirer une ligne) pour le
// nouveau moteur comptable N comptes (ecritures / ecritures_lignes).
// Affiche le total débit / crédit en direct et bloque l'enregistrement
// tant que l'écriture n'est pas équilibrée (même règle que côté SQL).
// ============================================================

import React, { useState, useEffect } from 'react';
import { MotionBox } from './MotionBox';
import { CompteSearchSelect } from './CompteSearchSelect';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import {
  useCreerEcritureMultiligne,
  useModifierEcritureMultiligne,
  useEcriture,
} from '../hooks/useEcritureMultiligne';
import { LigneEcritureFormData, SensLigne, calculerEquilibre } from '../types/ecritures';
import { TypeTransaction } from '../types/comptabilite';
import { X, Save, Plus, Trash2, Scale } from 'lucide-react';

interface EcritureMultiligneModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess?: () => void;
  ecritureId?: string; // fourni => mode édition
}

const TYPES: { value: TypeTransaction; label: string }[] = [
  { value: 'depense', label: 'Dépense' },
  { value: 'achat', label: 'Achat' },
  { value: 'vente', label: 'Vente' },
  { value: 'salaire', label: 'Salaire' },
  { value: 'ajustement', label: 'Ajustement' },
  { value: 'autre', label: 'Autre' },
];

const ligneVide = (): LigneEcritureFormData => ({
  compte_id: '',
  sens: 'debit',
  montant: 0,
  libelle_ligne: '',
});

export const EcritureMultiligneModal: React.FC<EcritureMultiligneModalProps> = ({
  isOpen,
  onClose,
  onSuccess,
  ecritureId,
}) => {
  const isEdit = !!ecritureId;
  const { user } = useAuth();
  const { error: toastError } = useToast();
  const { data: ecritureExistante } = useEcriture(ecritureId);
  const creer = useCreerEcritureMultiligne();
  const modifier = useModifierEcritureMultiligne();
  const loading = creer.isLoading || modifier.isLoading;

  const [dateEcriture, setDateEcriture] = useState(new Date().toISOString().slice(0, 10));
  const [libelle, setLibelle] = useState('');
  const [type, setType] = useState<TypeTransaction>('autre');
  const [reference, setReference] = useState('');
  const [lignes, setLignes] = useState<LigneEcritureFormData[]>([ligneVide(), ligneVide()]);

  // Préremplissage en mode édition
  useEffect(() => {
    if (isEdit && ecritureExistante) {
      setDateEcriture(ecritureExistante.date_ecriture.slice(0, 10));
      setLibelle(ecritureExistante.libelle);
      setType(ecritureExistante.type);
      setReference(ecritureExistante.reference || '');
      setLignes(
        (ecritureExistante.lignes || []).map((l) => ({
          compte_id: l.compte_id,
          sens: l.sens,
          montant: l.montant,
          libelle_ligne: l.libelle_ligne || '',
        }))
      );
    }
  }, [isEdit, ecritureExistante]);

  // Réinitialisation à l'ouverture en mode création
  useEffect(() => {
    if (isOpen && !isEdit) {
      setDateEcriture(new Date().toISOString().slice(0, 10));
      setLibelle('');
      setType('autre');
      setReference('');
      setLignes([ligneVide(), ligneVide()]);
    }
  }, [isOpen, isEdit]);

  if (!isOpen) return null;

  const { totalDebit, totalCredit, equilibree } = calculerEquilibre(lignes);
  const ecart = totalDebit - totalCredit;

  const modifierLigne = (index: number, champ: keyof LigneEcritureFormData, valeur: any) => {
    setLignes((prev) => prev.map((l, i) => (i === index ? { ...l, [champ]: valeur } : l)));
  };

  const ajouterLigne = () => setLignes((prev) => [...prev, ligneVide()]);

  const retirerLigne = (index: number) => {
    if (lignes.length <= 2) {
      toastError('Une écriture doit comporter au moins 2 lignes');
      return;
    }
    setLignes((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async () => {
    if (!libelle.trim()) {
      toastError("Le libellé de l'écriture est obligatoire");
      return;
    }
    if (!user?.id) {
      toastError('Utilisateur non identifié');
      return;
    }
    if (!equilibree) {
      toastError(`Écriture déséquilibrée : débit ${totalDebit} ≠ crédit ${totalCredit}`);
      return;
    }

    try {
      if (isEdit && ecritureId) {
        await modifier.mutateAsync({
          ecritureId,
          userId: user.id,
          date_ecriture: dateEcriture,
          libelle: libelle.trim(),
          type,
          reference: reference.trim() || undefined,
          lignes,
        });
      } else {
        await creer.mutateAsync({
          userId: user.id,
          date_ecriture: dateEcriture,
          libelle: libelle.trim(),
          type,
          reference: reference.trim() || undefined,
          lignes,
        });
      }
      onSuccess?.();
      onClose();
    } catch (err) {
      // Le toast d'erreur est déjà géré par le hook (onError)
    }
  };

  return (
    <MotionBox
      className="fixed inset-0 bg-black/60 flex items-start sm:items-center justify-center z-[150] modal-overlay-safe"
      onClick={onClose}
    >
      <MotionBox
        onClick={(e: React.MouseEvent) => e.stopPropagation()}
        className="w-full max-w-3xl modal-content-safe my-auto flex flex-col bg-[var(--color-cardBg)] rounded-2xl shadow-2xl overflow-hidden"
      >
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)] flex-shrink-0">
          <h2 className="text-lg font-semibold text-[var(--color-textPrimary)]">
            {isEdit ? "Modifier l'écriture" : 'Nouvelle écriture multi-lignes'}
          </h2>
          <button onClick={onClose} className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]">
            <X size={22} />
          </button>
        </div>

        {/* Corps */}
        <div className="px-6 py-4 space-y-4 overflow-y-auto" style={{ maxHeight: '70vh' }}>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            <div>
              <label className="text-sm text-[var(--color-textSecondary)]">Date</label>
              <input
                type="date"
                value={dateEcriture}
                onChange={(e) => setDateEcriture(e.target.value)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="text-sm text-[var(--color-textSecondary)]">Type</label>
              <select
                value={type}
                onChange={(e) => setType(e.target.value as TypeTransaction)}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                {TYPES.map((t) => (
                  <option key={t.value} value={t.value}>{t.label}</option>
                ))}
              </select>
            </div>
            <div>
              <label className="text-sm text-[var(--color-textSecondary)]">Référence (optionnel)</label>
              <input
                type="text"
                value={reference}
                onChange={(e) => setReference(e.target.value)}
                placeholder="Ex: FACT-2026-014"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
          </div>

          <div>
            <label className="text-sm text-[var(--color-textSecondary)]">Libellé</label>
            <input
              type="text"
              value={libelle}
              onChange={(e) => setLibelle(e.target.value)}
              placeholder="Ex: Répartition frais de transport sur 3 magasins"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          </div>

          {/* Lignes */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <label className="text-sm font-medium text-[var(--color-textPrimary)]">Lignes</label>
              <button
                type="button"
                onClick={ajouterLigne}
                className="flex items-center gap-1 text-sm px-3 py-1 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)]"
              >
                <Plus size={16} /> Ajouter une ligne
              </button>
            </div>

            {lignes.map((ligne, index) => (
              <div key={index} className="flex flex-col sm:flex-row gap-2 p-3 rounded-xl border border-[var(--color-borderColor)]">
                <CompteSearchSelect
                  value={ligne.compte_id}
                  onChange={(v) => modifierLigne(index, 'compte_id', v)}
                  className="flex-1"
                />
                <select
                  value={ligne.sens}
                  onChange={(e) => modifierLigne(index, 'sens', e.target.value as SensLigne)}
                  className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="debit">Débit</option>
                  <option value="credit">Crédit</option>
                </select>
                <input
                  type="number"
                  min={0}
                  step="0.01"
                  value={ligne.montant || ''}
                  onChange={(e) => modifierLigne(index, 'montant', parseFloat(e.target.value) || 0)}
                  placeholder="Montant"
                  className="w-full sm:w-32 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
                <button
                  type="button"
                  onClick={() => retirerLigne(index)}
                  className="px-2 text-red-500 hover:text-red-600 self-center"
                  title="Retirer cette ligne"
                >
                  <Trash2 size={18} />
                </button>
              </div>
            ))}
          </div>

          {/* Équilibre */}
          <div
            className={`flex items-center gap-2 p-3 rounded-xl text-sm ${
              equilibree
                ? 'bg-green-500/10 text-green-600'
                : 'bg-red-500/10 text-red-600'
            }`}
          >
            <Scale size={18} />
            <span>
              Débit : <strong>{totalDebit.toLocaleString()}</strong> — Crédit :{' '}
              <strong>{totalCredit.toLocaleString()}</strong>
              {!equilibree && ` — écart de ${Math.abs(ecart).toLocaleString()}`}
              {equilibree && ' — équilibrée ✅'}
            </span>
          </div>
        </div>

        {/* Footer */}
        <div className="flex justify-end gap-3 px-6 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] flex-shrink-0">
          <button
            onClick={onClose}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textPrimary)]"
          >
            Annuler
          </button>
          <button
            onClick={handleSubmit}
            disabled={loading || !equilibree}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl text-white ${
              loading || !equilibree
                ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
            }`}
          >
            <Save size={18} />
            {loading ? 'Enregistrement...' : 'Enregistrer'}
          </button>
        </div>
      </MotionBox>
    </MotionBox>
  );
};

export default EcritureMultiligneModal;
