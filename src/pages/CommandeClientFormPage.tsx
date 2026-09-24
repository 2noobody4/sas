import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { Modal } from '../components/Modal';
import { ClientSearchSelect } from '../components/ClientSearchSelect';
import { useProduits } from '../hooks/useProduits';
import { useCreateCommandeClient } from '../hooks/useCommandesClient';
import { Client } from '../types/clients';
import { ArrowLeft, Plus, Trash2, Search, X, Save, Package, User, AlertTriangle } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface LigneForm {
  produit_id: string;
  quantite: number;
  prix_unitaire: number;
}

export const CommandeClientFormPage: React.FC = () => {
  const history = useHistory();
  const { data: produits = [], isLoading: produitsLoading } = useProduits();
  const createCommande = useCreateCommandeClient();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [selectedClient, setSelectedClient] = useState<Client | null>(null);
  const [lignes, setLignes] = useState<LigneForm[]>([]);
  const [remise, setRemise] = useState<number>(0);
  const [fraisLivraison, setFraisLivraison] = useState<number>(0);
  const [notes, setNotes] = useState<string>('');
  const [adresseLivraison, setAdresseLivraison] = useState<string>('');
  const [modePaiement, setModePaiement] = useState<string>('');
  const [dateLivraisonPrevue, setDateLivraisonPrevue] = useState<string>('');
  const [showCancelModal, setShowCancelModal] = useState(false);

  const [selectedProduitId, setSelectedProduitId] = useState<string>('');
  const [quantite, setQuantite] = useState<number>(1);
  const [prixUnitaire, setPrixUnitaire] = useState<number>(0);

  const sousTotal = lignes.reduce((acc, l) => acc + (l.prix_unitaire * l.quantite), 0);
  const montantTotal = sousTotal - remise + fraisLivraison;

  useEffect(() => {
    if (selectedProduitId) {
      const produit = produits.find((p: any) => p.id === selectedProduitId);
      if (produit) {
        setPrixUnitaire(produit.prix_vente);
      }
    }
  }, [selectedProduitId, produits]);

  const ajouterLigne = () => {
    if (!selectedProduitId) {
      toastError('Veuillez sélectionner un produit');
      return;
    }
    if (quantite <= 0) {
      toastError('La quantité doit être supérieure à 0');
      return;
    }

    const existing = lignes.find(l => l.produit_id === selectedProduitId);
    if (existing) {
      setLignes(lignes.map(l =>
        l.produit_id === selectedProduitId
          ? { ...l, quantite: l.quantite + quantite }
          : l
      ));
    } else {
      setLignes([...lignes, {
        produit_id: selectedProduitId,
        quantite,
        prix_unitaire: prixUnitaire,
      }]);
    }

    setSelectedProduitId('');
    setQuantite(1);
    setPrixUnitaire(0);
  };

  const supprimerLigne = (produit_id: string) => {
    setLignes(lignes.filter(l => l.produit_id !== produit_id));
  };

  const modifierQuantite = (produit_id: string, nouvelleQuantite: number) => {
    if (nouvelleQuantite <= 0) {
      supprimerLigne(produit_id);
      return;
    }
    setLignes(lignes.map(l =>
      l.produit_id === produit_id ? { ...l, quantite: nouvelleQuantite } : l
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedClient) {
      toastError('Veuillez sélectionner un client');
      return;
    }

    if (lignes.length === 0) {
      toastError('Ajoutez au moins un produit');
      return;
    }

    setLoading(true);
    try {
      await createCommande.mutateAsync({
        client_id: selectedClient.id,
        date_livraison_prevue: dateLivraisonPrevue || undefined,
        lignes: lignes.map(l => ({
          produit_id: l.produit_id,
          quantite: l.quantite,
          prix_unitaire: l.prix_unitaire,
        })),
        remise: remise || 0,
        frais_livraison: fraisLivraison || 0,
        notes: notes || undefined,
        adresse_livraison: adresseLivraison || selectedClient.adresse || undefined,
        mode_paiement: modePaiement || undefined,
      });
      success('Commande créée avec succès ✅');
      history.replace('/gestion/clients/commandes');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleCancel = () => {
    if (lignes.length > 0 || selectedClient) {
      setShowCancelModal(true);
    } else {
      history.replace('/gestion/clients/commandes');
    }
  };

  const cancelModalFooter = (
    <div className="flex justify-end gap-3">
      <button
        type="button"
        onClick={() => setShowCancelModal(false)}
        className="px-4 py-2 rounded-xl border border-gray-300 text-gray-600 hover:bg-gray-50 transition"
      >
        Continuer la saisie
      </button>
      <button
        type="button"
        onClick={() => {
          setShowCancelModal(false);
          history.replace('/gestion/clients/commandes');
        }}
        className="px-4 py-2 rounded-xl bg-red-600 text-white hover:bg-red-700 transition flex items-center gap-2"
      >
        <X size={16} /> Annuler la commande
      </button>
    </div>
  );

  const produitsActifs = produits.filter((p: any) => p.actif);

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button
          onClick={handleCancel}
          className="p-2 rounded hover:bg-[var(--color-secondary)]"
        >
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📝 Nouvelle commande client</h1>
        <span className="ml-auto text-sm text-[var(--color-textSecondary)]">
          {lignes.length} produit{lignes.length > 1 ? 's' : ''}
        </span>
      </div>

      <form onSubmit={handleSubmit}>
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          <div className="lg:col-span-2 space-y-4">
            <MotionBox type="card" variant="default" className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
                <User size={18} /> Client
              </h3>
              <ClientSearchSelect
                value={selectedClient?.id || ''}
                onChange={(clientId, client) => {
                  setSelectedClient(client || null);
                  if (client?.adresse && !adresseLivraison) {
                    setAdresseLivraison(client.adresse);
                  }
                }}
                placeholder="Rechercher un client..."
                required
              />
              {selectedClient && (
                <div className="mt-2 p-2 rounded bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)]">
                  {selectedClient.email && <span>📧 {selectedClient.email}</span>}
                  {selectedClient.telephone && <span className="ml-3">📞 {selectedClient.telephone}</span>}
                  {selectedClient.segment && <span className="ml-3">Segment: {selectedClient.segment}</span>}
                </div>
              )}
            </MotionBox>

            <MotionBox type="card" variant="default" className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
                <Package size={18} /> Produits
              </h3>

              <div className="grid grid-cols-1 md:grid-cols-4 gap-2 mb-3">
                <div className="md:col-span-2">
                  <select
                    value={selectedProduitId}
                    onChange={(e) => setSelectedProduitId(e.target.value)}
                    className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  >
                    <option value="">Sélectionner un produit</option>
                    {produitsActifs.map((p: any) => (
                      <option key={p.id} value={p.id}>{p.nom} - {p.prix_vente.toLocaleString()} FCFA {p.reference ? `(Ref: ${p.reference})` : ''}</option>
                    ))}
                  </select>
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
                    type="button"
                    onClick={ajouterLigne}
                    className="w-full px-3 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center gap-1"
                  >
                    <Plus size={16} /> Ajouter
                  </button>
                </div>
              </div>

              {lignes.length === 0 ? (
                <p className="text-sm text-[var(--color-textSecondary)] text-center py-4">Aucun produit ajouté</p>
              ) : (
                <div className="space-y-2">
                  {lignes.map((ligne) => {
                    const produit = produits.find((p: any) => p.id === ligne.produit_id);
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
                            type="button"
                            onClick={() => modifierQuantite(ligne.produit_id, ligne.quantite - 1)}
                            className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          >
                            -
                          </button>
                          <span className="w-8 text-center">{ligne.quantite}</span>
                          <button
                            type="button"
                            onClick={() => modifierQuantite(ligne.produit_id, ligne.quantite + 1)}
                            className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          >
                            +
                          </button>
                          <button
                            type="button"
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

            <MotionBox type="card" variant="default" className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">📝 Notes</h3>
              <textarea
                value={notes}
                onChange={(e) => setNotes(e.target.value)}
                rows={3}
                placeholder="Informations complémentaires..."
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)]"
              />
            </MotionBox>
          </div>

          <div className="space-y-4">
            <MotionBox type="card" variant="elevated" className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">💰 Résumé</h3>

              <div className="space-y-2">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-textSecondary)]">Sous-total</span>
                  <span className="font-medium text-[var(--color-textPrimary)]">{sousTotal.toLocaleString()} FCFA</span>
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

                <div className="flex items-center gap-2">
                  <span className="text-sm text-[var(--color-textSecondary)]">Livraison</span>
                  <input
                    type="number"
                    value={fraisLivraison}
                    onChange={(e) => setFraisLivraison(parseFloat(e.target.value) || 0)}
                    min={0}
                    className="w-24 px-2 py-1 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-right text-sm"
                  />
                  <span className="text-sm text-[var(--color-textSecondary)]">FCFA</span>
                </div>

                <div className="border-t border-[var(--color-borderColor)] pt-2 flex justify-between font-bold">
                  <span className="text-[var(--color-textPrimary)]">Total</span>
                  <span className="text-[var(--color-primary)] text-lg">{montantTotal.toLocaleString()} FCFA</span>
                </div>
              </div>
            </MotionBox>

            <MotionBox type="card" variant="default" className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">📦 Livraison</h3>
              <div className="space-y-2">
                <input
                  type="text"
                  value={adresseLivraison}
                  onChange={(e) => setAdresseLivraison(e.target.value)}
                  placeholder="Adresse de livraison"
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)]"
                />
                <input
                  type="date"
                  value={dateLivraisonPrevue}
                  onChange={(e) => setDateLivraisonPrevue(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
                <select
                  value={modePaiement}
                  onChange={(e) => setModePaiement(e.target.value)}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="">Mode de paiement</option>
                  <option value="especes">Espèces</option>
                  <option value="mobile_money">Mobile Money</option>
                  <option value="carte">Carte bancaire</option>
                  <option value="cheque">Chèque</option>
                  <option value="virement">Virement bancaire</option>
                </select>
              </div>
            </MotionBox>

            <div className="flex gap-3">
              <button
                type="button"
                onClick={handleCancel}
                className="flex-1 px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
              >
                Annuler
              </button>
              <button
                type="submit"
                disabled={loading || lignes.length === 0 || !selectedClient}
                className={`flex-1 px-4 py-2 rounded-xl text-white ${
                  loading || lignes.length === 0 || !selectedClient
                    ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                } transition flex items-center justify-center gap-2`}
              >
                {loading ? 'En cours...' : <><Save size={18} /> Créer</>}
              </button>
            </div>
          </div>
        </div>
      </form>

      {/* Modal de confirmation d'annulation */}
      <Modal
        isOpen={showCancelModal}
        onClose={() => setShowCancelModal(false)}
        title="Annuler la commande"
        subtitle="Êtes-vous sûr de vouloir annuler cette commande ?"
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
              ⚠️ Les informations de la commande ne seront pas sauvegardées.
            </p>
          </div>
          <div className="p-3 rounded-xl bg-gray-50">
            <p className="text-sm text-gray-500">
              <span className="font-medium">Produits :</span> {lignes.length}
            </p>
            <p className="text-sm text-gray-500">
              <span className="font-medium">Total :</span> {montantTotal.toLocaleString()} FCFA
            </p>
          </div>
        </div>
      </Modal>
    </div>
  );
};

export default CommandeClientFormPage;
