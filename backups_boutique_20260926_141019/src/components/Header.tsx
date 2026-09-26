import React from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from './MotionBox';
import { OfflineQueueIndicator } from './OfflineQueueIndicator';
import { NotificationBell } from './NotificationBell';
import { SyncStatus } from './SyncStatus';
import { useAuth } from '../hooks/useAuth';
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
        <SyncStatus />
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
