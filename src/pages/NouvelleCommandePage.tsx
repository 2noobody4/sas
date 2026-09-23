import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useCreateCommande } from '../hooks/useBoutique';
import { useProduits } from '../hooks/useProduits';
import { useClients } from '../hooks/useClients';
import { useToast } from '../hooks/useToast';
import { ArrowLeft, Plus, Trash2, Search, User, Package } from 'lucide-react';

export const NouvelleCommandePage: React.FC = () => {
  const history = useHistory();
  const createCommande = useCreateCommande();
  const { data: produits = [] } = useProduits();
  const { data: clients = [] } = useClients();
  const { success, error: toastError } = useToast();

  const [loading, setLoading] = useState(false);
  const [clientId, setClientId] = useState<string>('');
  const [clientNom, setClientNom] = useState<string>('');
  const [clientEmail, setClientEmail] = useState<string>('');
  const [clientTelephone, setClientTelephone] = useState<string>('');
  const [clientAdresse, setClientAdresse] = useState<string>('');
  const [items, setItems] = useState<any[]>([]);
  const [selectedProduit, setSelectedProduit] = useState<string>('');
  const [quantite, setQuantite] = useState<number>(1);
  const [searchTerm, setSearchTerm] = useState<string>('');
  const [isNewClient, setIsNewClient] = useState<boolean>(false);

  // Filtrer les produits
  const filteredProduits = produits.filter((p: any) => 
    p.actif && 
    p.nom.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Ajouter un produit au panier
  const ajouterProduit = () => {
    if (!selectedProduit) {
      toastError('Veuillez sélectionner un produit');
      return;
    }
    const produit = produits.find((p: any) => p.id === selectedProduit);
    if (!produit) return;

    const existing = items.find((item: any) => item.produit_id === produit.id);
    if (existing) {
      setItems(items.map((item: any) =>
        item.produit_id === produit.id 
          ? { ...item, quantite: item.quantite + quantite }
          : item
      ));
    } else {
      setItems([...items, {
        produit_id: produit.id,
        produit_nom: produit.nom,
        quantite: quantite,
        prix_unitaire: produit.prix_vente,
      }]);
    }
    setSelectedProduit('');
    setQuantite(1);
    setSearchTerm('');
    success(`${produit.nom} ajouté à la commande ✅`);
  };

  // Retirer un produit du panier
  const retirerProduit = (produitId: string) => {
    setItems(items.filter((item: any) => item.produit_id !== produitId));
  };

  // Modifier la quantité d'un produit
  const modifierQuantite = (produitId: string, nouvelleQuantite: number) => {
    if (nouvelleQuantite <= 0) {
      retirerProduit(produitId);
      return;
    }
    setItems(items.map((item: any) =>
      item.produit_id === produitId 
        ? { ...item, quantite: nouvelleQuantite }
        : item
    ));
  };

  // Calculer le total
  const total = items.reduce((acc: number, item: any) => acc + (item.prix_unitaire * item.quantite), 0);

  // Gérer la sélection d'un client existant
  const handleClientSelect = (clientId: string) => {
    const client = clients.find((c: any) => c.id === clientId);
    if (client) {
      setClientId(client.id);
      setClientNom(`${client.nom} ${client.prenom || ''}`.trim());
      setClientEmail(client.email || '');
      setClientTelephone(client.telephone || '');
      setClientAdresse(client.adresse || '');
    }
  };

  // Valider la commande
  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (items.length === 0) {
      toastError('Ajoutez au moins un produit à la commande');
      return;
    }

    if (!clientNom.trim()) {
      toastError('Le nom du client est obligatoire');
      return;
    }

    setLoading(true);
    try {
      await createCommande.mutateAsync({
        client_id: clientId || undefined,
        client_nom: clientNom,
        client_email: clientEmail || undefined,
        client_telephone: clientTelephone || undefined,
        client_adresse: clientAdresse || undefined,
        items: items.map((item: any) => ({
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
        })),
        frais_livraison: 0,
      });
      success('Commande créée avec succès ✅');
      history.push('/gestion/clients/commandes');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/clients/commandes')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📝 Nouvelle commande</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Formulaire client */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-1">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <User size={18} /> Client
          </h3>

          <div className="mb-3">
            <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Client existant</label>
            <select
              value={clientId}
              onChange={(e) => {
                const id = e.target.value;
                setClientId(id);
                if (id) handleClientSelect(id);
                setIsNewClient(false);
              }}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            >
              <option value="">Sélectionner un client</option>
              {clients.filter((c: any) => c.actif).map((c: any) => (
                <option key={c.id} value={c.id}>
                  {c.nom} {c.prenom || ''} - {c.email || c.telephone || 'Sans contact'}
                </option>
              ))}
            </select>
          </div>

          <div className="flex items-center gap-2 mb-3">
            <span className="text-sm text-[var(--color-textSecondary)]">ou</span>
            <button
              onClick={() => {
                setIsNewClient(true);
                setClientId('');
              }}
              className={`text-sm px-2 py-1 rounded ${isNewClient ? 'bg-[var(--color-primary)] text-white' : 'text-[var(--color-primary)] hover:underline'}`}
            >
              Nouveau client
            </button>
          </div>

          <div className="space-y-3">
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom *</label>
              <input
                type="text"
                value={clientNom}
                onChange={(e) => setClientNom(e.target.value)}
                placeholder="Nom du client"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                required
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Email</label>
              <input
                type="email"
                value={clientEmail}
                onChange={(e) => setClientEmail(e.target.value)}
                placeholder="email@exemple.com"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Téléphone</label>
              <input
                type="text"
                value={clientTelephone}
                onChange={(e) => setClientTelephone(e.target.value)}
                placeholder="77 123 45 67"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Adresse de livraison</label>
              <textarea
                value={clientAdresse}
                onChange={(e) => setClientAdresse(e.target.value)}
                rows={2}
                placeholder="Adresse complète"
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              />
            </div>
          </div>
        </MotionBox>

        {/* Produits et panier */}
        <div className="lg:col-span-2 space-y-6">
          {/* Sélection des produits */}
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <Package size={18} /> Produits
            </h3>
            <div className="flex flex-wrap gap-3">
              <div className="relative flex-1 min-w-[200px]">
                <Search size={18} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                <input
                  type="text"
                  placeholder="Rechercher un produit..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-10 pr-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
              </div>
              <select
                value={selectedProduit}
                onChange={(e) => setSelectedProduit(e.target.value)}
                className="flex-1 min-w-[150px] px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="">Choisir un produit</option>
                {filteredProduits.map((p: any) => (
                  <option key={p.id} value={p.id}>
                    {p.nom} - {p.prix_vente.toLocaleString()} FCFA
                  </option>
                ))}
              </select>
              <input
                type="number"
                value={quantite}
                onChange={(e) => setQuantite(parseInt(e.target.value) || 1)}
                min={1}
                className="w-20 px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-center"
              />
              <button
                onClick={ajouterProduit}
                className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-1"
              >
                <Plus size={18} /> Ajouter
              </button>
            </div>
          </MotionBox>

          {/* Panier */}
          <MotionBox type="card" variant="elevated" className="p-4">
            <div className="flex items-center justify-between mb-3">
              <h3 className="font-semibold text-[var(--color-textPrimary)]">🛒 Panier</h3>
              <span className="text-sm text-[var(--color-textSecondary)]">{items.length} produit(s)</span>
            </div>

            {items.length === 0 ? (
              <p className="text-center text-[var(--color-textSecondary)] py-8">
                Aucun produit. Ajoutez des produits à la commande.
              </p>
            ) : (
              <div className="space-y-2">
                {items.map((item: any) => (
                  <div key={item.produit_id} className="flex items-center justify-between p-2 rounded border border-[var(--color-borderColor)]">
                    <div className="flex-1">
                      <span className="font-medium text-[var(--color-textPrimary)]">{item.produit_nom}</span>
                      <span className="ml-2 text-sm text-[var(--color-textSecondary)]">
                        {item.prix_unitaire.toLocaleString()} FCFA
                      </span>
                    </div>
                    <div className="flex items-center gap-2">
                      <button
                        onClick={() => modifierQuantite(item.produit_id, item.quantite - 1)}
                        className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                      >
                        -
                      </button>
                      <span className="w-8 text-center text-[var(--color-textPrimary)]">{item.quantite}</span>
                      <button
                        onClick={() => modifierQuantite(item.produit_id, item.quantite + 1)}
                        className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                      >
                        +
                      </button>
                      <button
                        onClick={() => retirerProduit(item.produit_id)}
                        className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)]"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                ))}

                <div className="flex justify-between pt-2 border-t border-[var(--color-borderColor)] font-bold">
                  <span className="text-[var(--color-textPrimary)]">Total</span>
                  <span className="text-[var(--color-primary)]">{total.toLocaleString()} FCFA</span>
                </div>
              </div>
            )}

            <button
              onClick={handleSubmit}
              disabled={loading || items.length === 0}
              className={`mt-4 w-full px-4 py-2 rounded-xl text-white ${
                loading || items.length === 0
                  ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                  : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
              } transition`}
            >
              {loading ? 'Création de la commande...' : '✅ Valider la commande'}
            </button>
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default NouvelleCommandePage;
