// ============================================================
// MES DEMANDES SERVICE — Vue client
// Version V1 — Compatible React 16
// ============================================================

import React from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useMesDemandesService } from '../hooks/useDemandesService';
import { STATUTS_DEMANDE_SERVICE, StatutDemandeService } from '../types/demandesService';
import { ArrowLeft, Briefcase, Clock, Calendar } from 'lucide-react';

export const MesDemandesServicePage: React.FC = () => {
  const history = useHistory();
  const { data: demandes = [], isLoading } = useMesDemandesService();

  const getStatutInfo = (statut: StatutDemandeService) =>
    STATUTS_DEMANDE_SERVICE.find((s) => s.value === statut) || STATUTS_DEMANDE_SERVICE[0];

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  return (
    <div className="p-6 max-w-4xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
          <Clock size={24} className="text-[var(--color-primary)]" />
          Mes demandes de service
        </h1>
      </div>

      {demandes.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <Briefcase size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg">Aucune demande pour le moment</p>
          <p className="text-sm mb-4">Parcourez nos services et faites votre première demande.</p>
          <button
            onClick={() => history.push('/services')}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
          >
            Voir les services
          </button>
        </MotionBox>
      ) : (
        <div className="space-y-3">
          {demandes.map((d) => {
            const info = getStatutInfo(d.statut);
            return (
              <MotionBox key={d.id} type="card" variant="default" className="p-4">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <h3 className="font-semibold text-[var(--color-textPrimary)]">
                      {d.service?.nom || 'Service supprimé'}
                    </h3>
                    <div className="flex flex-wrap items-center gap-3 mt-1 text-sm text-[var(--color-textSecondary)]">
                      <span className="flex items-center gap-1">
                        <Calendar size={14} />
                        Demandé le {new Date(d.created_at).toLocaleDateString()}
                      </span>
                      {d.date_souhaitee && (
                        <span className="flex items-center gap-1">
                          <Clock size={14} />
                          Souhaité : {new Date(d.date_souhaitee).toLocaleDateString()}
                        </span>
                      )}
                      {d.prix_convenu ? (
                        <span className="font-medium text-[var(--color-primary)]">
                          {d.prix_convenu.toLocaleString()} FCFA
                        </span>
                      ) : null}
                    </div>
                    {d.notes_admin && (
                      <p className="mt-2 text-xs text-[var(--color-textSecondary)] italic">
                        Note admin : {d.notes_admin}
                      </p>
                    )}
                  </div>
                  <span
                    className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-medium text-white flex-shrink-0"
                    style={{ backgroundColor: info.color }}
                  >
                    {info.icon} {info.label}
                  </span>
                </div>
              </MotionBox>
            );
          })}
        </div>
      )}
    </div>
  );
};

export default MesDemandesServicePage;
