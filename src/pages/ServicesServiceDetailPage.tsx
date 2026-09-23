// ============================================================
// SERVICE DETAIL PAGE - Vue admin
// Version V2 — Colonne description
// ============================================================

import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useService } from '../hooks/useServices';
import { useAttributsService } from '../hooks/useAttributsService';
import { useDemandesService } from '../hooks/useDemandesService';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Tag, Briefcase, Clock, ShoppingBag, Loader, Wallet } from 'lucide-react';
import { useToast } from '../hooks/useToast';
import { useDeleteService } from '../hooks/useServices';

interface RouteParams {
  id: string;
}

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: service, isLoading } = useService(id);
  const { data: attributs = [] } = useAttributsService();
  const { data: demandes = [] } = useDemandesService({ service_id: id });
  const deleteMutation = useDeleteService();
  const { success, error: toastError } = useToast();

  const handleDelete = async () => {
    if (window.confirm('Supprimer définitivement ce service ?')) {
      try {
        await deleteMutation.mutateAsync(id);
        success('Service supprimé ✅');
        history.push('/gestion/services');
      } catch (err: any) {
        toastError(err.message);
      }
    }
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!service) return <div className="p-6 text-center text-[var(--color-danger)]">Service introuvable</div>;

  const attributsRequis = attributs.filter(a => service.informations_requises?.includes(a.id));

  // ⭐ Statistiques de commandes pour ce service
  const nombreCommandes = demandes.length;
  const commandesEnCours = demandes.filter(
    (d) => d.statut === 'en_attente' || d.statut === 'confirmee' || d.statut === 'en_cours'
  ).length;
  const montantGenere = demandes
    .filter((d) => d.statut !== 'annulee' && d.statut !== 'refusee')
    .reduce((sum, d) => sum + (d.prix_convenu || service.prix || 0), 0);

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/services/liste')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">{service.nom}</h1>
        <span className="ml-auto flex items-center gap-2">
          {service.disponible ? (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-success)]">
              <CheckCircle size={16} /> Disponible
            </span>
          ) : (
            <span className="inline-flex items-center gap-1 px-3 py-1 rounded-full text-sm font-medium text-white bg-[var(--color-danger)]">
              <XCircle size={16} /> Indisponible
            </span>
          )}
        </span>
      </div>

      {/* ⭐ Carte statistiques des commandes */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MotionBox type="card" variant="elevated" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-primary-light)] flex items-center justify-center flex-shrink-0">
            <ShoppingBag size={20} className="text-[var(--color-primary)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-textSecondary)]">Commandes totales</p>
            <p className="text-xl font-bold text-[var(--color-textPrimary)]">{nombreCommandes}</p>
          </div>
        </MotionBox>
        <MotionBox type="card" variant="elevated" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-warning)]/15 flex items-center justify-center flex-shrink-0">
            <Loader size={20} className="text-[var(--color-warning)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-textSecondary)]">Commandes en cours</p>
            <p className="text-xl font-bold text-[var(--color-textPrimary)]">{commandesEnCours}</p>
          </div>
        </MotionBox>
        <MotionBox type="card" variant="elevated" className="p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-[var(--color-success)]/15 flex items-center justify-center flex-shrink-0">
            <Wallet size={20} className="text-[var(--color-success)]" />
          </div>
          <div>
            <p className="text-xs text-[var(--color-textSecondary)]">Montant généré</p>
            <p className="text-xl font-bold text-[var(--color-textPrimary)]">{montantGenere.toLocaleString()} FCFA</p>
          </div>
        </MotionBox>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-1">
          {service.image_url ? (
            <img
              src={service.image_url}
              alt={service.nom}
              className="w-full aspect-square object-cover rounded-xl"
            />
          ) : (
            <div className="w-full aspect-square rounded-xl bg-[var(--color-secondary)] flex items-center justify-center">
              <Briefcase size={64} className="text-[var(--color-textSecondary)] opacity-30" />
            </div>
          )}
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--color-textSecondary)]">Description</p>
              <p className="text-[var(--color-textPrimary)]">{service.description || 'Aucune description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {(service.mode_paiement === 'forfait' || service.mode_paiement === 'les_deux' || !service.mode_paiement) && (
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)]">Prix forfait</p>
                  <p className="text-xl font-bold text-[var(--color-primary)]">
                    {service.prix.toLocaleString()} FCFA
                  </p>
                </div>
              )}
              {(service.mode_paiement === 'horaire' || service.mode_paiement === 'les_deux') && (
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)]">Prix horaire</p>
                  <p className="text-xl font-bold text-[var(--color-primary)] flex items-center gap-2">
                    <Clock size={20} /> {(service.prix_horaire || 0).toLocaleString()} FCFA/h
                  </p>
                </div>
              )}
            </div>

            {service.categorie_service && (
              <div>
                <p className="text-sm text-[var(--color-textSecondary)]">Catégorie</p>
                <p className="text-[var(--color-textPrimary)]">{service.categorie_service.nom}</p>
              </div>
            )}

            <div>
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <Tag size={16} /> Informations requises
              </p>
              {attributsRequis.length === 0 ? (
                <p className="text-sm text-[var(--color-textSecondary)]">Aucune information requise</p>
              ) : (
                <div className="flex flex-wrap gap-2 mt-2">
                  {attributsRequis.map((attr) => (
                    <span
                      key={attr.id}
                      className="px-3 py-1 rounded-full text-sm bg-[var(--color-secondary)] text-[var(--color-textPrimary)] border border-[var(--color-borderColor)]"
                    >
                      {attr.nom} {attr.obligatoire && ' *'}
                    </span>
                  ))}
                </div>
              )}
            </div>

            <div className="pt-4 border-t border-[var(--color-borderColor)] text-xs text-[var(--color-textSecondary)]">
              <p>Créé le : {new Date(service.created_at || '').toLocaleString()}</p>
              {service.updated_at && (
                <p>Modifié le : {new Date(service.updated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </MotionBox>
      </div>

      <div className="mt-6 flex justify-end gap-3 border-t border-[var(--color-borderColor)] pt-4">
        <button
          onClick={() => history.push('/gestion/services/liste')}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
        >
          <Edit size={18} /> Modifier
        </button>
        <button
          onClick={handleDelete}
          className="px-4 py-2 rounded-xl border border-[var(--color-danger)] text-[var(--color-danger)] hover:bg-red-50 transition flex items-center gap-2"
        >
          <Trash2 size={18} /> Supprimer
        </button>
      </div>
    </div>
  );
};

export default ServiceDetailPage;
