#!/bin/bash
echo "🚀 Partie 2/4 : Registre MotionBox et Header"
mkdir -p src/registres
cat > src/registres/motionBoxUsages.ts << 'EOF3'
export interface MotionBoxUsage {
  id: string;
  type: string;
  variant?: string;
  page: string;
  parentLevel: number;
  isChildren: boolean;
  filePath?: string;
}
export const MOTIONBOX_USAGES: MotionBoxUsage[] = [
  { id: 'dashboard-root', type: 'page', variant: 'default', page: 'DashboardRoot', parentLevel: 0, isChildren: false, filePath: 'pages/Dashboard/DashboardRoot.tsx' },
  { id: 'home-root', type: 'page', variant: 'default', page: 'HomePage', parentLevel: 0, isChildren: false, filePath: 'pages/HomePage.tsx' },
  { id: 'login-root', type: 'card', variant: 'xlarge', page: 'LoginPage', parentLevel: 0, isChildren: false, filePath: 'pages/auth/LoginPage.tsx' },
  { id: 'register-root', type: 'card', variant: 'xlarge', page: 'RegisterPage', parentLevel: 0, isChildren: false, filePath: 'pages/auth/RegisterPage.tsx' },
  { id: 'stocks-page', type: 'page', variant: 'default', page: 'StocksPage', parentLevel: 0, isChildren: false, filePath: 'pages/stocks/StocksPage.tsx' },
  { id: 'header-root', type: 'box', variant: 'default', page: 'Header', parentLevel: 0, isChildren: false, filePath: 'components/layout/Header.tsx' },
  { id: 'navbar-root', type: 'navigation', variant: 'default', page: 'NavBar', parentLevel: 0, isChildren: false, filePath: 'components/navigation/NavBar.tsx' },
];
export function findMotionBoxUsage(id: string): MotionBoxUsage | undefined {
  return MOTIONBOX_USAGES.find(usage => usage.id === id);
}
export function getMotionBoxUsagesByPage(page: string): MotionBoxUsage[] {
  return MOTIONBOX_USAGES.filter(usage => usage.page === page);
}
EOF3

cat > src/components/layout/Header.tsx << 'EOF4'
import React from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../ui/MotionBox';
import { OfflineQueueIndicator } from '../ui/OfflineQueueIndicator';
import { NotificationBell } from '../ui/NotificationBell';
import { useAuth } from '../../hooks/useAuth';
import { LogOut, LogIn, Menu } from 'lucide-react';
export interface HeaderProps {
  title?: string;
  logo?: React.ReactNode;
  showMenu?: boolean;
  onMenuClick?: () => void;
  showNotifications?: boolean;
  userName?: string;
  className?: string;
  style?: React.CSSProperties;
  children?: React.ReactNode;
}
export const Header: React.FC<HeaderProps> = ({
  title = 'App PME',
  logo,
  showMenu = true,
  onMenuClick,
  showNotifications = true,
  className = '',
  style = {},
  children,
}) => {
  const { user, logout } = useAuth();
  const history = useHistory();
  const isAuthenticated = !!user;
  const handleLogout = async () => {
    await logout();
    history.push('/login');
  };
  const handleLogin = () => {
    history.push('/login');
  };
  return (
    <MotionBox
      as="header"
      type="box"
      variant="default"
      className={`w-full h-full px-4 flex items-center justify-between bg-[var(--color-cardBg)] border-b border-[var(--color-borderColor)] text-[var(--color-textPrimary)] ${className}`}
      style={{ proprietes: style as any }}
    >
      <div className="flex items-center gap-3">
        {showMenu && (
          <button
            onClick={onMenuClick}
            className="p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)] lg:hidden"
          >
            <Menu size={24} />
          </button>
        )}
        {logo && <div className="h-8">{logo}</div>}
        <span className="text-lg font-semibold">{title}</span>
      </div>
      <div className="flex items-center gap-2">
        {showNotifications && <NotificationBell />}
        <OfflineQueueIndicator />
        {isAuthenticated ? (
          <button
            onClick={handleLogout}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)] hover:text-[var(--color-danger)]"
            title="Déconnexion"
          >
            <LogOut size={18} />
            <span className="hidden sm:inline text-sm">Déconnexion</span>
          </button>
        ) : (
          <button
            onClick={handleLogin}
            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition"
          >
            <LogIn size={18} />
            <span className="hidden sm:inline text-sm">Connexion</span>
          </button>
        )}
        {children}
      </div>
    </MotionBox>
  );
};
export default Header;
EOF4
echo "✅ Partie 2 terminée."
