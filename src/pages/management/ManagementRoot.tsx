import React from 'react';
import { Link } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { getManagementModules } from '../../registres/modulesRegistry';
import { resolveLucideIcon } from '../../registres/lucideRegistry';
import { useAuth } from '../../hooks/useAuth';
import { 
  LayoutDashboard, 
  Package, Coins, Receipt, Users, User, 
  BarChart, Palette, Film, Settings, Store,
  Truck, FolderTree, GitBranch, ClipboardList,
  Tag, TrendingUp, FileText, UserPlus, Phone,
  Calendar, CreditCard, Clock, BookOpen, Scale,
  List, Database, DollarSign, PlusCircle, Building,
  MapPin, Layers, Archive, Home, Eye, EyeOff,
  Search, Filter, Grid, Box, Star
} from 'lucide-react';
import { Bell } from 'lucide-react';

// Récupérer les icônes pour les sous-modules
const getSubModuleIcon = (moduleId: string): any => {
  const icons: Record<string, any> = {
    'management-stocks-produits': Package,
    'management-stocks-produits-nouveau': PlusCircle,
    'management-stocks-categories': FolderTree,
    'management-stocks-fournisseurs': Truck,
    'management-stocks-mouvements': GitBranch,
    'management-stocks-inventaire': ClipboardList,
    'management-stocks-promotions': Tag,
    'management-stocks-dashboard': TrendingUp,
    'clients-liste': Users,
    'clients-nouveau': UserPlus,
    'clients-fidelite': Star,
    'clients-interactions': Phone,
    'clients-rapports': BarChart,
    'clients-commandes': Truck,
    'clients-commande-nouvelle': PlusCircle,
    'caisse-sessions': Coins,
    'caisse-ventes': Receipt,
    'caisse-nouvelle-vente': PlusCircle,
    'caisse-rapports': BarChart,
    'caisse-negociation': TrendingUp,
    'compta-journal': BookOpen,
    'compta-bilan': Scale,
    'compta-compte-resultat': FileText,
    'compta-transactions': List,
    'compta-plan-comptable': Database,
    'compta-saisie': FileText,
    'compta-factures': Receipt,
    'compta-facture-nouvelle': PlusCircle,
    'compta-rappels': Bell,
    'compta-charges': DollarSign,
    'compta-charge-nouvelle': PlusCircle,
    'rh-employes': Users,
    'rh-employe-nouveau': UserPlus,
    'rh-contrats': FileText,
    'rh-conges': Calendar,
    'rh-fiches-paie': CreditCard,
    'rh-pointages': Clock,
    'rh-demandes-absence': Clock,
    'management-entrepots': Building,
    'management-entrepots-nouveau': PlusCircle,
    'management-emplacements': Layers,
    'management-magasins': Store,
    'management-magasins-nouveau': PlusCircle,
    'management-home-editor': Home,
    'management-demandes': ClipboardList,
    'management-analytics': TrendingUp,
    'management-theme': Palette,
    'management-animations': Film,
    'management-params': Settings,
    'management-historique': FileText,
    'offline-queue': Clock,
    // Nouveau module inventaire
    'management-stocks-inventaire-sessions': ClipboardList,
    'management-stocks-inventaire-controle': Eye,
    'management-stocks-inventaire-rapport': BarChart,
  };
  return icons[moduleId] || Box;
};

export const ManagementRoot: React.FC = () => {
  const { user } = useAuth();
  const role = user?.role?.nom || 'client';

  const modules = getManagementModules(role);

  // Séparer les modules parents des sous-modules
  const parentModules = modules.filter(m => m.isSidebarItem !== false);
  const childModules = modules.filter(m => m.isSidebarItem === false);

  // Organiser les sous-modules par ID parent (en utilisant le préfixe)
  const childModulesByParent: Record<string, any[]> = {};
  childModules.forEach(mod => {
    const parentId = mod.id.split('-').slice(0, 2).join('-');
    if (!childModulesByParent[parentId]) {
      childModulesByParent[parentId] = [];
    }
    childModulesByParent[parentId].push(mod);
  });

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
          <span className="p-2 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
            <LayoutDashboard size={28} />
          </span>
          Modules de gestion
        </h1>
        <p className="mt-1 text-[var(--color-textSecondary)] text-sm">
          Accédez rapidement à tous les outils de gestion de votre entreprise.
        </p>
        <p className="text-xs text-[var(--color-textSecondary)] mt-1">
          Rôle actif : <span className="font-medium text-[var(--color-primary)] capitalize">{role}</span>
        </p>
      </div>

      {/* Modules parents */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-4">
        {parentModules.map((mod) => {
          const Icon = resolveLucideIcon(mod.icon);
          const childMods = childModulesByParent[mod.id] || [];

          return (
            <Link key={mod.id} to={mod.path} className="block">
              <MotionBox
                type="card"
                variant="medium"
                className="h-full p-5 rounded-2xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:shadow-xl transition-all duration-300 hover:-translate-y-1 active:scale-[0.98] flex flex-col relative overflow-hidden"
                animation={{
                  declenchees: [{ trigger: 'hover', animation: 'liftHover' }],
                }}
              >
                <div className="flex items-start justify-between mb-3">
                  <div className="p-3 rounded-xl bg-[var(--color-primary-light)] text-[var(--color-primary)]">
                    <Icon size={28} strokeWidth={1.8} />
                  </div>
                  {childMods.length > 0 && (
                    <span className="text-xs font-medium px-2.5 py-1 rounded-full bg-[var(--color-primary)] text-white">
                      +{childMods.length}
                    </span>
                  )}
                </div>

                <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
                  {mod.label}
                </h3>
                <p className="text-sm text-[var(--color-textSecondary)] mt-1 flex-1">
                  {mod.description || 'Gestion du module'}
                </p>

                {/* Sous-modules */}
                {childMods.length > 0 && (
                  <div className="mt-3 pt-3 border-t border-[var(--color-borderColor)] space-y-1">
                    {childMods.slice(0, 3).map((child) => {
                      const ChildIcon = getSubModuleIcon(child.id);
                      return (
                        <div key={child.id} className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-primary)] transition">
                          <ChildIcon size={14} />
                          <span className="truncate">{child.label}</span>
                        </div>
                      );
                    })}
                    {childMods.length > 3 && (
                      <div className="text-xs text-[var(--color-textSecondary)]">
                        + {childMods.length - 3} autres...
                      </div>
                    )}
                  </div>
                )}

                <div className="mt-4 flex items-center gap-1 text-sm font-medium text-[var(--color-primary)]">
                  Accéder
                  <svg className="w-4 h-4 transition-transform group-hover:translate-x-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 5l7 7-7 7" />
                  </svg>
                </div>
              </MotionBox>
            </Link>
          );
        })}
      </div>

      {/* Message si aucun module */}
      {parentModules.length === 0 && (
        <div className="text-center p-12 text-[var(--color-textSecondary)]">
          <p>Aucun module de gestion disponible pour votre rôle.</p>
          <p className="text-sm mt-2">Contactez l'administrateur pour obtenir les droits nécessaires.</p>
        </div>
      )}
    </div>
  );
};

export default ManagementRoot;
