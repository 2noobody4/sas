import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { Modal } from '../components/Modal';
import { ProductSearchSelect } from '../components/ProductSearchSelect';
import { useVentes, useCreateVente } from '../hooks/useVentes';
import { useSessionActive } from '../hooks/useSessions';
import { useProduits } from '../hooks/useProduits';
import { LigneVente, PaiementFormData, MoyenPaiement } from '../types/caisse';
import { CompteSearchSelect } from '../components/CompteSearchSelect';
import { useComptes } from '../hooks/useComptabilite';
import { ArrowLeft, Plus, Trash2, Package, AlertTriangle, X } from 'lucide-react';
import { useToast } from '../hooks/useToast';

export const VenteFormPage: React.FC = () => {
  const history = useHistory();
  const { data: sessionActive } = useSessionActive();
  const { data: produits = [] } = useProduits();
  const { data: comptes = [] } = useComptes();
  const createVente = useCreateVente();

  const [lignes, setLignes] = useState<LigneVente[]>([]);
  const [clientId, setClientId] = useState<string>('');
  const [remise, setRemise] = useState<number>(0);
  const [paiements, setPaiements] = useState<PaiementFormData[]>([]);
  const [selectedProduitId, setSelectedProduitId] = useState('');
  const [quantite, setQuantite] = useState<number>(1);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string>('');
  const [showScanner, setShowScanner] = useState(false);
  const [montantRemis, setMontantRemis] = useState<number>(0);
  const [searchTerm, setSearchTerm] = useState<string>("");
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [compteDebitId, setCompteDebitId] = useState<string>('');
  const [compteCreditId, setCompteCreditId] = useState<string>('');

  const compteCaisse = comptes.find(c => c.numero === '571000');
  const compteBanque = comptes.find(c => c.numero === '521000');
  const compteVente = comptes.find(c => c.numero === '701000');

  // Déterminer les comptes par défaut
  useEffect(() => {
    const cashPayment = paiements.find(p => p.moyen === 'especes');
    const mobilePayment = paiements.find(p => p.moyen === 'mobile_money');
    const cartePayment = paiements.find(p => p.moyen === 'carte');

    if (cashPayment) {
      if (compteCaisse) setCompteDebitId(compteCaisse.id);
    } else if (mobilePayment || cartePayment) {
      if (compteBanque) setCompteDebitId(compteBanque.id);
    } else {
      setCompteDebitId('');
    }

    if (compteVente) setCompteCreditId(compteVente.id);
  }, [paiements, compteCaisse, compteBanque, compteVente]);

  const caissierId = (window as any).user?.id || 'dev-caissier-id';

  const totalLignes = lignes.reduce((acc, l) => acc + (l.prix_unitaire - (l.remise_ligne || 0)) * l.quantite, 0);
  const totalFinal = totalLignes - remise;
  const totalPaiements = paiements.reduce((acc, p) => acc + p.montant, 0);
  const reste = totalFinal - totalPaiements;
  const monnaie = montantRemis - totalFinal;

  const hasCashPayment = paiements.some(p => p.moyen === 'especes');
  const cashPayment = paiements.find(p => p.moyen === 'especes');

  useEffect(() => {
    if (cashPayment) {
      setMontantRemis(cashPayment.montant);
    } else {
      setMontantRemis(0);
    }
  }, [cashPayment]);

  const handleMontantRemisChange = (value: number) => {
    setMontantRemis(value);
    const index = paiements.findIndex(p => p.moyen === 'especes');
    if (index !== -1) {
      const newPaiements = [...paiements];
      newPaiements[index] = { ...newPaiements[index], montant: value };
      setPaiements(newPaiements);
    }
  };

  const ajouterLigne = () => {
    if (!selectedProduitId) {
      setError('Veuillez sélectionner un produit');
      return;
    }
    const produit = produits.find(p => p.id === selectedProduitId);
    if (!produit) {
      setError('Produit introuvable');
      return;
    }
    if (produit.quantite < quantite) {
      setError(`Stock insuffisant. Disponible: ${produit.quantite}`);
      return;
    }

    const existing = lignes.find(l => l.produit_id === selectedProduitId);
    if (existing) {
      if (existing.quantite + quantite > produit.quantite) {
        setError(`Stock insuffisant. Disponible: ${produit.quantite}`);
        return;
      }
      setLignes(lignes.map(l =>
        l.produit_id === selectedProduitId ? { ...l, quantite: l.quantite + quantite } : l
      ));
    } else {
      setLignes([...lignes, {
        produit_id: selectedProduitId,
        quantite: quantite,
        prix_unitaire: produit.prix_vente,
        remise_ligne: 0,
        produit: produit,
      }]);
    }
    setSelectedProduitId('');
    setQuantite(1);
    setSearchTerm('');
    setError('');
  };

  const supprimerLigne = (produitId: string) => {
    setLignes(lignes.filter(l => l.produit_id !== produitId));
  };

  const modifierQuantite = (produitId: string, nouvelleQuantite: number) => {
    if (nouvelleQuantite <= 0) {
      supprimerLigne(produitId);
      return;
    }
    const produit = produits.find(p => p.id === produitId);
    if (produit && nouvelleQuantite > produit.quantite) {
      setError(`Stock insuffisant. Disponible: ${produit.quantite}`);
      return;
    }
    setLignes(lignes.map(l =>
      l.produit_id === produitId ? { ...l, quantite: nouvelleQuantite } : l
    ));
    setError('');
  };

  const handleSubmit = async () => {
    if (lignes.length === 0) {
      setError('Ajoutez au moins un produit');
      return;
    }
    if (!sessionActive) {
      setError('Aucune session ouverte');
      return;
    }
    if (paiements.length === 0) {
      setError('Ajoutez au moins un paiement');
      return;
    }
    if (hasCashPayment && montantRemis < cashPayment!.montant) {
      setError('Le montant remis doit être au moins égal au montant espèces');
      return;
    }
    if (reste > 0) {
      setError('Le montant total des paiements doit couvrir le total de la vente');
      return;
    }

    setLoading(true);
    try {
      const data = {
        session_id: sessionActive.id,
        client_id: clientId || undefined,
        caissier_id: caissierId,
        lignes,
        remise,
        paiements,
      };
      await createVente.mutateAsync(data);
      history.replace('/gestion/caisse/ventes');
    } catch (err: any) {
      setError(err.message || 'Erreur lors de l\'enregistrement');
    } finally {
      setLoading(false);
    }
  };

  const ajouterPaiement = (moyen: MoyenPaiement, montant: number, reference?: string) => {
    if (moyen === 'especes') {
      setMontantRemis(montant);
    }
    const filtered = paiements.filter(p => p.moyen !== moyen);
    setPaiements([...filtered, { moyen, montant, reference }]);
  };

  const supprimerPaiement = (index: number) => {
    const moyen = paiements[index].moyen;
    setPaiements(paiements.filter((_, i) => i !== index));
    if (moyen === 'especes') {
      setMontantRemis(0);
    }
  };

  const handleCancel = () => {
    if (lignes.length > 0 || paiements.length > 0 || clientId) {
      setShowCancelModal(true);
    } else {
      history.replace('/gestion/caisse/ventes');
    }
  };

  const canValidate = () => {
    if (loading) return false;
    if (lignes.length === 0) return false;
    if (!sessionActive) return false;
    if (paiements.length === 0) return false;
    if (reste > 0) return false;
    if (hasCashPayment && montantRemis < (cashPayment?.montant || 0)) return false;
    if (totalPaiements < totalFinal) return false;
    if (!compteDebitId || !compteCreditId) return false;
    return true;
  };

  const cancelModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowCancelModal(false)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Continuer la vente
      </button>
      <button
        type="button"
        onClick={() => {
          setShowCancelModal(false);
          history.replace('/gestion/caisse/ventes');
        }}
        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
      >
        <X size={16} /> Annuler la vente
      </button>
    </div>
  );

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleCancel}
          className="p-2 rounded hover:bg-[var(--color-secondary)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🛒 Nouvelle vente</h1>
        {sessionActive && (
          <span className="ml-auto text-sm text-[var(--color-success)] flex items-center gap-2">
            <span>Session ouverte</span>
          </span>
        )}
      </div>

      {!sessionActive && (
        <MotionBox type="card" variant="default" className="p-4 mb-4 text-center text-[var(--color-danger)]">
          ⚠️ Aucune session ouverte. Veuillez ouvrir une session avant d'enregistrer une vente.
        </MotionBox>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche - Produits */}
        <div className="lg:col-span-2 space-y-4">
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <Package size={18} /> Produits
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-4 gap-3">
              <div className="md:col-span-2">
                <ProductSearchSelect
                  value={selectedProduitId}
                  onChange={(produitId) => setSelectedProduitId(produitId)}
                  placeholder="Rechercher un produit..."
                  className="w-full"
                />
              </div>
              <div>
                <input
                  type="number"
                  value={quantite}
                  onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                  min={1}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  placeholder="Qté"
                />
              </div>
              <div>
                <button
                  onClick={ajouterLigne}
                  className="w-full px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center justify-center gap-1 hover:bg-[var(--color-primary-dark)] transition"
                >
                  <Plus size={18} /> Ajouter
                </button>
              </div>
            </div>

            {error && (
              <div className="p-3 rounded-xl bg-[var(--color-danger)]/10 text-[var(--color-danger)] text-sm mt-3">
                {error}
              </div>
            )}
          </MotionBox>

          {/* Panier */}
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">Panier</h3>
            {lignes.length === 0 ? (
              <p className="text-[var(--color-textSecondary)] text-center py-4">Aucun produit ajouté</p>
            ) : (
              <div className="space-y-2">
                {lignes.map((ligne) => {
                  const produit = produits.find(p => p.id === ligne.produit_id);
                  return (
                    <div key={ligne.produit_id} className="flex items-center justify-between p-2 rounded border border-[var(--color-borderColor)]">
                      <div className="flex-1">
                        <span className="font-medium text-[var(--color-textPrimary)]">{produit?.nom || 'Produit'}</span>
                        <span className="ml-2 text-sm text-[var(--color-textSecondary)]">x{ligne.quantite}</span>
                        <span className="ml-2 text-sm text-[var(--color-textSecondary)]">{ligne.prix_unitaire.toLocaleString()} FCFA</span>
                        <span className="ml-2 text-sm font-medium text-[var(--color-primary)]">
                          {(ligne.prix_unitaire * ligne.quantite).toLocaleString()} FCFA
                        </span>
                      </div>
                      <div className="flex items-center gap-2">
                        <button
                          onClick={() => modifierQuantite(ligne.produit_id, ligne.quantite - 1)}
                          className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          -
                        </button>
                        <span className="w-8 text-center">{ligne.quantite}</span>
                        <button
                          onClick={() => modifierQuantite(ligne.produit_id, ligne.quantite + 1)}
                          className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                        >
                          +
                        </button>
                        <button
                          onClick={() => supprimerLigne(ligne.produit_id)}
                          className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)]"
                        >
                          <Trash2 size={16} />
                        </button>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </MotionBox>
        </div>

        {/* Colonne droite - Paiements et résumé */}
        <div className="space-y-4">
          <MotionBox type="card" variant="elevated" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">💰 Résumé</h3>

            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-textSecondary)]">Sous-total</span>
                <span className="font-medium text-[var(--color-textPrimary)]">{totalLignes.toLocaleString()} FCFA</span>
              </div>

              <div className="flex items-center gap-2">
                <span className="text-sm text-[var(--color-textSecondary)]">Remise</span>
                <input
                  type="number"
                  value={remise}
                  onChange={(e) => setRemise(parseFloat(e.target.value) || 0)}
                  min={0}
                  className="w-24 px-2 py-1 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-right text-sm"
                />
                <span className="text-sm text-[var(--color-textSecondary)]">FCFA</span>
              </div>

              <div className="border-t border-[var(--color-borderColor)] pt-2 flex justify-between font-bold">
                <span className="text-[var(--color-textPrimary)]">Total</span>
                <span className="text-[var(--color-primary)] text-lg">{totalFinal.toLocaleString()} FCFA</span>
              </div>
            </div>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">💳 Paiements</h3>
            <div className="flex flex-wrap gap-2 mb-2">
              <button
                onClick={() => {
                  const montant = reste > 0 ? reste : 0;
                  ajouterPaiement('especes', montant);
                }}
                className={`px-3 py-1 rounded text-sm ${paiements.some(p => p.moyen === 'especes') ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)]'}`}
              >
                Espèces
              </button>
              <button
                onClick={() => {
                  const montant = reste > 0 ? reste : 0;
                  ajouterPaiement('mobile_money', montant);
                }}
                className={`px-3 py-1 rounded text-sm ${paiements.some(p => p.moyen === 'mobile_money') ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)]'}`}
              >
                Mobile Money
              </button>
              <button
                onClick={() => {
                  const montant = reste > 0 ? reste : 0;
                  ajouterPaiement('carte', montant);
                }}
                className={`px-3 py-1 rounded text-sm ${paiements.some(p => p.moyen === 'carte') ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)]'}`}
              >
                Carte
              </button>
              <button
                onClick={() => {
                  const montant = reste > 0 ? reste : 0;
                  ajouterPaiement('cheque', montant);
                }}
                className={`px-3 py-1 rounded text-sm ${paiements.some(p => p.moyen === 'cheque') ? 'bg-[var(--color-primary)] text-white' : 'bg-[var(--color-secondary)]'}`}
              >
                Chèque
              </button>
            </div>

            {paiements.map((p, i) => (
              <div key={i} className="flex items-center justify-between p-2 border-b border-[var(--color-borderColor)]">
                <span className="text-sm text-[var(--color-textPrimary)]">{p.moyen} : {p.montant.toLocaleString()} FCFA {p.reference && `(Réf: ${p.reference})`}</span>
                <button onClick={() => supprimerPaiement(i)} className="text-[var(--color-danger)]"><Trash2 size={16} /></button>
              </div>
            ))}

            {hasCashPayment && (
              <div className="mt-3 p-3 bg-[var(--color-secondary)] rounded-xl">
                <div className="grid grid-cols-2 gap-3">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Montant remis (FCFA)</label>
                    <input
                      type="number"
                      value={montantRemis}
                      onChange={(e) => handleMontantRemisChange(parseFloat(e.target.value) || 0)}
                      min={0}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                      placeholder="0"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Monnaie (FCFA)</label>
                    <input
                      type="text"
                      value={monnaie > 0 ? monnaie.toLocaleString() : '0'}
                      disabled
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] cursor-not-allowed opacity-70"
                    />
                    <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                      {monnaie > 0 ? `À rendre : ${monnaie.toLocaleString()} FCFA` : 'Montant exact'}
                    </p>
                  </div>
                </div>
              </div>
            )}

            <div className="flex justify-between mt-2">
              <span className="text-sm text-[var(--color-textSecondary)]">Total paiements : {totalPaiements.toLocaleString()} FCFA</span>
              {reste > 0 ? (
                <span className="text-sm text-[var(--color-warning)]">Reste : {reste.toLocaleString()} FCFA</span>
              ) : (
                <span className="text-sm text-[var(--color-success)]">✅ Payé</span>
              )}
            </div>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">📊 Comptes comptables</h3>
            <div className="grid grid-cols-1 gap-3">
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
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Compte crédit</label>
                <CompteSearchSelect
                  value={compteCreditId}
                  onChange={setCompteCreditId}
                  placeholder="Sélectionner un compte crédit"
                  typeFilter="produit"
                />
              </div>
            </div>
          </MotionBox>

          <div className="flex gap-3">
            <button
              onClick={handleCancel}
              className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
            >
              Annuler
            </button>
            <button
              onClick={handleSubmit}
              disabled={!canValidate()}
              className={`flex-1 px-4 py-2 rounded-xl text-white ${
                canValidate()
                  ? 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                  : 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
              } transition`}
            >
              {loading ? 'En cours...' : '✅ Valider la vente'}
            </button>
          </div>
        </div>
      </div>

      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Annuler la vente"
        subtitle="Êtes-vous sûr de vouloir annuler cette vente ?"
        icon={<AlertTriangle size={24} className="text-red-500" />}
        maxWidth="md"
        maxHeight="50vh"
        showFooter={true}
        footer={cancelModalFooter}
      >
        <div className="space-y-3">
          <p className="text-gray-600">
            Les données saisies seront perdues. Voulez-vous vraiment annuler ?
          </p>
          <div className="p-3 rounded-xl bg-yellow-50 border border-yellow-200">
            <p className="text-sm text-yellow-700">
              ⚠️ Les informations de la vente ne seront pas sauvegardées.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Produits :</span> {lignes.length}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Total :</span> {totalFinal.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default VenteFormPage;
