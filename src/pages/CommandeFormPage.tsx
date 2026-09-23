import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useProduits } from '../hooks/useProduits';
import { useClients } from '../hooks/useClients';
import { useCreateCommande } from '../hooks/useBoutique';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Plus, Trash2, Search, ShoppingCart, User, Package, X } from 'lucide-react';

export const CommandeFormPage: React.FC = () => {
  const history = useHistory();
  const { data: produits = [], isLoading: produitsLoading } = useProduits();
  const { data: clients = [], isLoading: clientsLoading } = useClients();
  const createCommande = useCreateCommande();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedClientId, setSelectedClientId] = useState('');
  const [selectedProduitId, setSelectedProduitId] = useState('');
  const [quantite, setQuantite] = useState(1);
  const [items, setItems] = useState<any[]>([]);
  const [clientInfo, setClientInfo] = useState({
    nom: '',
    email: '',
    telephone: '',
    adresse: '',
  });
  const [notes, setNotes] = useState('');

  // Mettre à jour les infos client quand un client est sélectionné
  useEffect(() => {
    if (selectedClientId && clients) {
      const client = clients.find((c: any) => c.id === selectedClientId);
      if (client) {
        setClientInfo({
          nom: `${client.nom} ${client.prenom || ''}`.trim(),
          email: client.email || '',
          telephone: client.telephone || '',
          adresse: client.adresse || '',
        });
      }
    }
  }, [selectedClientId, clients]);

  const produitsFiltres = produits.filter((p: any) =>
    p.actif &&
    (p.nom.toLowerCase().includes(searchTerm.toLowerCase()) ||
     p.reference?.toLowerCase().includes(searchTerm.toLowerCase()))
  );

  const total = items.reduce((acc, item) => acc + (item.prix_unitaire * item.quantite), 0);
  const fraisLivraison = total > 5000 ? 0 : 1500;
  const totalFinal = total + fraisLivraison;

  const ajouterLigne = () => {
    const produit = produits.find((p: any) => p.id === selectedProduitId);
    if (!produit) return;

    const existing = items.find((item) => item.produit_id === produit.id);
    if (existing) {
      setItems(items.map((item) =>
        item.produit_id === produit.id
          ? { ...item, quantite: item.quantite + quantite }
          : item
      ));
    } else {
      setItems([...items, {
        produit_id: produit.id,
        produit: produit,
        quantite: quantite,
        prix_unitaire: produit.prix_vente,
        remise_ligne: 0,
      }]);
    }
    setSelectedProduitId('');
    setQuantite(1);
    setSearchTerm('');
  };

  const supprimerLigne = (produitId: string) => {
    setItems(items.filter((item) => item.produit_id !== produitId));
  };

  const modifierQuantiteLigne = (produitId: string, qte: number) => {
    if (qte <= 0) {
      supprimerLigne(produitId);
      return;
    }
    setItems(items.map((item) =>
      item.produit_id === produitId ? { ...item, quantite: qte } : item
    ));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!selectedClientId) {
      toastError('Veuillez sélectionner un client');
      return;
    }
    if (items.length === 0) {
      toastError('Veuillez ajouter au moins un produit');
      return;
    }

    setLoading(true);
    try {
      await createCommande.mutateAsync({
        client_id: selectedClientId,
        client_nom: clientInfo.nom,
        client_email: clientInfo.email || undefined,
        client_telephone: clientInfo.telephone || undefined,
        client_adresse: clientInfo.adresse || undefined,
        items: items.map((item) => ({
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
          remise_ligne: item.remise_ligne || 0,
        })),
        frais_livraison: fraisLivraison,
        notes: notes || undefined,
      });
      success('Commande créée avec succès ✅');
      history.push('/gestion/clients/commandes');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (produitsLoading || clientsLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-6xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/clients/commandes')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📝 Nouvelle commande</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Colonne gauche – Produits */}
        <div className="lg:col-span-2 space-y-4">
          {/* Sélection Client */}
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <User size={18} className="text-[var(--color-primary)]" />
              Client *
            </h3>
            <select
              value={selectedClientId}
              onChange={(e) => setSelectedClientId(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              required
            >
              <option value="">Sélectionner un client</option>
              {clients.filter((c: any) => c.actif).map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom} {c.prenom || ''} - {c.email || c.telephone || 'Sans contact'}
                </option>
              ))}
            </select>
            {selectedClientId && (
              <div className="mt-2 p-2 rounded bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)]">
                <p><strong className="text-[var(--color-textPrimary)]">Nom:</strong> {clientInfo.nom}</p>
                {clientInfo.email && <p><strong className="text-[var(--color-textPrimary)]">Email:</strong> {clientInfo.email}</p>}
                {clientInfo.telephone && <p><strong className="text-[var(--color-textPrimary)]">Téléphone:</strong> {clientInfo.telephone}</p>}
                {clientInfo.adresse && <p><strong className="text-[var(--color-textPrimary)]">Adresse:</strong> {clientInfo.adresse}</p>}
              </div>
            )}
          </MotionBox>

          {/* Recherche Produits */}
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <Package size={18} className="text-[var(--color-primary)]" />
              Produits
            </h3>

            <div className="flex gap-2 mb-3">
              <div className="relative flex-1">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                min={1}
                className="w-20 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-center"
              />
              <button
                onClick={ajouterLigne}
                disabled={!selectedProduitId}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <Plus size={18} />
              </button>
            </div>

            {/* Résultats de recherche en cartes */}
            {searchTerm && produitsFiltres.length > 0 && (
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 max-h-60 overflow-y-auto">
                {produitsFiltres.slice(0, 10).map((p: any) => (
                  <div
                    key={p.id}
                    onClick={() => {
                      setSelectedProduitId(p.id);
                      setSearchTerm('');
                    }}
                    className={`p-3 rounded-xl border-2 cursor-pointer transition ${
                      selectedProduitId === p.id
                        ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                        : 'border-[var(--color-borderColor)] hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      {p.image_url ? (
                        <img src={p.image_url} alt={p.nom} className="w-12 h-12 rounded object-cover" />
                      ) : (
                        <div className="w-12 h-12 rounded bg-[var(--color-secondary)] flex items-center justify-center">
                          <Package size={24} className="text-[var(--color-textSecondary)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-textPrimary)] truncate">{p.nom}</p>
                        <p className="text-sm text-[var(--color-textSecondary)]">
                          {p.prix_vente.toLocaleString()} FCFA
                          {p.reference && ` • Ref: ${p.reference}`}
                        </p>
                        <p className="text-xs text-[var(--color-textSecondary)]">
                          Stock: {p.quantite} {p.unite}
                        </p>
                      </div>
                      {selectedProduitId === p.id && (
                        <div className="w-4 h-4 rounded-full bg-[var(--color-primary)] flex items-center justify-center">
                          <div className="w-1.5 h-1.5 rounded-full bg-white" />
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}

            {searchTerm && produitsFiltres.length === 0 && (
              <p className="text-sm text-[var(--color-textSecondary)] text-center py-2">Aucun produit trouvé</p>
            )}

            {selectedProduitId && !searchTerm && (
              <div className="mt-2 p-2 rounded bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)]">
                Produit sélectionné: <strong className="text-[var(--color-textPrimary)]">
                  {produits.find((p: any) => p.id === selectedProduitId)?.nom}
                </strong>
                <button
                  onClick={() => setSelectedProduitId('')}
                  className="ml-2 text-[var(--color-danger)] hover:underline"
                >
                  <X size={14} className="inline" /> Annuler
                </button>
              </div>
            )}
          </MotionBox>

          {/* Produits sélectionnés */}
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <ShoppingCart size={18} className="text-[var(--color-primary)]" />
              Panier ({items.length} produits)
            </h3>

            {items.length === 0 ? (
              <p className="text-sm text-[var(--color-textSecondary)] text-center py-4">Aucun produit ajouté</p>
            ) : (
              <div className="space-y-2 max-h-60 overflow-y-auto">
                {items.map((item) => (
                  <div key={item.produit_id} className="flex items-center justify-between p-3 rounded-xl border border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <div className="flex items-center gap-3 flex-1">
                      {item.produit?.image_url ? (
                        <img src={item.produit.image_url} alt={item.produit.nom} className="w-10 h-10 rounded object-cover" />
                      ) : (
                        <div className="w-10 h-10 rounded bg-[var(--color-secondary)] flex items-center justify-center">
                          <Package size={18} className="text-[var(--color-textSecondary)]" />
                        </div>
                      )}
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-[var(--color-textPrimary)] truncate">{item.produit?.nom}</p>
                        <p className="text-sm text-[var(--color-textSecondary)]">
                          {item.prix_unitaire.toLocaleString()} FCFA
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => modifierQuantiteLigne(item.produit_id, item.quantite - 1)}
                        className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-[var(--color-textPrimary)] font-medium">{item.quantite}</span>
                      <button
                        onClick={() => modifierQuantiteLigne(item.produit_id, item.quantite + 1)}
                        className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => supprimerLigne(item.produit_id)}
                        className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            )}

            {items.length > 0 && (
              <div className="mt-4 pt-3 border-t border-[var(--color-borderColor)]">
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-textSecondary)]">Sous-total</span>
                  <span className="font-medium text-[var(--color-textPrimary)]">{total.toLocaleString()} FCFA</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-[var(--color-textSecondary)]">Frais de livraison</span>
                  <span className="font-medium text-[var(--color-textPrimary)]">
                    {fraisLivraison === 0 ? 'Gratuit' : `${fraisLivraison.toLocaleString()} FCFA`}
                  </span>
                </div>
                <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--color-borderColor)]">
                  <span className="text-[var(--color-textPrimary)]">Total</span>
                  <span className="text-[var(--color-primary)]">{totalFinal.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}
          </MotionBox>
        </div>

        {/* Colonne droite – Informations et validation */}
        <div className="lg:col-span-1">
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">📋 Récapitulatif</h3>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Client</label>
                <p className="text-sm text-[var(--color-textPrimary)] font-medium">{clientInfo.nom || 'Non sélectionné'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Email</label>
                <p className="text-sm text-[var(--color-textSecondary)]">{clientInfo.email || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Téléphone</label>
                <p className="text-sm text-[var(--color-textSecondary)]">{clientInfo.telephone || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Adresse</label>
                <p className="text-sm text-[var(--color-textSecondary)]">{clientInfo.adresse || '-'}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Notes</label>
                <textarea
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  rows={2}
                  className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  placeholder="Instructions particulières..."
                />
              </div>
            </div>

            <div className="mt-4 pt-3 border-t border-[var(--color-borderColor)]">
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-textSecondary)]">Articles</span>
                <span className="font-medium text-[var(--color-textPrimary)]">{items.length}</span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-textSecondary)]">Total</span>
                <span className="font-bold text-[var(--color-primary)]">{totalFinal.toLocaleString()} FCFA</span>
              </div>
            </div>

            <button
              onClick={handleSubmit}
              disabled={loading || !selectedClientId || items.length === 0}
              className={`w-full mt-4 px-4 py-3 rounded-xl text-white flex items-center justify-center gap-2 ${
                loading || !selectedClientId || items.length === 0
                  ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              } transition`}
            >
              {loading ? 'En cours...' : <><ShoppingCart size={18} /> Créer la commande</>}
            </button>
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default CommandeFormPage;
