import React, { useMemo, useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useAuth } from '../../hooks/useAuth';
import { useCommandesClient } from '../../hooks/useCommandesClient';
import { useVentes } from '../../hooks/useVentes';
import { useMouvements } from '../../hooks/useMouvements';
import { useProduits } from '../../hooks/useProduits';
import { usePanier } from '../../hooks/useBoutique';
import { 
  LayoutDashboard, 
  ShoppingBag, 
  ShoppingCart, 
  Truck, 
  User, 
  Package,
  TrendingUp,
  DollarSign,
  AlertTriangle,
  XCircle,
  MessageSquare,
  Bell,
  Clock,
  Heart,
  Home,
  Settings,
  Users,
  Coins,
  Receipt,
  BarChart,
  X
} from 'lucide-react';

export const DashboardRoot: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const role = user?.role?.nom || 'client';
  const [isRightOpen, setIsRightOpen] = useState(false);

  // Données réelles
  const { data: commandes = [] } = useCommandesClient();
  const { data: ventes = [] } = useVentes();
  const { data: mouvements = [] } = useMouvements();
  const { data: produits = [] } = useProduits();
  const { panier } = usePanier();

  const isAdmin = role === 'admin' || role === 'gestionnaire';
  const isCashier = role === 'cashier';
  const isStockManager = role === 'magasinier';

  const quickActions = useMemo(() => {
    const base = [
      { icon: Home, label: 'Accueil', path: '/' },
      { icon: ShoppingBag, label: 'Boutique', path: '/boutique' },
      { icon: ShoppingCart, label: 'Panier', path: '/boutique/panier' },
    ];
    if (isAdmin) {
      return [
        ...base,
        { icon: LayoutDashboard, label: 'Gestion', path: '/gestion' },
        { icon: Package, label: 'Stocks', path: '/gestion/stocks' },
        { icon: Coins, label: 'Caisse', path: '/gestion/caisse' },
        { icon: Receipt, label: 'Comptabilité', path: '/gestion/comptabilite' },
      ];
    } else if (isCashier) {
      return [
        ...base,
        { icon: Coins, label: 'Caisse', path: '/gestion/caisse' },
        { icon: BarChart, label: 'Rapports', path: '/gestion/caisse/rapports' },
      ];
    } else if (isStockManager) {
      return [
        ...base,
        { icon: Package, label: 'Stocks', path: '/gestion/stocks' },
        { icon: Truck, label: 'Mouvements', path: '/gestion/stocks/mouvements' },
      ];
    } else {
      return [
        ...base,
        { icon: Truck, label: 'Commandes', path: '/clients/commandes' },
        { icon: Heart, label: 'Favoris', path: '/wishlist' },
      ];
    }
  }, [isAdmin, isCashier, isStockManager]);

  const analytics = useMemo(() => {
    if (isAdmin) {
      const totalProduits = produits.filter(p => p.actif).length;
      const stockBas = produits.filter(p => p.quantite <= p.seuil_alerte && p.quantite > 0).length;
      const rupture = produits.filter(p => p.quantite === 0).length;
      const totalVentes = ventes.reduce((acc, v) => acc + v.montant_total, 0);
      return [
        { icon: Package, label: 'Produits', value: totalProduits, color: 'var(--color-primary)' },
        { icon: AlertTriangle, label: 'Stock bas', value: stockBas, color: 'var(--color-warning)' },
        { icon: XCircle, label: 'Rupture', value: rupture, color: 'var(--color-danger)' },
        { icon: DollarSign, label: 'CA (FCFA)', value: totalVentes.toLocaleString(), color: 'var(--color-success)' },
      ];
    } else if (isCashier) {
      const totalVentes = ventes.reduce((acc, v) => acc + v.montant_total, 0);
      const nbVentes = ventes.length;
      const panierMoyen = nbVentes > 0 ? (totalVentes / nbVentes) : 0;
      return [
        { icon: DollarSign, label: 'CA (FCFA)', value: totalVentes.toLocaleString(), color: 'var(--color-success)' },
        { icon: ShoppingBag, label: 'Ventes', value: nbVentes, color: 'var(--color-primary)' },
        { icon: TrendingUp, label: 'Panier moyen', value: panierMoyen.toFixed(0), color: 'var(--color-accent)' },
        { icon: Clock, label: 'Sessions', value: '1', color: 'var(--color-warning)' },
      ];
    } else if (isStockManager) {
      const totalProduits = produits.filter(p => p.actif).length;
      const stockBas = produits.filter(p => p.quantite <= p.seuil_alerte && p.quantite > 0).length;
      const valeurStock = produits.reduce((acc, p) => acc + (p.quantite * p.prix_achat), 0);
      return [
        { icon: Package, label: 'Produits', value: totalProduits, color: 'var(--color-primary)' },
        { icon: AlertTriangle, label: 'Stock bas', value: stockBas, color: 'var(--color-warning)' },
        { icon: Clock, label: 'Mouvements', value: mouvements.length, color: 'var(--color-accent)' },
        { icon: TrendingUp, label: 'Valeur stock', value: valeurStock.toLocaleString(), color: 'var(--color-success)' },
      ];
    } else {
      const commandesEnCours = commandes.filter(c => c.statut !== 'livree' && c.statut !== 'annulee').length;
      const panierItems = panier.items.reduce((acc, item) => acc + item.quantite, 0);
      return [
        { icon: ShoppingBag, label: 'Commandes', value: commandes.length, color: 'var(--color-primary)' },
        { icon: Truck, label: 'En cours', value: commandesEnCours, color: 'var(--color-warning)' },
        { icon: ShoppingCart, label: 'Panier', value: panierItems, color: 'var(--color-success)' },
        { icon: Heart, label: 'Favoris', value: '0', color: 'var(--color-danger)' },
      ];
    }
  }, [isAdmin, isCashier, isStockManager, produits, ventes, commandes, mouvements, panier]);

  const renderHistory = () => {
    if (isAdmin) {
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-3">📊 Dernières activités</h3>
          {mouvements.slice(0, 10).map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-[var(--color-cardBg)] hover:bg-[var(--color-secondary)] transition text-sm border border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textPrimary)]">{m.produit?.nom || 'Produit'}</span>
              <span className="text-[var(--color-textSecondary)]">{m.type} - {m.quantite}</span>
              <span className="text-[var(--color-textSecondary)] text-xs">{new Date(m.date_mouvement).toLocaleDateString()}</span>
            </div>
          ))}
          {mouvements.length === 0 && <p className="text-[var(--color-textSecondary)] text-center py-4">Aucun mouvement récent</p>}
        </div>
      );
    } else if (isCashier) {
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-3">🛒 Dernières ventes</h3>
          {ventes.slice(0, 10).map((v, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-[var(--color-cardBg)] hover:bg-[var(--color-secondary)] transition text-sm border border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textPrimary)]">Vente #{v.id.slice(0, 8)}</span>
              <span className="text-[var(--color-textPrimary)]">{v.montant_total.toLocaleString()} FCFA</span>
              <span className="text-[var(--color-textSecondary)] text-xs">{new Date(v.date_vente).toLocaleDateString()}</span>
            </div>
          ))}
          {ventes.length === 0 && <p className="text-[var(--color-textSecondary)] text-center py-4">Aucune vente récente</p>}
        </div>
      );
    } else if (isStockManager) {
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-3">📦 Mouvements de stock</h3>
          {mouvements.slice(0, 10).map((m, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-[var(--color-cardBg)] hover:bg-[var(--color-secondary)] transition text-sm border border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textPrimary)]">{m.produit?.nom || 'Produit'}</span>
              <span className="text-[var(--color-textSecondary)]">{m.type} - {m.quantite}</span>
              <span className="text-[var(--color-textSecondary)] text-xs">{new Date(m.date_mouvement).toLocaleDateString()}</span>
            </div>
          ))}
          {mouvements.length === 0 && <p className="text-[var(--color-textSecondary)] text-center py-4">Aucun mouvement</p>}
        </div>
      );
    } else {
      return (
        <div className="space-y-2">
          <h3 className="text-lg font-semibold text-[var(--color-textPrimary)] mb-3">📋 Mes commandes</h3>
          {commandes.slice(0, 10).map((c, idx) => (
            <div key={idx} className="flex items-center justify-between p-2 rounded bg-[var(--color-cardBg)] hover:bg-[var(--color-secondary)] transition text-sm border border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textPrimary)]">{c.numero}</span>
              <span className="text-[var(--color-textPrimary)]">{c.montant_total.toLocaleString()} FCFA</span>
              <span className="text-[var(--color-textSecondary)] text-xs">{new Date(c.date_commande).toLocaleDateString()}</span>
            </div>
          ))}
          {commandes.length === 0 && <p className="text-[var(--color-textSecondary)] text-center py-4">Aucune commande</p>}
        </div>
      );
    }
  };

  const messages = [
    { id: 1, from: 'Admin', subject: 'Bienvenue sur App PME', time: '10:30' },
    { id: 2, from: 'Support', subject: 'Nouvelle mise à jour disponible', time: '09:15' },
    { id: 3, from: 'Système', subject: 'Votre session expire dans 15 min', time: '08:00' },
  ];

  return (
    <MotionBox as="div" className="flex h-screen bg-[var(--color-background)] text-[var(--color-textPrimary)] overflow-hidden">
      {/* Overlay pour le drawer droit (mobile) */}
      {isRightOpen && (
        <div 
          className="fixed inset-0 bg-black/50 z-40 lg:hidden"
          onClick={() => setIsRightOpen(false)}
        />
      )}

      {/* Contenu principal (occupe tout l'espace) */}
      <MotionBox as="div" className="flex-1 flex flex-col h-full overflow-hidden">
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 p-4">
          {analytics.map((item, idx) => {
            const Icon = item.icon;
            return (
              <MotionBox
                key={idx}
                type="card"
                variant="default"
                className="p-3 rounded-xl shadow-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                style={{
                  proprietes: {
                    borderLeft: `4px solid ${item.color}`,
                  } as any,
                }}
                animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
              >
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-xs text-[var(--color-textSecondary)]">{item.label}</p>
                    <p className="text-lg font-bold text-[var(--color-textPrimary)]">{item.value}</p>
                  </div>
                  <Icon size={20} style={{ color: item.color }} />
                </div>
              </MotionBox>
            );
          })}
        </div>

        <div className="flex-1 overflow-y-auto p-4 pt-0">
          {renderHistory()}
        </div>
      </MotionBox>

      {/* Drawer droit (messages) – reste si tu veux le garder, sinon supprimer */}
      <MotionBox 
        as="div" 
        className={`
          fixed lg:static inset-y-0 right-0 z-50 w-[280px] bg-[var(--color-cardBg)] border-l border-[var(--color-borderColor)] p-4 flex flex-col h-full transition-transform duration-300
          ${isRightOpen ? 'translate-x-0' : 'translate-x-full lg:translate-x-0'}
        `}
      >
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-2">
            <MessageSquare size={20} className="text-[var(--color-primary)]" />
            <span className="font-semibold text-sm text-[var(--color-textPrimary)]">Messages</span>
            <span className="ml-auto bg-[var(--color-danger)] text-white text-xs px-2 py-0.5 rounded-full">3</span>
          </div>
          <button 
            onClick={() => setIsRightOpen(false)}
            className="lg:hidden text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
          >
            <X size={24} />
          </button>
        </div>
        <div className="flex-1 overflow-y-auto space-y-3">
          {messages.map((msg) => (
            <div key={msg.id} className="p-2 rounded-lg bg-[var(--color-secondary)] hover:bg-[var(--color-secondary)]/70 transition cursor-pointer border border-[var(--color-borderColor)]">
              <div className="flex justify-between items-start">
                <span className="font-medium text-sm text-[var(--color-textPrimary)]">{msg.from}</span>
                <span className="text-xs text-[var(--color-textSecondary)]">{msg.time}</span>
              </div>
              <p className="text-xs text-[var(--color-textSecondary)] mt-1 truncate">{msg.subject}</p>
            </div>
          ))}
          <button className="w-full mt-2 text-center text-xs text-[var(--color-primary)] hover:underline">Voir tous</button>
        </div>
        <div className="mt-auto pt-4 border-t border-[var(--color-borderColor)] text-xs text-[var(--color-textSecondary)]">
          <Bell size={14} className="inline mr-1" /> Notifications en direct
        </div>
      </MotionBox>
    </MotionBox>
  );
};

export default DashboardRoot;
