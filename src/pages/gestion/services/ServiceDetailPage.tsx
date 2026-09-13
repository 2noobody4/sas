// ============================================================
// SERVICE DETAIL PAGE - Détail d'un service (Admin)
// Version V3 - Compatible React 16
// ============================================================

import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { useService } from '../../../hooks/useServices';
import { useAttributsService } from '../../../hooks/useAttributsService';
import { ArrowLeft, Edit, Trash2, CheckCircle, XCircle, Tag, Briefcase, DollarSign, Clock } from 'lucide-react';
import { useToast } from '../../../hooks/useToast';
import { useDeleteService } from '../../../hooks/useServices';

interface RouteParams {
  id: string;
}

export const ServiceDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: service, isLoading } = useService(id);
  const { data: attributs = [] } = useAttributsService();
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

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/services')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
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

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Image */}
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

        {/* Infos */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-2">
          <div className="space-y-4">
            <div>
              <p className="text-sm text-[var(--color-textSecondary)]">Descriptif</p>
              <p className="text-[var(--color-textPrimary)]">{service.descriptif || 'Aucune description'}</p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <p className="text-sm text-[var(--color-textSecondary)]">Prix</p>
                <p className="text-xl font-bold text-[var(--color-primary)]">
                  {service.prix.toLocaleString()} FCFA
                </p>
              </div>
              {service.duree && (
                <div>
                  <p className="text-sm text-[var(--color-textSecondary)]">Durée estimée</p>
                  <p className="text-xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
                    <Clock size={20} /> {service.duree}
                  </p>
                </div>
              )}
            </div>

            {service.categorie && (
              <div>
                <p className="text-sm text-[var(--color-textSecondary)]">Catégorie</p>
                <p className="text-[var(--color-textPrimary)]">{service.categorie.nom}</p>
              </div>
            )}

            {/* Attributs requis */}
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

            {/* Métadonnées */}
            <div className="pt-4 border-t border-[var(--color-borderColor)] text-xs text-[var(--color-textSecondary)]">
              <p>Créé le : {new Date(service.created_at || '').toLocaleString()}</p>
              {service.updated_at && (
                <p>Modifié le : {new Date(service.updated_at).toLocaleString()}</p>
              )}
            </div>
          </div>
        </MotionBox>
      </div>

      {/* Actions */}
      <div className="mt-6 flex justify-end gap-3 border-t border-[var(--color-borderColor)] pt-4">
        <button
          onClick={() => history.push(`/gestion/services/${id}/edit`)}
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
