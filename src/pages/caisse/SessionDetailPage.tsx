import React from 'react';
import { useParams, useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useSessionActive } from '../../hooks/useSessions';
import { useVentes } from '../../hooks/useVentes';
import { SessionStatusBadge } from '../../components/caisse/SessionStatusBadge';
import { ArrowLeft, Receipt, Coins } from 'lucide-react';

export const SessionDetailPage: React.FC = () => {
  const { id } = useParams<{ id: string }>();
  const history = useHistory();
  const { data: session, isLoading: sessionLoading } = useSessionActive(); // Ici on pourrait utiliser un hook useSession(id)
  // Pour l'instant, on utilise useSessionActive qui ne prend pas d'id. On va créer un hook useSessionById plus tard.
  // On va donc utiliser les données de sessionActive pour l'exemple.
  // Idéalement, il faudrait un hook useSessionById.

  const { data: ventes = [], isLoading: ventesLoading } = useVentes(id);

  // Pour l'instant, on affiche un placeholder
  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion/caisse/sessions')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">Détail de la session</h1>
      </div>
      {sessionLoading ? (
        <p className="text-[var(--color-textSecondary)]">Chargement...</p>
      ) : (
        <MotionBox type="card" variant="elevated" className="p-4">
          <p className="text-[var(--color-textSecondary)]">Page en cours de développement. Session ID : {id}</p>
          {/* Ici on affichera les détails de la session et les ventes associées */}
        </MotionBox>
      )}
    </div>
  );
};

export default SessionDetailPage;
