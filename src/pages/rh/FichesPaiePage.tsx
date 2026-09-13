import React, { useState, useEffect, useMemo } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { Modal } from '../../components/ui/Modal';
import { useFichesPaie, useCreateFichePaie, useDeleteFichePaie, useAvancesSalaire } from '../../hooks/useRH';
import { useEmployes, useContrats } from '../../hooks/useRH';
import { Search, Plus, Trash2, FileText, X, CreditCard, Settings, Calendar, AlertCircle, DollarSign, Users, History, Wallet } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { StatutFichePaie, TypePaiement } from '../../types/rh';

interface PaieSettings {
  jourPaiement: number;
  mois: number;
  annee: number;
}

interface EmployePaieSummary {
  employeId: string;
  nom: string;
  prenom: string;
  poste: string;
  salaireBase: number;
  primes: number;
  avances: number;
  deductions: number;
  netAPayer: number;
  charges: number;
  coutTotal: number;
  avancesCount: number;
  ficheExistante: boolean;
  ficheId?: string;
}

export const FichesPaiePage: React.FC = () => {
  const history = useHistory();
  const { data: fiches = [], isLoading: fichesLoading, refetch } = useFichesPaie();
  const { data: employes = [], isLoading: employesLoading } = useEmployes();
  const { data: contrats = [] } = useContrats();
  const { data: avances = [] } = useAvancesSalaire();
  const createMutation = useCreateFichePaie();
  const deleteMutation = useDeleteFichePaie();
  const { success, error: toastError } = useToast();

  const [searchTerm, setSearchTerm] = useState('');
  const [showForm, setShowForm] = useState(false);
  const [showSettingsModal, setShowSettingsModal] = useState(false);
  const [selectedEmployeId, setSelectedEmployeId] = useState<string>('');
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [typePaiement, setTypePaiement] = useState<TypePaiement>('reglement');
  const [moisActuel, setMoisActuel] = useState<string>('');
  const [primeValues, setPrimeValues] = useState<Record<string, number>>({});

  const [settings, setSettings] = useState<PaieSettings>(() => {
    const now = new Date();
    return {
      jourPaiement: parseInt(localStorage.getItem('paie_jour') || '25'),
      mois: now.getMonth(),
      annee: now.getFullYear(),
    };
  });

  useEffect(() => {
    localStorage.setItem('paie_jour', String(settings.jourPaiement));
  }, [settings.jourPaiement]);

  // ✅ Calcul des charges salariales (18%)
  const calculerCharges = (salaire: number, primes: number, deductions: number): number => {
    const base = salaire + primes - deductions;
    return base * 0.18;
  };

  // ✅ Récupérer le salaire du contrat
  const getSalaireContrat = (employeId: string): number => {
    const contratActif = contrats.find((c: any) => 
      c.employe_id === employeId && c.statut === 'actif'
    );
    return contratActif?.salaire_base || 0;
  };

  // ✅ Récupérer les avances du mois pour un employé
  const getAvancesMois = (employeId: string, mois: string): { total: number; count: number; details: any[] } => {
    const avancesEmploye = avances.filter((a: any) => 
      a.employe_id === employeId && 
      a.date_avance && 
      a.date_avance.startsWith(mois)
    );
    const total = avancesEmploye.reduce((sum: number, a: any) => sum + a.montant, 0);
    return {
      total,
      count: avancesEmploye.length,
      details: avancesEmploye
    };
  };

  // ✅ Générer le résumé des employés du mois
  const employesDuMois = employes.filter((e: any) => e.statut === 'actif');
  
  const summaries: EmployePaieSummary[] = useMemo(() => {
    const now = new Date();
    const mois = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    setMoisActuel(mois);
    
    return employesDuMois.map((emp: any) => {
      const salaireBase = getSalaireContrat(emp.id);
      const avancesData = getAvancesMois(emp.id, mois);
      const prime = primeValues[emp.id] || 0;
      const ficheExistante = fiches.find((f: any) => 
        f.employe_id === emp.id && f.periode === mois
      );
      
      return {
        employeId: emp.id,
        nom: emp.user?.nom || '',
        prenom: emp.user?.prenom || '',
        poste: emp.poste,
        salaireBase: salaireBase,
        primes: prime,
        avances: avancesData.total,
        deductions: 0,
        netAPayer: salaireBase + prime - avancesData.total,
        charges: calculerCharges(salaireBase, prime, 0),
        coutTotal: salaireBase + prime + calculerCharges(salaireBase, prime, 0),
        avancesCount: avancesData.count,
        ficheExistante: !!ficheExistante,
        ficheId: ficheExistante?.id,
      };
    });
  }, [employesDuMois, contrats, avances, fiches, primeValues]);

  const joursRestants = (() => {
    const now = new Date();
    const targetDate = new Date(now.getFullYear(), now.getMonth(), settings.jourPaiement);
    if (now.getDate() > settings.jourPaiement) {
      targetDate.setMonth(targetDate.getMonth() + 1);
    }
    const diff = Math.ceil((targetDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24));
    return diff > 0 ? diff : 0;
  })();

  const isPaieEnRetard = joursRestants === 0;

  const filtered = summaries.filter((s) => {
    const nom = `${s.nom} ${s.prenom}`.toLowerCase();
    return nom.includes(searchTerm.toLowerCase()) || s.poste.toLowerCase().includes(searchTerm.toLowerCase());
  });

  // ✅ Mettre à jour la prime pour un employé
  const updatePrime = (employeId: string, montant: number) => {
    setPrimeValues(prev => ({ ...prev, [employeId]: montant }));
  };

  // ✅ Générer une fiche de paie
  const handleGenererFiche = async (employeId: string) => {
    const emp = summaries.find(s => s.employeId === employeId);
    if (!emp) return;

    const now = new Date();
    const periode = `${String(now.getFullYear())}-${String(now.getMonth() + 1).padStart(2, '0')}`;
    const prime = primeValues[employeId] || 0;
    const montantNet = emp.salaireBase + prime - emp.avances;

    setIsSubmitting(true);
    try {
      await createMutation.mutateAsync({
        employe_id: employeId,
        periode: periode,
        salaire_base: emp.salaireBase,
        primes: prime,
        deductions: emp.avances,
        statut: 'brouillon',
        type: typePaiement,
      });
      success(`Fiche de paie générée pour ${emp.nom} ${emp.prenom} ✅`);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setIsSubmitting(false);
    }
  };

  // ✅ Supprimer une fiche
  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette fiche de paie ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const getStatutBadge = (statut: string) => {
    const config = {
      brouillon: { label: '📝 Brouillon', color: 'bg-gray-400' },
      validee: { label: '✅ Validée', color: 'bg-blue-500' },
      payee: { label: '💰 Payée', color: 'bg-green-500' },
    };
    const info = config[statut as keyof typeof config] || config.brouillon;
    return <span className={`px-2 py-1 rounded-full text-xs font-medium text-white ${info.color}`}>{info.label}</span>;
  };

  const settingsModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowSettingsModal(false)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Fermer
      </button>
    </div>
  );

  if (fichesLoading || employesLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">💳 Fiches de paie</h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Gestion des paies du mois {moisActuel ? new Date(moisActuel).toLocaleDateString('fr-FR', { month: 'long', year: 'numeric' }) : ''}
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowSettingsModal(true)}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <Settings size={18} /> Paramètres
          </button>
        </div>
      </div>

      {/* Indicateurs */}
      <div className="grid grid-cols-1 sm:grid-cols-5 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--color-primary)]">
            <Calendar size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{joursRestants}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Jours restants</p>
          {isPaieEnRetard && <p className="text-xs text-[var(--color-danger)]">⚠️ Date dépassée</p>}
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--color-success)]">
            <Users size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{employesDuMois.length}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Employés actifs</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--color-warning)]">
            <FileText size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">{summaries.filter(s => s.ficheExistante).length}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Fiches générées</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--color-info)]">
            <History size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">
            {summaries.reduce((acc, s) => acc + s.avancesCount, 0)}
          </p>
          <p className="text-sm text-[var(--color-textSecondary)]">Avances du mois</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-3 text-center">
          <div className="flex items-center justify-center gap-2 text-[var(--color-danger)]">
            <Wallet size={20} />
          </div>
          <p className="text-2xl font-bold text-[var(--color-textPrimary)]">
            {summaries.reduce((acc, s) => acc + s.avances, 0).toLocaleString()} FCFA
          </p>
          <p className="text-sm text-[var(--color-textSecondary)]">Total avances</p>
        </MotionBox>
      </div>

      {/* Recherche */}
      <div className="flex gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher un employé..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
      </div>

      {/* Liste récapitulative */}
      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          Aucun employé trouvé.
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold">Employé</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold hidden md:table-cell">Poste</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Salaire base</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Avances</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold hidden sm:table-cell">Prime</th>
                  <th className="px-4 py-3 text-right text-sm font-semibold">Net</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((emp) => {
                  const currentPrime = primeValues[emp.employeId] || 0;
                  
                  return (
                    <tr key={emp.employeId} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-3 font-medium text-[var(--color-textPrimary)]">
                        {emp.nom} {emp.prenom}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] hidden md:table-cell">
                        {emp.poste}
                      </td>
                      <td className="px-4 py-3 text-right font-medium text-[var(--color-textPrimary)]">
                        {emp.salaireBase.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-right">
                        <div className="flex flex-col items-end">
                          <span className={`font-medium ${emp.avances > 0 ? 'text-[var(--color-warning)]' : 'text-[var(--color-textSecondary)]'}`}>
                            {emp.avances.toLocaleString()} FCFA
                          </span>
                          {emp.avancesCount > 0 && (
                            <span className="text-xs text-[var(--color-textSecondary)]">
                              {emp.avancesCount} avance{emp.avancesCount > 1 ? 's' : ''}
                            </span>
                          )}
                        </div>
                      </td>
                      <td className="px-4 py-3 text-right hidden sm:table-cell">
                        <input
                          type="number"
                          value={currentPrime}
                          onChange={(e) => {
                            const val = parseFloat(e.target.value) || 0;
                            updatePrime(emp.employeId, val);
                          }}
                          min={0}
                          placeholder="0"
                          className="w-24 px-2 py-1 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-right text-sm"
                        />
                      </td>
                      <td className="px-4 py-3 text-right font-bold text-[var(--color-primary)]">
                        {emp.netAPayer.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-3 text-center">
                        {emp.ficheExistante ? (
                          getStatutBadge('brouillon')
                        ) : (
                          <span className="text-xs text-[var(--color-textSecondary)]">Non générée</span>
                        )}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          {emp.ficheExistante ? (
                            <button
                              onClick={() => handleDelete(emp.ficheId!)}
                              className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                              title="Supprimer la fiche"
                            >
                              <Trash2 size={16} />
                            </button>
                          ) : (
                            <button
                              onClick={() => handleGenererFiche(emp.employeId)}
                              disabled={isSubmitting}
                              className="p-1.5 rounded hover:bg-green-50 text-[var(--color-success)]"
                              title="Générer la fiche"
                            >
                              <Plus size={16} />
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
          <div className="px-4 py-2 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)] flex justify-between">
            <span>{filtered.length} employé{filtered.length > 1 ? 's' : ''}</span>
            <span className="font-medium">
              Total avances : {summaries.reduce((acc, s) => acc + s.avances, 0).toLocaleString()} FCFA
            </span>
          </div>
        </MotionBox>
      )}

      {/* Modal des paramètres */}
      <Modal
        isOpen={showSettingsModal}
        onClose={() => setShowSettingsModal(false)}
        title="Paramètres de paie"
        subtitle="Configurer la date de paiement mensuelle"
        icon={<Settings size={24} />}
        maxWidth="md"
        maxHeight="60vh"
        showFooter={true}
        footer={settingsModalFooter}
      >
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700">Jour de paiement du mois</label>
            <select
              value={settings.jourPaiement}
              onChange={(e) => setSettings({ ...settings, jourPaiement: parseInt(e.target.value) })}
              className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white text-gray-900 focus:ring-2 focus:ring-[var(--color-primary)] focus:border-transparent outline-none transition"
            >
              {Array.from({ length: 31 }, (_, i) => i + 1).map((jour) => (
                <option key={jour} value={jour}>{jour}</option>
              ))}
            </select>
            <p className="text-xs text-gray-400 mt-1">Choisissez le jour où les paies sont versées chaque mois.</p>
          </div>

          <div className="p-3 rounded-xl bg-blue-50 border border-blue-200">
            <h4 className="text-sm font-medium text-blue-700">Informations</h4>
            <ul className="text-xs text-blue-600 mt-1 space-y-1">
              <li>• Date de paie configurée : <strong>{settings.jourPaiement}</strong></li>
              <li>• Jours restants : <strong>{joursRestants}</strong></li>
              {isPaieEnRetard && <li className="text-red-600">⚠️ La date de paie est dépassée !</li>}
            </ul>
          </div>

          <div className="p-3 rounded-xl bg-gray-50">
            <h4 className="text-sm font-medium text-gray-700">Historique des paiements</h4>
            <p className="text-xs text-gray-400 mt-1">
              Les fiches de paie marquées "Payée" avec une date de paiement postérieure à la date configurée seront considérées en retard.
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default FichesPaiePage;
