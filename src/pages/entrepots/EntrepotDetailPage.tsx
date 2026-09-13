import React from 'react';
import { useParams, useHistory, Link } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useEntrepot } from '../../hooks/useEntrepots';
import { useProduits } from '../../hooks/useProduits';
import { useTransferts } from '../../hooks/useEntrepots';
import { ArrowLeft, Building, MapPin, Phone, Mail, User, Package, RefreshCw, Layers, Edit } from 'lucide-react';

interface RouteParams {
  id: string;
}

export const EntrepotDetailPage: React.FC = () => {
  const { id } = useParams<RouteParams>();
  const history = useHistory();
  const { data: entrepot, isLoading: entrepotLoading } = useEntrepot(id);
  const { data: produits = [] } = useProduits();
  const { data: transferts = [] } = useTransferts();

  const produitsEntrepot = produits.filter((p: any) => p.entrepot_id === id);

  if (entrepotLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  if (!entrepot) return <div className="p-6 text-center text-[var(--color-danger)]">Entrepôt introuvable</div>;

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/entrepots')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🏭 {entrepot.nom}</h1>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Informations */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-1">
          <div className="space-y-3">
            <h3 className="font-semibold text-[var(--color-textPrimary)]">Informations</h3>
            {entrepot.adresse && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <MapPin size={16} /> {entrepot.adresse}
              </p>
            )}
            {entrepot.telephone && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <Phone size={16} /> {entrepot.telephone}
              </p>
            )}
            {entrepot.email && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <Mail size={16} /> {entrepot.email}
              </p>
            )}
            {entrepot.responsable && (
              <p className="text-sm text-[var(--color-textSecondary)] flex items-center gap-2">
                <User size={16} /> {entrepot.responsable}
              </p>
            )}
            {(entrepot.salle || entrepot.etage || entrepot.etagere || entrepot.emplacement) && (
              <div className="pt-2 border-t border-[var(--color-borderColor)]">
                <p className="text-sm font-medium text-[var(--color-textPrimary)]">📍 Emplacement principal</p>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  {entrepot.salle && `Salle ${entrepot.salle}`}
                  {entrepot.etage && ` • Étage ${entrepot.etage}`}
                  {entrepot.etagere && ` • Étagère ${entrepot.etagere}`}
                  {entrepot.emplacement && ` • ${entrepot.emplacement}`}
                </p>
              </div>
            )}
            <div>
              <span className={`px-2 py-1 rounded-full text-xs font-medium ${
                entrepot.actif ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' :
                'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'
              }`}>
                {entrepot.actif ? '✅ Actif' : '❌ Inactif'}
              </span>
            </div>
          </div>
        </MotionBox>

        {/* Produits stockés */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-2">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <Package size={18} /> Produits stockés
          </h3>
          {produitsEntrepot.length === 0 ? (
            <p className="text-sm text-[var(--color-textSecondary)]">Aucun produit dans cet entrepôt.</p>
          ) : (
            <div className="space-y-2 max-h-60 overflow-y-auto">
              {produitsEntrepot.map((p: any) => (
                <div key={p.id} className="flex justify-between items-center p-2 rounded border border-[var(--color-borderColor)]">
                  <span className="font-medium text-[var(--color-textPrimary)]">{p.nom}</span>
                  <span className="text-sm text-[var(--color-textSecondary)]">Quantité: {p.quantite}</span>
                </div>
              ))}
            </div>
          )}
        </MotionBox>

        {/* Transferts récents */}
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-3">
          <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
            <RefreshCw size={18} /> Transferts récents
          </h3>
          {transferts.filter((t: any) => t.origine_entrepot_id === id || t.destination_entrepot_id === id).length === 0 ? (
            <p className="text-sm text-[var(--color-textSecondary)]">Aucun transfert récent.</p>
          ) : (
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {transferts.filter((t: any) => t.origine_entrepot_id === id || t.destination_entrepot_id === id).slice(0, 10).map((t: any) => (
                <div key={t.id} className="flex justify-between items-center p-2 rounded border border-[var(--color-borderColor)]">
                  <div>
                    <span className="font-medium text-[var(--color-textPrimary)]">{t.produit?.nom}</span>
                    <span className="text-sm text-[var(--color-textSecondary)] ml-2">
                      {t.origine_entrepot_id === id ? '📤 Sortie' : '📥 Entrée'}
                    </span>
                  </div>
                  <span className="text-sm text-[var(--color-textSecondary)]">x{t.quantite}</span>
                </div>
              ))}
            </div>
          )}
        </MotionBox>
      </div>

      {/* Boutons d'action en bas */}
      <div className="mt-6 flex flex-wrap justify-end gap-3 border-t border-[var(--color-borderColor)] pt-4">
        <Link
          to={`/gestion/entrepots/${id}/emplacements`}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
        >
          <Layers size={18} /> Gérer les emplacements
        </Link>
        <button
          onClick={() => history.push(`/gestion/entrepots/${id}/edit`)}
          className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
        >
          <Edit size={18} /> Modifier
        </button>
      </div>
    </div>
  );
};

export default EntrepotDetailPage;
