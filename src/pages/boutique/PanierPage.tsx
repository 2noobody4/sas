import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { usePanier, useCreateCommande } from '../../hooks/useBoutique';
import { useProduits } from '../../hooks/useProduits';
import { useToast } from '../../hooks/useToast';
import { ArrowLeft, Trash2, Plus, Minus, ShoppingBag } from 'lucide-react';

export const PanierPage: React.FC = () => {
  const history = useHistory();
  const { panier, retirer, modifierQuantite, vider } = usePanier();
  const { data: produits = [] } = useProduits();
  const createCommande = useCreateCommande();
  const { success, error: toastError } = useToast();
  const [clientInfo, setClientInfo] = useState({ nom: '', email: '', telephone: '', adresse: '' });
  const [loading, setLoading] = useState(false);

  const itemsEnriched = panier.items.map(item => {
    const produit = produits.find(p => p.id === item.produit_id);
    return { ...item, produit };
  });

  const total = panier.total;
  const fraisLivraison = total > 5000 ? 0 : 1500;
  const totalFinal = total + fraisLivraison;

  const handleCommander = async () => {
    if (panier.items.length === 0) {
      toastError('Votre panier est vide');
      return;
    }
    if (!clientInfo.nom.trim()) {
      toastError('Veuillez saisir votre nom');
      return;
    }
    setLoading(true);
    try {
      await createCommande.mutateAsync({
        client_nom: clientInfo.nom,
        client_email: clientInfo.email || undefined,
        client_telephone: clientInfo.telephone || undefined,
        client_adresse: clientInfo.adresse || undefined,
        items: panier.items.map(item => ({
          produit_id: item.produit_id,
          quantite: item.quantite,
          prix_unitaire: item.prix_unitaire,
        })),
        frais_livraison: fraisLivraison,
      });
      vider();
      success('Commande passée avec succès ✅');
      history.push('/boutique/commandes');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (panier.items.length === 0) {
    return (
      <div className="p-6 max-w-3xl mx-auto text-center">
        <MotionBox type="card" variant="default" className="p-8">
          <div className="text-6xl mb-4">🛒</div>
          <h2 className="text-xl font-bold text-[var(--color-textPrimary)]">Votre panier est vide</h2>
          <p className="text-[var(--color-textSecondary)] mt-2">Parcourez la boutique et ajoutez des produits.</p>
          <button onClick={() => history.push('/boutique')} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white">Voir les produits</button>
        </MotionBox>
      </div>
    );
  }

  return (
    <div className="p-6 max-w-3xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/boutique')} className="p-2 rounded hover:bg-[var(--color-secondary)]"><ArrowLeft size={24} /></button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🛒 Panier</h1>
        <button onClick={vider} className="ml-auto text-sm text-[var(--color-danger)] hover:underline">Vider le panier</button>
      </div>

      <div className="space-y-4">
        {itemsEnriched.map((item) => (
          <MotionBox key={item.produit_id} type="card" variant="default" className="p-4 flex items-center gap-4">
            <div className="w-16 h-16 rounded bg-[var(--color-secondary)] flex items-center justify-center">
              {item.produit?.image_url ? <img src={item.produit.image_url} alt={item.produit.nom} className="w-full h-full object-cover rounded" /> : <span className="text-2xl">📦</span>}
            </div>
            <div className="flex-1">
              <h3 className="font-medium text-[var(--color-textPrimary)]">{item.produit?.nom || 'Produit'}</h3>
              <p className="text-sm text-[var(--color-textSecondary)]">{item.prix_unitaire.toLocaleString()} FCFA</p>
            </div>
            <div className="flex items-center gap-2">
              <button onClick={() => modifierQuantite(item.produit_id, item.quantite - 1)} className="p-1 rounded hover:bg-[var(--color-secondary)]"><Minus size={16} /></button>
              <span className="w-8 text-center text-[var(--color-textPrimary)]">{item.quantite}</span>
              <button onClick={() => modifierQuantite(item.produit_id, item.quantite + 1)} className="p-1 rounded hover:bg-[var(--color-secondary)]"><Plus size={16} /></button>
            </div>
            <button onClick={() => retirer(item.produit_id)} className="text-[var(--color-danger)]"><Trash2 size={18} /></button>
          </MotionBox>
        ))}
      </div>

      <MotionBox type="card" variant="elevated" className="mt-6 p-4">
        <div className="space-y-2">
          <div className="flex justify-between"><span className="text-[var(--color-textSecondary)]">Sous-total</span><span className="font-medium text-[var(--color-textPrimary)]">{total.toLocaleString()} FCFA</span></div>
          <div className="flex justify-between"><span className="text-[var(--color-textSecondary)]">Frais de livraison</span><span className="font-medium text-[var(--color-textPrimary)]">{fraisLivraison === 0 ? 'Gratuit' : `${fraisLivraison.toLocaleString()} FCFA`}</span></div>
          <div className="border-t border-[var(--color-borderColor)] pt-2 flex justify-between font-bold">
            <span className="text-[var(--color-textPrimary)]">Total</span>
            <span className="text-[var(--color-primary)]">{totalFinal.toLocaleString()} FCFA</span>
          </div>
        </div>
      </MotionBox>

      <MotionBox type="card" variant="default" className="mt-6 p-4">
        <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">Informations de livraison</h3>
        <div className="grid grid-cols-1 gap-3">
          <input type="text" placeholder="Nom complet *" value={clientInfo.nom} onChange={(e) => setClientInfo({ ...clientInfo, nom: e.target.value })} className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]" />
          <input type="email" placeholder="Email" value={clientInfo.email} onChange={(e) => setClientInfo({ ...clientInfo, email: e.target.value })} className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]" />
          <input type="text" placeholder="Téléphone" value={clientInfo.telephone} onChange={(e) => setClientInfo({ ...clientInfo, telephone: e.target.value })} className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]" />
          <textarea placeholder="Adresse de livraison" value={clientInfo.adresse} onChange={(e) => setClientInfo({ ...clientInfo, adresse: e.target.value })} rows={2} className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]" />
        </div>
      </MotionBox>

      <div className="flex justify-end gap-3 mt-6">
        <button onClick={() => history.push('/boutique')} className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]">Continuer les achats</button>
        <button onClick={handleCommander} disabled={loading || panier.items.length === 0} className={`px-4 py-2 rounded-xl text-white ${loading || panier.items.length === 0 ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'} flex items-center gap-2`}>
          {loading ? 'En cours...' : <><ShoppingBag size={18} /> Passer la commande</>}
        </button>
      </div>
    </div>
  );
};

export default PanierPage;
