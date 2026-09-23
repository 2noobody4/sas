import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useCommande } from '../hooks/useBoutique';
import { STATUTS_COMMANDE } from '../types/boutique';
import { ArrowLeft, Truck, Calendar, User, Mail, Phone, MapPin } from 'lucide-react';

interface RouteParams {
  id: string;
}

export const CommandeDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: commande, isLoading } = useCommande(id);

  const getStatutColor = (statut: string) => {
    const found = STATUTS_COMMANDE.find(s => s.value === statut);
    return found?.color || 'var(--color-textSecondary)';
  };

  const getStatutLabel = (statut: string) => {
    const found = STATUTS_COMMANDE.find(s => s.value === statut);
    return found?.label || statut;
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!commande) return <div className="p-6 text-center text-[var(--color-danger)]">Commande introuvable</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/clients/commandes')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📦 Détail de la commande</h1>
        <span className="ml-auto text-sm font-mono text-[var(--color-textSecondary)]">#{commande.id.slice(0, 8)}</span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations principales */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-2">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)]">Informations</h3>
            <span className="px-3 py-1 rounded-full text-sm font-medium text-white" style={{ backgroundColor: getStatutColor(commande.statut) }}>
              {getStatutLabel(commande.statut)}
            </span>
          </div>

          <div className="space-y-2">
            <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
              <Calendar size={16} />
              Commandé le {new Date(commande.date_commande).toLocaleDateString()}
            </p>
            <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
              <Truck size={16} />
              {commande.date_livraison_prevue ? `Livraison prévue le ${new Date(commande.date_livraison_prevue).toLocaleDateString()}` : 'Date de livraison non définie'}
            </p>
            {commande.mode_paiement && (
              <p className="text-sm text-[var(--color-textSecondary)]">
                Paiement : {commande.mode_paiement}
              </p>
            )}
            {commande.notes && (
              <p className="text-sm text-[var(--color-textSecondary)] mt-2 p-2 rounded bg-[var(--color-secondary)]">
                📝 {commande.notes}
              </p>
            )}
          </div>

          <h4 className="font-semibold text-[var(--color-textPrimary)] mt-4 mb-2">🛍️ Produits</h4>
          <div className="space-y-2">
            {commande.items.map((item: any, index: number) => (
              <div key={index} className="flex justify-between items-center p-2 rounded border border-[var(--color-borderColor)]">
                <div>
                  <span className="font-medium text-[var(--color-textPrimary)]">{item.produit?.nom || 'Produit'}</span>
                  <span className="ml-2 text-sm text-[var(--color-textSecondary)]">x{item.quantite}</span>
                </div>
                <span className="font-medium text-[var(--color-textPrimary)]">
                  {(item.prix_unitaire * item.quantite).toLocaleString()} FCFA
                </span>
              </div>
            ))}
          </div>

          <div className="mt-4 pt-3 border-t border-[var(--color-borderColor)]">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-textSecondary)]">Sous-total</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{(commande.montant_total - commande.frais_livraison).toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-textSecondary)]">Frais de livraison</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{commande.frais_livraison.toLocaleString()} FCFA</span>
            </div>
            <div className="flex justify-between text-lg font-bold pt-2 border-t border-[var(--color-borderColor)]">
              <span className="text-[var(--color-textPrimary)]">Total</span>
              <span className="text-[var(--color-primary)]">{commande.montant_total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </MotionBox>

        {/* Informations client */}
        <MotionBox type="card" variant="default" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3">👤 Client</h3>
          <div className="space-y-2">
            <p className="text-sm text-[var(--color-textPrimary)] flex items-center gap-2">
              <User size={16} className="text-[var(--color-textSecondary)]" />
              {commande.client_nom || 'Anonyme'}
            </p>
            {commande.client_email && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <Mail size={16} />
                {commande.client_email}
              </p>
            )}
            {commande.client_telephone && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <Phone size={16} />
                {commande.client_telephone}
              </p>
            )}
            {commande.client_adresse && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-start gap-2">
                <MapPin size={16} className="mt-0.5" />
                {commande.client_adresse}
              </p>
            )}
          </div>
        </MotionBox>
      </div>
    </div>
  );
};

export default CommandeDetailPage;
