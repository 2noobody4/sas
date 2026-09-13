import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useCommandeClient, useUpdateCommandeClientStatut } from '../../hooks/useCommandesClient';
import { STATUTS_COMMANDE_CLIENT, StatutCommandeClient } from '../../types/commandeClient';
import { ArrowLeft, Printer, Edit, Download, Truck, Calendar, User, Package, DollarSign, MapPin, Phone, Mail } from 'lucide-react';
import { useToast } from '../../hooks/useToast';

interface RouteParams {
  id: string;
}

export const CommandeClientDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: commande, isLoading } = useCommandeClient(id);
  const updateStatut = useUpdateCommandeClientStatut();
  const { success, error: toastError } = useToast();

  const handleStatutChange = async (statut: StatutCommandeClient) => {
    try {
      await updateStatut.mutateAsync({ id, statut });
      success('Statut mis à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    }
  };

  const getStatutColor = (statut: StatutCommandeClient) => {
    const found = STATUTS_COMMANDE_CLIENT.find(s => s.value === statut);
    return found?.color || 'var(--color-textSecondary)';
  };

  const getStatutLabel = (statut: StatutCommandeClient) => {
    const found = STATUTS_COMMANDE_CLIENT.find(s => s.value === statut);
    return found?.label || statut;
  };

  const getStatutIcon = (statut: StatutCommandeClient) => {
    const found = STATUTS_COMMANDE_CLIENT.find(s => s.value === statut);
    return found?.icon || '📌';
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!commande) return <div className="p-6 text-center text-[var(--color-danger)]">Commande introuvable</div>;

  return (
    <div className="p-6 max-w-5xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/clients/commandes')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">📄 Commande {commande.numero}</h1>
        <span
          className="ml-auto px-3 py-1 rounded-full text-sm font-medium text-white"
          style={{ backgroundColor: getStatutColor(commande.statut) }}
        >
          {getStatutIcon(commande.statut)} {getStatutLabel(commande.statut)}
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations client */}
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <User size={18} /> Client
          </h3>
          <div className="space-y-2">
            <p className="font-medium text-[var(--color-textPrimary)]">
              {commande.client?.nom} {commande.client?.prenom || ''}
            </p>
            {commande.client?.email && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                <Mail size={14} /> {commande.client.email}
              </p>
            )}
            {commande.client?.telephone && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                <Phone size={14} /> {commande.client.telephone}
              </p>
            )}
            {commande.adresse_livraison && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-1">
                <MapPin size={14} /> {commande.adresse_livraison}
              </p>
            )}
            {commande.client?.segment && (
              <p className="text-sm">
                Segment: <span className="font-medium text-[var(--color-primary)]">{commande.client.segment}</span>
              </p>
            )}
            {commande.client?.niveau_fidelite && (
              <p className="text-sm">
                Fidélité: <span className="font-medium text-[var(--color-accent)]">{commande.client.niveau_fidelite}</span>
              </p>
            )}
          </div>
        </MotionBox>

        {/* Informations commande */}
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <Calendar size={18} /> Informations
          </h3>
          <div className="space-y-2">
            <p className="text-sm">
              <span className="text-[var(--color-textSecondary)]">Date :</span>{' '}
              <span className="font-medium text-[var(--color-textPrimary)]">
                {new Date(commande.date_commande).toLocaleDateString()}
              </span>
            </p>
            {commande.date_livraison_prevue && (
              <p className="text-sm">
                <span className="text-[var(--color-textSecondary)]">Livraison prévue :</span>{' '}
                <span className="font-medium text-[var(--color-textPrimary)]">
                  {new Date(commande.date_livraison_prevue).toLocaleDateString()}
                </span>
              </p>
            )}
            {commande.date_livraison_effective && (
              <p className="text-sm">
                <span className="text-[var(--color-textSecondary)]">Livrée le :</span>{' '}
                <span className="font-medium text-[var(--color-success)]">
                  {new Date(commande.date_livraison_effective).toLocaleDateString()}
                </span>
              </p>
            )}
            {commande.mode_paiement && (
              <p className="text-sm">
                <span className="text-[var(--color-textSecondary)]">Paiement :</span>{' '}
                <span className="font-medium text-[var(--color-textPrimary)]">{commande.mode_paiement}</span>
              </p>
            )}
          </div>

          {/* Changement de statut */}
          <div className="mt-3 pt-3 border-t border-[var(--color-borderColor)]">
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">Changer le statut</label>
            <select
              value={commande.statut}
              onChange={(e) => handleStatutChange(e.target.value as StatutCommandeClient)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            >
              {STATUTS_COMMANDE_CLIENT.map((s) => (
                <option key={s.value} value={s.value}>{s.icon} {s.label}</option>
              ))}
            </select>
          </div>
        </MotionBox>

        {/* Résumé financier */}
        <MotionBox type="card" variant="elevated" className="p-4">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <DollarSign size={18} /> Montants
          </h3>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span className="text-[var(--color-textSecondary)]">Sous-total</span>
              <span className="font-medium text-[var(--color-textPrimary)]">{commande.sous_total.toLocaleString()} FCFA</span>
            </div>
            {commande.remise > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-textSecondary)]">Remise</span>
                <span className="font-medium text-[var(--color-danger)]">-{commande.remise.toLocaleString()} FCFA</span>
              </div>
            )}
            {commande.frais_livraison > 0 && (
              <div className="flex justify-between text-sm">
                <span className="text-[var(--color-textSecondary)]">Livraison</span>
                <span className="font-medium text-[var(--color-textPrimary)]">{commande.frais_livraison.toLocaleString()} FCFA</span>
              </div>
            )}
            <div className="border-t border-[var(--color-borderColor)] pt-2 flex justify-between font-bold">
              <span className="text-[var(--color-textPrimary)]">Total</span>
              <span className="text-[var(--color-primary)] text-lg">{commande.montant_total.toLocaleString()} FCFA</span>
            </div>
          </div>
        </MotionBox>

        {/* Produits */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-3">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <Package size={18} /> Produits commandés
          </h3>
          {commande.lignes?.length === 0 ? (
            <p className="text-sm text-[var(--color-textSecondary)]">Aucun produit</p>
          ) : (
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                  <tr>
                    <th className="px-4 py-2 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Produit</th>
                    <th className="px-4 py-2 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Qté</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Prix unitaire</th>
                    <th className="px-4 py-2 text-right text-sm font-semibold text-[var(--color-textPrimary)]">Total</th>
                  </tr>
                </thead>
                <tbody>
                  {(commande.lignes || []).map((ligne: any) => (
                    <tr key={ligne.id || ligne.produit_id} className="border-t border-[var(--color-borderColor)]">
                      <td className="px-4 py-2 text-sm text-[var(--color-textPrimary)]">
                        {ligne.produit?.nom || 'Produit inconnu'}
                      </td>
                      <td className="px-4 py-2 text-center text-sm text-[var(--color-textSecondary)]">{ligne.quantite}</td>
                      <td className="px-4 py-2 text-right text-sm text-[var(--color-textSecondary)]">
                        {ligne.prix_unitaire.toLocaleString()} FCFA
                      </td>
                      <td className="px-4 py-2 text-right font-medium text-[var(--color-textPrimary)]">
                        {(ligne.prix_unitaire * ligne.quantite).toLocaleString()} FCFA
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          )}
        </MotionBox>

        {/* Notes */}
        {commande.notes && (
          <MotionBox type="card" variant="default" className="p-4 lg:col-span-3">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2">📝 Notes</h3>
            <p className="text-sm text-[var(--color-textSecondary)]">{commande.notes}</p>
          </MotionBox>
        )}

        {/* Actions */}
        <div className="lg:col-span-3 flex justify-end gap-3">
          <button
            onClick={() => window.print()}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <Printer size={18} /> Imprimer
          </button>
          <button
            onClick={() => history.push(`/gestion/clients/commandes/${id}/edit`)}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <Edit size={18} /> Modifier
          </button>
        </div>
      </div>
    </div>
  );
};

export default CommandeClientDetailPage;
