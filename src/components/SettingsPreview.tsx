import React from 'react';
import { MotionBox } from './MotionBox';
import { useConfig } from '../contexts/ConfigContext';
import { Search, Bell, User, ShoppingCart, Menu } from 'lucide-react';

export const SettingsPreview: React.FC = () => {
  const config = useConfig();

  if (!config.loaded) return null;

  const appName = config.storeName || 'App';
  const logoUrl = config.logo_url;
  const navBg = config.nav_background_color || '#FFFFFF';

  return (
    <MotionBox
      as="div"
      type="settings"
      variant="preview"
      className="p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
      animation={{
        animationInitiale: 'fadeIn',
      }}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          {logoUrl && (
            <img src={logoUrl} alt="Logo" className="h-8 w-auto" />
          )}
          <span className="font-bold text-lg text-[var(--color-textPrimary)]">
            {appName}
          </span>
        </div>
        <div className="flex items-center gap-3 text-[var(--color-textSecondary)]">
          <Search size={18} />
          <ShoppingCart size={18} />
          <Bell size={18} />
          <User size={18} />
          <Menu size={18} />
        </div>
      </div>

      {/* Mini navbar */}
      <div
        className="mt-3 flex items-center justify-around rounded-lg p-2"
        style={{ backgroundColor: navBg, border: '1px solid var(--color-borderColor)' }}
      >
        <span className="text-xs font-medium text-[var(--color-textPrimary)]">Accueil</span>
        <span className="text-xs font-medium text-[var(--color-textPrimary)]">Produits</span>
        <span className="text-xs font-medium text-[var(--color-textPrimary)]">Caisse</span>
        <span className="text-xs font-medium text-[var(--color-textPrimary)]">Clients</span>
        <span className="text-xs font-medium text-[var(--color-textPrimary)]">Profil</span>
      </div>
      <p className="text-xs mt-2 text-[var(--color-textSecondary)]">
        Aperçu en direct du header et de la navigation
      </p>
    </MotionBox>
  );
};
