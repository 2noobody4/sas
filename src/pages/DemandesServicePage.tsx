// ============================================================
// DEMANDES SERVICE PAGE — Admin (suivi + validation + création)
// Version V2 — Ajout bouton "Nouvelle demande"
// ============================================================

import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { supabase } from '../lib/supabaseClient';
import { NouvelleDemandeServiceModal } from '../components/NouvelleDemandeServiceModal';
import {
  useDemandesService,
  useUpdateDemandeServiceStatut,
  useDeleteDemandeService,
} from '../hooks/useDemandesService';
import {
  STATUTS_DEMANDE_SERVICE,
  StatutDemandeService,
  DemandeService,
} from '../types/demandesService';
import {
  ArrowLeft, Search, Eye, Trash2, Save, X, Plus,
  Clock, PlusCircle, Download,
} from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useExport } from '../hooks/useExport';
import { useAuth } from '../hooks/useAuth';
import {
  useComptabiliserDemandeService,
  useComptabiliserSoldeDemandeService,
} from '../hooks/useComptabilisation';
import { CompteSearchSelect } from '../components/CompteSearchSelect';

export const DemandesServicePage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { data: demandes = [], isLoading, refetch } = useDemandesService();
  const updateStatut = useUpdateDemandeServiceStatut();
  const deleteMutation = useDeleteDemandeService();
  const comptabiliser = useComptabiliserDemandeService();
  const comptabiliserSolde = useComptabiliserSoldeDemandeService();
  const { success, error: toastError } = useToast();
  const { exportCSV } = useExport();

  const [searchTerm, setSearchTerm] = useState('');
  const [filtreStatut, setFiltreStatut] = useState<StatutDemandeService | ''>('');
  const [selected, setSelected] = useState<DemandeService | null>(null);
  const [notesAdmin, setNotesAdmin] = useState('');
  const [prixConvenu, setPrixConvenu] = useState<number>(0);
  const [newStatut, setNewStatut] = useState<StatutDemandeService>('en_attente');
  const [showNouvelleModal, setShowNouvelleModal] = useState(false);
  const [compteDebitId, setCompteDebitId] = useState('');
  const [compteCreditId, setCompteCreditId] = useState('');
  // ⭐ Étape "solde" (après acompte, une fois le service livré)
  const [compteSoldeDebitId, setCompteSoldeDebitId] = useState('');
  const [compteSoldeCreditId, setCompteSoldeCreditId] = useState('');
  const [compteAvanceId, setCompteAvanceId] = useState('');

  const filtered = demandes.filter((d) => {
    const nom = `${d.client?.nom || ''} ${d.client?.prenom || ''} ${d.service?.nom || ''}`.toLowerCase();
    const matchSearch = nom.includes(searchTerm.toLowerCase());
    const matchStatut = filtreStatut ? d.statut === filtreStatut : true;
    return matchSearch && matchStatut;
  });

  const handleOpenDetail = async (d: DemandeService) => {
    setSelected(d);
    setNotesAdmin(d.notes_admin || '');
    setPrixConvenu(d.prix_convenu || 0);
    setNewStatut(d.statut);
    setCompteDebitId('');
    setCompteCreditId('');
    setCompteSoldeDebitId('');
    setCompteSoldeCreditId('');
    setCompteAvanceId('');

    // ⭐ Pré-remplir les comptes comptables (avance/paiement) en se basant sur
    // le plan comptable SYSCOHADA déjà utilisé ailleurs dans l'app :
    //   571000 Caisse · 521000 Banque
    //   706000 Prestations de services / 701000 Ventes (produit)
    //   419100 Clients, avances et acomptes reçus (passif — acompte)
    // Un acompte n'est PAS du produit tant que le service n'est pas rendu :
    // il est crédité en 419100, puis apuré en 706/701 à la livraison
    // (cf. handleComptabiliserSolde).
    if (!d.transaction_id || (d.transaction_id && !d.transaction_solde_id)) {
      try {
        const { data: comptes } = await supabase
          .from('comptes')
          .select('id, numero')
          .in('numero', ['571000', '521000', '706000', '701000', '419100']);

        const compteCaisse = comptes?.find((c: any) => c.numero === '571000');
        const compteBanque = comptes?.find((c: any) => c.numero === '521000');
        const compteServices = comptes?.find((c: any) => c.numero === '706000');
        const compteVente = comptes?.find((c: any) => c.numero === '701000');
        const compteAvance = comptes?.find((c: any) => c.numero === '419100');

        const compteEncaissementId = compteCaisse?.id || compteBanque?.id || '';
        const compteProduitId = compteServices?.id || compteVente?.id || '';

        if (!d.transaction_id) {
          // Étape 1 : encaissement initial (acompte ou paiement total)
          setCompteDebitId(compteEncaissementId);
          setCompteCreditId(
            d.mode_paiement === 'acompte' ? (compteAvance?.id || '') : compteProduitId
          );
        } else {
          // Étape 2 : solde après acompte, une fois le service livré
          setCompteSoldeDebitId(compteEncaissementId);
          setCompteSoldeCreditId(compteProduitId);
        }
        if (compteAvance) setCompteAvanceId(compteAvance.id);
      } catch (err) {
        console.warn('[DemandesServicePage] Pré-remplissage comptable échoué:', err);
      }
    }
  };

  const montantAComptabiliser = (d: DemandeService) =>
    d.mode_paiement === 'acompte' ? (d.montant_acompte || 0) : (d.prix_convenu || 0);

  // Paiement à la livraison : on ne comptabilise qu'une fois le service terminé.
  // Acompte ou paiement total : le paiement est déjà là, comptabilisable dès que le prix est fixé.
  const peutComptabiliser = (d: DemandeService) => {
    if (d.transaction_id) return false;
    if (!montantAComptabiliser(d)) return false;
    if (d.mode_paiement === 'a_la_livraison') return d.statut === 'terminee';
    return true;
  };

  const handleComptabiliser = async (d: DemandeService) => {
    if (!compteDebitId || !compteCreditId) {
      toastError('Sélectionnez les comptes débit et crédit');
      return;
    }
    try {
      await comptabiliser.mutateAsync({
        demandeServiceId: d.id,
        montant: montantAComptabiliser(d),
        compteDebitId,
        compteCreditId,
        libelle: `Service "${d.service?.nom || ''}" — demande n°${d.id.slice(0, 8)}`,
        userId: user?.id || '',
      });
      success(
        d.mode_paiement === 'acompte'
          ? 'Acompte comptabilisé (avance reçue) ✅'
          : 'Paiement comptabilisé ✅'
      );
      setSelected(null);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  // ⭐ Écriture manquante ajoutée : solde du service après un acompte,
  // une fois le service livré (apure le 419100 et reconnaît le produit).
  const montantSolde = (d: DemandeService) =>
    Math.max((d.prix_convenu || 0) - (d.montant_acompte || 0), 0);

  const peutComptabiliserSolde = (d: DemandeService) =>
    !!d.transaction_id &&
    !d.transaction_solde_id &&
    d.mode_paiement === 'acompte' &&
    d.statut === 'terminee';

  const handleComptabiliserSolde = async (d: DemandeService) => {
    if (!compteSoldeDebitId || !compteSoldeCreditId) {
      toastError('Sélectionnez les comptes débit et crédit du solde');
      return;
    }
    try {
      await comptabiliserSolde.mutateAsync({
        demandeServiceId: d.id,
        montantSolde: montantSolde(d),
        montantAcompte: d.montant_acompte || 0,
        compteCaisseBanqueId: compteSoldeDebitId,
        compteAvanceId,
        compteProduitId: compteSoldeCreditId,
        libelle: `Service "${d.service?.nom || ''}" — demande n°${d.id.slice(0, 8)}`,
        userId: user?.id || '',
      });
      success('Solde comptabilisé ✅');
      setSelected(null);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleSave = async () => {
    if (!selected) return;
    try {
      await updateStatut.mutateAsync({
        id: selected.id,
        statut: newStatut,
        notes_admin: notesAdmin,
        prix_convenu: prixConvenu,
      });
      success('Demande mise à jour ✅');
      setSelected(null);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette demande ?')) {
      await deleteMutation.mutateAsync(id);
      refetch();
    }
  };

  const getStatutInfo = (statut: StatutDemandeService) =>
    STATUTS_DEMANDE_SERVICE.find((s) => s.value === statut) || STATUTS_DEMANDE_SERVICE[0];

  const handleExport = () => {
    const rows = filtered.map((d) => ({
      Date: new Date(d.created_at).toLocaleDateString(),
      Client: `${d.client?.nom || ''} ${d.client?.prenom || ''}`.trim() || 'Anonyme',
      Service: d.service?.nom || 'Service supprimé',
      Statut: d.statut,
      'Prix convenu': d.prix_convenu || 0,
      'Type facturation': d.type_facturation || 'forfait',
      'Mode paiement': d.mode_paiement || 'total',
      'Montant acompte': d.montant_acompte || '',
      'Date souhaitée': d.date_souhaitee
        ? new Date(d.date_souhaitee).toLocaleDateString()
        : '',
      Notes: d.notes || '',
    }));
    exportCSV(rows, { fileName: `demandes-service-${new Date().toISOString().slice(0, 10)}` });
    success(`${rows.length} demande(s) exportée(s) ✅`);
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/services')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
          <Clock size={24} className="text-[var(--color-primary)]" />
          Demandes de service
        </h1>
        <span className="ml-auto text-sm text-[var(--color-textSecondary)] mr-3">
          {filtered.length} demande{filtered.length > 1 ? 's' : ''}
        </span>
        <button
          onClick={handleExport}
          disabled={filtered.length === 0}
          className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2 disabled:opacity-50 disabled:cursor-not-allowed"
          title="Exporter au format CSV"
        >
          <Download size={18} /> Export CSV
        </button>
        <button
          onClick={() => setShowNouvelleModal(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
        >
          <PlusCircle size={18} /> Nouvelle demande
        </button>
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
          <input
            type="text"
            placeholder="Rechercher client ou service..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <select
          value={filtreStatut}
          onChange={(e) => setFiltreStatut(e.target.value as StatutDemandeService | '')}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les statuts</option>
          {STATUTS_DEMANDE_SERVICE.map((s) => (
            <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
          ))}
        </select>
      </div>

      {filtered.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <Clock size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg mb-4">Aucune demande trouvée</p>
          <button
            onClick={() => setShowNouvelleModal(true)}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white inline-flex items-center gap-2"
          >
            <PlusCircle size={18} /> Créer la première demande
          </button>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Client</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Service</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Statut</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {filtered.map((d) => {
                  const info = getStatutInfo(d.statut);
                  return (
                    <tr key={d.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                      <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                        {new Date(d.created_at).toLocaleDateString()}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">
                        {d.client?.nom} {d.client?.prenom || ''}
                        {!d.client && <span className="italic text-[var(--color-textSecondary)]">Anonyme</span>}
                      </td>
                      <td className="px-4 py-3 text-sm text-[var(--color-textPrimary)]">
                        {d.service?.nom || 'Service supprimé'}
                      </td>
                      <td className="px-4 py-3 text-center">
                        <span
                          className="inline-flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium text-white"
                          style={{ backgroundColor: info.color }}
                        >
                          {info.icon} {info.label}
                        </span>
                      </td>
                      <td className="px-4 py-3 text-center">
                        <div className="flex justify-center gap-1">
                          <button
                            onClick={() => handleOpenDetail(d)}
                            className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                            title="Voir"
                          >
                            <Eye size={16} />
                          </button>
                          <button
                            onClick={() => handleDelete(d.id)}
                            className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                            title="Supprimer"
                          >
                            <Trash2 size={16} />
                          </button>
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

      {/* Modal détail */}
      {selected && (
        <MotionBox
          as="div"
          className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] modal-overlay-safe"
          onClick={(e) => e.target === e.currentTarget && setSelected(null)}
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <MotionBox
            as="div"
            type="card"
            variant="xlarge"
            className="w-full max-w-2xl modal-content-safe overflow-y-auto p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl"
            animation={{ animationInitiale: 'slideUp' }}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">Détail de la demande</h3>
              <button onClick={() => setSelected(null)} className="text-[var(--color-textSecondary)]">
                <X size={20} />
              </button>
            </div>

            <div className="space-y-3 mb-4">
              <div className="grid grid-cols-2 gap-3">
                <div className="p-3 rounded-xl bg-[var(--color-secondary)]">
                  <p className="text-xs text-[var(--color-textSecondary)]">Client</p>
                  <p className="font-medium text-[var(--color-textPrimary)]">
                    {selected.client?.nom} {selected.client?.prenom || ''}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-secondary)]">
                  <p className="text-xs text-[var(--color-textSecondary)]">Service</p>
                  <p className="font-medium text-[var(--color-textPrimary)]">
                    {selected.service?.nom || '-'}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-secondary)]">
                  <p className="text-xs text-[var(--color-textSecondary)]">Facturation / Paiement</p>
                  <p className="font-medium text-[var(--color-textPrimary)]">
                    {selected.type_facturation || 'forfait'} — {selected.mode_paiement || 'total'}
                    {selected.mode_paiement === 'acompte' && selected.montant_acompte
                      ? ` (${selected.montant_acompte.toLocaleString()} FCFA)`
                      : ''}
                  </p>
                </div>
                <div className="p-3 rounded-xl bg-[var(--color-secondary)]">
                  <p className="text-xs text-[var(--color-textSecondary)]">Date souhaitée</p>
                  <p className="font-medium text-[var(--color-textPrimary)]">
                    {selected.date_souhaitee
                      ? new Date(selected.date_souhaitee).toLocaleDateString()
                      : '-'}
                  </p>
                </div>
              </div>

              {selected.informations && Object.keys(selected.informations).length > 0 && (
                <div className="p-3 rounded-xl border border-[var(--color-borderColor)]">
                  <p className="text-xs text-[var(--color-textSecondary)] mb-2">Informations fournies</p>
                  {Object.entries(selected.informations).map(([k, v]) => (
                    <div key={k} className="flex justify-between text-sm">
                      <span className="text-[var(--color-textSecondary)]">{k}</span>
                      <span className="font-medium text-[var(--color-textPrimary)]">{String(v)}</span>
                    </div>
                  ))}
                </div>
              )}

              {selected.notes && (
                <div className="p-3 rounded-xl bg-[var(--color-secondary)]">
                  <p className="text-xs text-[var(--color-textSecondary)] mb-1">Notes client</p>
                  <p className="text-sm text-[var(--color-textPrimary)]">{selected.notes}</p>
                </div>
              )}
            </div>

            <div className="space-y-3 border-t border-[var(--color-borderColor)] pt-4">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Statut</label>
                <select
                  value={newStatut}
                  onChange={(e) => setNewStatut(e.target.value as StatutDemandeService)}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  {STATUTS_DEMANDE_SERVICE.map((s) => (
                    <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Prix convenu (FCFA)</label>
                <input
                  type="number"
                  value={prixConvenu}
                  onChange={(e) => setPrixConvenu(parseFloat(e.target.value) || 0)}
                  min={0}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Notes admin</label>
                <textarea
                  value={notesAdmin}
                  onChange={(e) => setNotesAdmin(e.target.value)}
                  rows={2}
                  className="w-full mt-1 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
            </div>

            {selected.transaction_id && (selected.mode_paiement !== 'acompte' || selected.transaction_solde_id) ? (
              <div className="p-3 rounded-xl bg-[var(--color-success)]/10 text-[var(--color-success)] text-sm mt-4">
                ✅ Paiement déjà comptabilisé
              </div>
            ) : selected.transaction_id && selected.mode_paiement === 'acompte' ? (
              // ⭐ Étape 2 : solde après acompte (l'avance 419100 a déjà été
              // créditée à la commande — on ne comptabilise ici que ce qui
              // manquait : le solde encaissé + l'apurement de l'avance).
              peutComptabiliserSolde(selected) ? (
                <div className="space-y-3 border-t border-[var(--color-borderColor)] pt-4 mt-4">
                  <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                    Comptabiliser le solde ({montantSolde(selected).toLocaleString()} FCFA
                    {' '}+ apurement acompte {(selected.montant_acompte || 0).toLocaleString()} FCFA)
                  </p>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte débit (encaissement solde)</label>
                    <CompteSearchSelect
                      value={compteSoldeDebitId}
                      onChange={setCompteSoldeDebitId}
                      placeholder="Sélectionner un compte débit"
                      typeFilter="actif"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte crédit (produit — 706/701)</label>
                    <CompteSearchSelect
                      value={compteSoldeCreditId}
                      onChange={setCompteSoldeCreditId}
                      placeholder="Sélectionner un compte crédit"
                      typeFilter="produit"
                    />
                  </div>
                  <button
                    onClick={() => handleComptabiliserSolde(selected)}
                    disabled={!peutComptabiliserSolde(selected) || comptabiliserSolde.isLoading}
                    className="w-full px-4 py-2 rounded-xl bg-[var(--color-success)] text-white flex items-center justify-center gap-2 disabled:opacity-50"
                  >
                    {comptabiliserSolde.isLoading ? 'Comptabilisation...' : '💰 Comptabiliser le solde'}
                  </button>
                </div>
              ) : (
                <div className="p-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textSecondary)] text-sm mt-4">
                  Acompte comptabilisé (avance reçue) ✅ — le solde sera comptabilisable une fois le service marqué "Terminée".
                </div>
              )
            ) : selected.mode_paiement === 'a_la_livraison' && selected.statut !== 'terminee' ? (
              <div className="p-3 rounded-xl bg-[var(--color-secondary)] text-[var(--color-textSecondary)] text-sm mt-4">
                Paiement à la livraison : comptabilisable une fois le service marqué "Terminée".
              </div>
            ) : montantAComptabiliser(selected) > 0 ? (
              <div className="space-y-3 border-t border-[var(--color-borderColor)] pt-4 mt-4">
                <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                  {selected.mode_paiement === 'acompte'
                    ? `Comptabiliser l'acompte (${montantAComptabiliser(selected).toLocaleString()} FCFA) — avance reçue`
                    : `Comptabiliser le paiement (${montantAComptabiliser(selected).toLocaleString()} FCFA)`}
                </p>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte débit</label>
                  <CompteSearchSelect
                    value={compteDebitId}
                    onChange={setCompteDebitId}
                    placeholder="Sélectionner un compte débit"
                    typeFilter="actif"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
                    Compte crédit {selected.mode_paiement === 'acompte' ? '(avance reçue — 419100)' : ''}
                  </label>
                  <CompteSearchSelect
                    value={compteCreditId}
                    onChange={setCompteCreditId}
                    placeholder="Sélectionner un compte crédit"
                    typeFilter={selected.mode_paiement === 'acompte' ? 'passif' : 'produit'}
                  />
                </div>
                <button
                  onClick={() => handleComptabiliser(selected)}
                  disabled={!peutComptabiliser(selected) || comptabiliser.isLoading}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--color-success)] text-white flex items-center justify-center gap-2 disabled:opacity-50"
                >
                  {comptabiliser.isLoading
                    ? 'Comptabilisation...'
                    : selected.mode_paiement === 'acompte'
                      ? '💰 Comptabiliser cet acompte'
                      : '💰 Comptabiliser ce paiement'}
                </button>
              </div>
            ) : null}

            <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--color-borderColor)]">
              <button
                onClick={() => setSelected(null)}
                className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
              >
                Annuler
              </button>
              <button
                onClick={handleSave}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2"
              >
                <Save size={16} /> Enregistrer
              </button>
            </div>
          </MotionBox>
        </MotionBox>
      )}

      {/* Modal Nouvelle Demande */}
      <NouvelleDemandeServiceModal
        isOpen={showNouvelleModal}
        onClose={() => setShowNouvelleModal(false)}
        onSuccess={() => refetch()}
      />
    </div>
  );
};

export default DemandesServicePage;

