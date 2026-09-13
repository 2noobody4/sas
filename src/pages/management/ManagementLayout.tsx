import React, { useState } from 'react';
import { Switch, Route, useRouteMatch } from 'react-router-dom';
import { HeaderWrapper } from '../../components/header/HeaderWrapper';
import { Sidebar } from '../../components/layout/Sidebar';
import { NavbarWrapper } from '../../components/navigation/NavbarWrapper';
import { NavBar } from '../../components/navigation/NavBar';
import { Header } from '../../components/layout/Header';
import { useAuth } from '../../hooks/useAuth';
import type { NavItem } from '../../types/navigation';
import { MotionBox } from '../../components/ui/MotionBox';

// Import des pages
import { StocksPage } from '../stocks/StocksPage';
import { CaissePage } from '../caisse/CaissePage';
import { ComptabilitePage } from '../comptabilite/ComptabilitePage';
import { RHPage } from '../rh/RHPage';
import { ClientsPage } from '../clients/ClientsPage';
import { DemandesPage } from '../demandes/DemandesPage';
import { AnalyticsPage } from '../analytics/AnalyticsPage';

// Icônes pour la sidebar
import { 
  Package, Coins, Receipt, Users, User, 
  ClipboardList, BarChart, LayoutDashboard,
  Palette, Film 
} from 'lucide-react';

export interface ManagementLayoutProps {
  pageTitle?: string;
  logo?: React.ReactNode;
  /** Items de la bottom navigation (optionnel) */
  navItems?: NavItem[];
  /** Style de la navbar (optionnel) */
  navbarStyle?: 'classic' | 'dark' | 'floating' | 'minimal' | 'gradient' | 'glass';
  /** Afficher le sélecteur de style (optionnel) */
  showStyleSelector?: boolean;
  /** Contenu enfants (optionnel) */
  children?: React.ReactNode;
}

// Configuration des items de la sidebar
const sidebarItems = [
  { id: 'dashboard', label: 'Tableau de bord', icon: LayoutDashboard, path: '/gestion' },
  { id: 'stocks', label: 'Stocks', icon: Package, path: '/gestion/stocks' },
  { id: 'caisse', label: 'Caisse', icon: Coins, path: '/gestion/caisse' },
  { id: 'comptabilite', label: 'Comptabilité', icon: Receipt, path: '/gestion/comptabilite' },
  { id: 'rh', label: 'RH', icon: Users, path: '/gestion/rh' },
  { id: 'clients', label: 'Clients', icon: User, path: '/gestion/clients' },
  { id: 'demandes', label: 'Demandes', icon: ClipboardList, path: '/gestion/demandes' },
  { id: 'analytics', label: 'Analytics', icon: BarChart, path: '/gestion/analytics' },
  { id: 'theme', label: 'Thème', icon: Palette, path: '/gestion/theme' },
  { id: 'animations', label: 'Animations', icon: Film, path: '/gestion/animations' },
];

// Conversion en format SidebarItem
const sidebarItemsFormatted = sidebarItems.map(item => ({
  ...item,
  icon: <item.icon size={20} />,
  roles: ['admin', 'gestionnaire'],
}));

export const ManagementLayout: React.FC<ManagementLayoutProps> = ({
  pageTitle = 'Gestion',
  logo,
  navItems = [],
  navbarStyle = 'classic',
  showStyleSelector = false,
  children,
}) => {
  const { user } = useAuth();
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const role = user?.role?.nom || 'admin';
  const { path } = useRouteMatch();

  return (
    <MotionBox
      as="div"
      type="page"
      variant="management"
      usageId="management-layout"
      page="ManagementLayout"
      parentLevel={0}
      isChildren={false}
      className="min-h-screen bg-gray-50"
    >
      <HeaderWrapper>
        <Header
          title={pageTitle}
          logo={logo}
          showMenu={true}
          onMenuClick={() => setIsSidebarOpen(true)}
          showNotifications={true}
        />
      </HeaderWrapper>

      <Sidebar
        items={sidebarItemsFormatted}
        isOpen={isSidebarOpen}
        onClose={() => setIsSidebarOpen(false)}
        role={role}
        title={pageTitle}
        logo={logo}
      />

      <main className="pt-16 pb-20">
        <div className="max-w-7xl mx-auto px-4 py-6">
          {children ? (
            children
          ) : (
            <Switch>
              <Route exact path={`${path}`}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">📊 Tableau de bord</h1>
                  <p className="text-gray-500 mt-2">Bienvenue dans l'espace de gestion.</p>
                  <div className="mt-6 grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-500">Produits</p>
                      <p className="text-2xl font-bold">156</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-500">Ventes aujourd'hui</p>
                      <p className="text-2xl font-bold">12</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-500">Clients</p>
                      <p className="text-2xl font-bold">89</p>
                    </div>
                    <div className="bg-white p-4 rounded-xl shadow-sm border border-gray-200">
                      <p className="text-sm text-gray-500">CA mensuel</p>
                      <p className="text-2xl font-bold">12 450 €</p>
                    </div>
                  </div>
                </div>
              </Route>
              <Route path={`${path}/stocks`} component={StocksPage} />
              <Route path={`${path}/caisse`} component={CaissePage} />
              <Route path={`${path}/comptabilite`} component={ComptabilitePage} />
              <Route path={`${path}/rh`} component={RHPage} />
              <Route path={`${path}/clients`} component={ClientsPage} />
              <Route path={`${path}/demandes`} component={DemandesPage} />
              <Route path={`${path}/analytics`} component={AnalyticsPage} />
              <Route path={`${path}/theme`}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">🎨 Éditeur de thème</h1>
                  <p className="text-gray-500 mt-2">Personnalisez l'apparence de l'application.</p>
                </div>
              </Route>
              <Route path={`${path}/animations`}>
                <div className="p-6">
                  <h1 className="text-2xl font-bold">🎬 Éditeur d'animations</h1>
                  <p className="text-gray-500 mt-2">Configurez les animations de l'application.</p>
                </div>
              </Route>
            </Switch>
          )}
        </div>
      </main>

      {navItems.length > 0 && (
        <NavbarWrapper position="bottom" size={64}>
          <NavBar items={navItems} orientation="horizontal" styleVariant={navbarStyle} />
        </NavbarWrapper>
      )}
    </MotionBox>
  );
};

export default ManagementLayout;
