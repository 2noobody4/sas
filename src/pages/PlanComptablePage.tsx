import React, { useState } from 'react';
import { MotionBox } from '../components/MotionBox';
import { useComptes, useCreateCompte } from '../hooks/useComptabilite';
import { useInitPlanComptable } from '../hooks/useInitPlanComptable';
import { TypeCompte } from '../types/comptabilite';
import { Search, ChevronDown, ChevronRight, Plus, Sparkles, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const PlanComptablePage: React.FC = () => {
  const { data: comptes = [], isLoading } = useComptes();
  const createCompte = useCreateCompte();
  const initPlanComptable = useInitPlanComptable();
  const { error: toastError } = useToast();
  const [search, setSearch] = useState('');
  const [expanded, setExpanded] = useState<Record<string, boolean>>({});
  const [showNewCompteModal, setShowNewCompteModal] = useState(false);
  const [newCompte, setNewCompte] = useState<{ numero: string; nom: string; type: TypeCompte }>({
    numero: '',
    nom: '',
    type: 'charge',
  });

  const toggleExpand = (id: string) => {
    setExpanded(prev => ({ ...prev, [id]: !prev[id] }));
  };

  // 🆕 Initialise le plan comptable OHADA de base (571000, 521000, 701000,
  // 401000, 411000, 641000...). Sans cette étape, aucune comptabilisation
  // automatique (ventes, achats, factures, charges, paie) ne peut trouver
  // les comptes dont elle a besoin.
  const handleInitPlanComptable = async () => {
    if (window.confirm("Créer les comptes OHADA de base qui n'existent pas encore ? (les comptes déjà présents ne seront pas dupliqués)")) {
      await initPlanComptable.mutateAsync();
    }
  };

  const handleCreateCompte = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCompte.numero.trim() || !newCompte.nom.trim()) {
      toastError('Numéro et nom du compte requis');
      return;
    }
    if (comptes.some(c => c.numero === newCompte.numero.trim())) {
      toastError(`Le compte ${newCompte.numero} existe déjà`);
      return;
    }
    try {
      await createCompte.mutateAsync({
        numero: newCompte.numero.trim(),
        nom: newCompte.nom.trim(),
        type: newCompte.type,
        niveau: 1,
      } as any);
      setShowNewCompteModal(false);
      setNewCompte({ numero: '', nom: '', type: 'charge' });
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const filteredComptes = comptes.filter(c =>
    c.numero.includes(search) || c.nom.toLowerCase().includes(search.toLowerCase())
  );

  // Grouper par classe
  const classes = ['1', '2', '3', '4', '5', '6', '7', '8', '9'];
  const grouped = classes.map(classe => ({
    classe,
    comptes: filteredComptes.filter(c => c.numero.startsWith(classe))
  })).filter(g => g.comptes.length > 0);

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🗂️ Plan comptable OHADA</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">Liste des comptes normalisés</p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={handleInitPlanComptable}
            disabled={initPlanComptable.isLoading}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textPrimary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
            title="Créer automatiquement les comptes OHADA de base nécessaires au pré-remplissage des écritures"
          >
            <Sparkles size={18} />
            {initPlanComptable.isLoading ? 'Initialisation...' : 'Initialiser le plan OHADA'}
          </button>
          <button
            onClick={() => setShowNewCompteModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
          >
            <Plus size={18} /> Nouveau compte
          </button>
        </div>
      </div>

      {comptes.length === 0 && !isLoading && (
        <div className="mb-4 p-3 rounded-xl bg-[var(--color-warning)]/10 text-[var(--color-warning)] text-sm">
          ⚠️ Aucun compte n'existe encore. Cliquez sur « Initialiser le plan OHADA » avant d'utiliser les autres
          modules (ventes, achats, factures, charges, paie) : sans comptes, aucune écriture comptable
          automatique ne peut être générée.
        </div>
      )}

      <div className="relative mb-4">
        <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
        <input
          type="text"
          placeholder="Rechercher par numéro ou nom..."
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        />
      </div>

      <div className="space-y-4">
        {grouped.map(({ classe, comptes }) => (
          <MotionBox key={classe} type="card" variant="default" className="overflow-hidden">
            <div
              className="flex items-center gap-2 p-3 cursor-pointer hover:bg-[var(--color-secondary)] transition"
              onClick={() => toggleExpand(classe)}
            >
              {expanded[classe] ? <ChevronDown size={18} /> : <ChevronRight size={18} />}
              <span className="font-bold text-[var(--color-textPrimary)]">Classe {classe}</span>
              <span className="text-sm text-[var(--color-textSecondary)]">({comptes.length} comptes)</span>
            </div>
            {expanded[classe] && (
              <div className="border-t border-[var(--color-borderColor)]">
                {comptes.map(c => (
                  <div key={c.id} className="flex items-center justify-between p-2 pl-6 border-b border-[var(--color-borderColor)] last:border-0 hover:bg-[var(--color-secondary)]/50 transition">
                    <span className="text-sm font-mono text-[var(--color-textPrimary)]">{c.numero}</span>
                    <span className="text-sm text-[var(--color-textSecondary)] flex-1 ml-4">{c.nom}</span>
                    <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">{c.type}</span>
                  </div>
                ))}
              </div>
            )}
          </MotionBox>
        ))}
      </div>

      {showNewCompteModal && (
        <div
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100]"
          onClick={(e) => e.target === e.currentTarget && setShowNewCompteModal(false)}
        >
          <MotionBox type="card" variant="elevated" className="w-full max-w-md p-6 m-4">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">Nouveau compte</h3>
              <button onClick={() => setShowNewCompteModal(false)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>
            <form onSubmit={handleCreateCompte} className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Numéro *</label>
                <input
                  type="text"
                  value={newCompte.numero}
                  onChange={(e) => setNewCompte({ ...newCompte, numero: e.target.value })}
                  placeholder="ex: 626000"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
                <input
                  type="text"
                  value={newCompte.nom}
                  onChange={(e) => setNewCompte({ ...newCompte, nom: e.target.value })}
                  placeholder="ex: Entretien et réparations"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  required
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type *</label>
                <select
                  value={newCompte.type}
                  onChange={(e) => setNewCompte({ ...newCompte, type: e.target.value as TypeCompte })}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="actif">Actif</option>
                  <option value="passif">Passif</option>
                  <option value="produit">Produit</option>
                  <option value="charge">Charge</option>
                </select>
              </div>
              <div className="flex justify-end gap-3 pt-2">
                <button
                  type="button"
                  onClick={() => setShowNewCompteModal(false)}
                  className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
                >
                  Annuler
                </button>
                <button
                  type="submit"
                  disabled={createCompte.isLoading}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
                >
                  {createCompte.isLoading ? 'Création...' : 'Créer'}
                </button>
              </div>
            </form>
          </MotionBox>
        </div>
      )}
    </div>
  );
};

export default PlanComptablePage;
