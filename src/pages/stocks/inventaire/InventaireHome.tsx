import React from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../../components/ui/MotionBox';
import { 
  LayoutDashboard, 
  ClipboardList, 
  CheckSquare, 
  FileText, 
  PlusCircle,
  TrendingUp,
  AlertTriangle,
  CheckCircle
} from 'lucide-react';
import { useSessionsInventaire } from '../../../hooks/useInventaire';

export const InventaireHome: React.FC = () => {
  const history = useHistory();
  const { data: sessions = [], isLoading } = useSessionsInventaire();

  // Statistiques
  const totalSessions = sessions.length;
  const sessionsOuvertes = sessions.filter(s => s.statut === 'ouverte' || s.statut === 'en_cours').length;
  const sessionsValidees = sessions.filter(s => s.statut === 'validee').length;

  const modules = [
    {
      id: 'sessions',
      path: '/gestion/stocks/inventaire/sessions',
      label: 'Sessions',
      icon: ClipboardList,
      description: 'Gérer les sessions d\'inventaire',
      color: '#1E3A5F',
      bgColor: 'rgba(30,58,95,0.08)',
      badge: `${sessionsOuvertes} en cours`,
    },
    {
      id: 'controle',
      path: '/gestion/stocks/inventaire/controle',
      label: 'Contrôle',
      icon: CheckSquare,
      description: 'Compter les produits',
      color: '#2F9E44',
      bgColor: 'rgba(47,158,68,0.08)',
      badge: 'Comptage',
    },
    {
      id: 'rapport',
      path: '/gestion/stocks/inventaire/rapport',
      label: 'Rapports',
      icon: FileText,
      description: 'Consulter les rapports d\'inventaire',
      color: '#E8A33D',
      bgColor: 'rgba(232,163,61,0.08)',
      badge: `${sessionsValidees} validées`,
    },
  ];

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-7xl mx-auto">
      {/* En-tête */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <LayoutDashboard size={28} />
          </span>
          Module Inventaire
        </h1>
        <p className="mt-1 text-[var(--color-textSecondary)] text-sm">
          Gérez vos sessions d'inventaire, comptez les produits et consultez les rapports.
        </p>
      </div>

      {/* Statistiques */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <ClipboardList size={28} className="mx-auto text-[var(--color-primary)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{totalSessions}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Total sessions</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <AlertTriangle size={28} className="mx-auto text-[var(--color-warning)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{sessionsOuvertes}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Sessions en cours</p>
        </MotionBox>
        <MotionBox type="card" variant="default" className="p-4 text-center">
          <CheckCircle size={28} className="mx-auto text-[var(--color-success)]" />
          <p className="text-2xl font-bold text-[var(--color-textPrimary)] mt-2">{sessionsValidees}</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Sessions validées</p>
        </MotionBox>
      </div>

      {/* Actions rapides */}
      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
        <MotionBox
          as="button"
          type="card"
          variant="medium"
          className="p-4 text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 active:scale-[0.98] border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] rounded-xl"
          onClick={() => history.push('/gestion/stocks/inventaire/sessions')}
          animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
        >
          <PlusCircle size={32} className="mx-auto text-[var(--color-primary)]" />
          <p className="font-medium text-[var(--color-textPrimary)] mt-2">Nouvelle session</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Démarrer un inventaire</p>
        </MotionBox>
        <MotionBox
          as="button"
          type="card"
          variant="medium"
          className="p-4 text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 active:scale-[0.98] border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] rounded-xl"
          onClick={() => history.push('/gestion/stocks/inventaire/controle')}
          animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
        >
          <CheckSquare size={32} className="mx-auto text-[var(--color-success)]" />
          <p className="font-medium text-[var(--color-textPrimary)] mt-2">Continuer un contrôle</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Reprendre un comptage</p>
        </MotionBox>
        <MotionBox
          as="button"
          type="card"
          variant="medium"
          className="p-4 text-center cursor-pointer hover:shadow-lg transition-all hover:-translate-y-1 active:scale-[0.98] border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] rounded-xl"
          onClick={() => history.push('/gestion/stocks/inventaire/rapport')}
          animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
        >
          <FileText size={32} className="mx-auto text-[var(--color-accent)]" />
          <p className="font-medium text-[var(--color-textPrimary)] mt-2">Voir les rapports</p>
          <p className="text-sm text-[var(--color-textSecondary)]">Analyser les écarts</p>
        </MotionBox>
      </div>

      {/* Cartes des modules */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-5">
        {modules.map((mod) => {
          const Icon = mod.icon;
          return (
            <MotionBox
              key={mod.id}
              as="button"
              type="card"
              variant="medium"
              className="h-full p-5 rounded-2xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col relative overflow-hidden text-left cursor-pointer"
              onClick={() => history.push(mod.path)}
              style={{
                proprietes: {
                  borderLeft: `4px solid ${mod.color}`,
                  transition: 'all 0.25s ease',
                } as any,
              }}
              animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
            >
              <div className="absolute top-0 left-0 right-0 h-1" style={{ backgroundColor: mod.color }} />

              <div className="flex items-start justify-between mb-3">
                <div className="p-3 rounded-xl" style={{ backgroundColor: mod.bgColor, color: mod.color }}>
                  <Icon size={28} strokeWidth={1.8} />
                </div>
                {mod.badge && (
                  <span className="text-xs font-medium px-2.5 py-1 rounded-full text-white" style={{ backgroundColor: mod.color }}>
                    {mod.badge}
                  </span>
                )}
              </div>

              <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">{mod.label}</h3>
              <p className="text-sm text-[var(--color-textSecondary)] mt-1 flex-1">{mod.description}</p>

              <div className="mt-4 flex items-center gap-1 text-sm font-medium" style={{ color: mod.color }}>
                Accéder
                <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                </svg>
              </div>
            </MotionBox>
          );
        })}
      </div>

      {/* Dernières sessions */}
      {sessions.length > 0 && (
        <div className="mt-6">
          <MotionBox type="card" variant="elevated" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 flex items-center gap-2">
              <ClipboardList size={18} className="text-[var(--color-primary)]" />
              Dernières sessions
            </h3>
            <div className="space-y-2">
              {sessions.slice(0, 5).map((s) => (
                <div key={s.id} className="flex items-center justify-between p-2 rounded border border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                  <div>
                    <span className="font-medium text-[var(--color-textPrimary)]">{s.nom || 'Sans nom'}</span>
                    <span className="ml-2 text-sm text-[var(--color-textSecondary)]">
                      {new Date(s.date_debut).toLocaleDateString()}
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className={`px-2 py-0.5 rounded-full text-xs font-medium text-white ${
                      s.statut === 'ouverte' || s.statut === 'en_cours' 
                        ? 'bg-[var(--color-warning)]' 
                        : 'bg-[var(--color-success)]'
                    }`}>
                      {s.statut === 'ouverte' || s.statut === 'en_cours' ? 'En cours' : 'Validée'}
                    </span>
                    <button
                      onClick={() => {
                        if (s.statut === 'ouverte' || s.statut === 'en_cours') {
                          history.push(`/gestion/stocks/inventaire/controle/${s.id}`);
                        } else {
                          history.push(`/gestion/stocks/inventaire/rapport/${s.id}`);
                        }
                      }}
                      className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                    >
                      <FileText size={14} />
                    </button>
                  </div>
                </div>
              ))}
            </div>
          </MotionBox>
        </div>
      )}
    </div>
  );
};

export default InventaireHome;
