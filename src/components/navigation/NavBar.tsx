// ============================================================
// NAVBAR — Composant de navigation (items)
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveLucideIcon } from '../../registres/lucideRegistry';
import { NavItem } from '../../types/navigation';

export interface NavBarProps {
  /** Items de navigation */
  items: NavItem[];
  /** Orientation : horizontal (bottom) ou vertical (sidebar) */
  orientation?: 'horizontal' | 'vertical';
  /** Style (classic, dark, etc.) */
  styleVariant?: string;
  /** Callback au clic sur un item */
  onItemClick?: (item: NavItem) => void;
  /** Classe CSS additionnelle */
  className?: string;
}

export const NavBar: React.FC<NavBarProps> = ({
  items,
  orientation = 'horizontal',
  styleVariant = 'classic',
  onItemClick,
  className = '',
}) => {
  const location = useLocation();

  if (items.length === 0) return null;

  const isHorizontal = orientation === 'horizontal';

  // Couleurs selon le style (à étendre)
  const getColors = () => {
    const variants: Record<string, { bg: string; active: string; inactive: string }> = {
      classic: { bg: 'var(--color-cardBg)', active: 'var(--color-primary)', inactive: 'var(--color-textSecondary)' },
      dark: { bg: '#1A1A2E', active: '#E8A33D', inactive: '#6B6B8A' },
      gradient: { bg: 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)', active: '#FFFFFF', inactive: 'rgba(255,255,255,0.6)' },
    };
    return variants[styleVariant] || variants.classic;
  };

  const colors = getColors();

  return (
    <nav
      className={`flex ${isHorizontal ? 'flex-row' : 'flex-col'} items-center justify-around h-full w-full ${className}`}
      style={{ backgroundColor: colors.bg }}
    >
      {items.map((item) => {
        const isActive = location.pathname === item.path ||
          (item.path !== '/' && location.pathname.startsWith(item.path));

        const Icon = resolveLucideIcon(item.icone);
        const iconColor = isActive ? colors.active : colors.inactive;
        const labelColor = isActive ? colors.active : colors.inactive;

        return (
          <Link
            key={item.id}
            to={item.path}
            onClick={() => onItemClick?.(item)}
            className={`flex ${isHorizontal ? 'flex-col' : 'flex-row items-center gap-3'} items-center justify-center relative py-2 px-3 min-w-[56px] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 rounded-lg`}
          >
            {isActive && (
              <motion.div
                layoutId="navbar-indicator"
                className={`absolute ${isHorizontal ? '-top-0.5 w-8 h-0.5' : '-left-0.5 h-8 w-0.5'} rounded-full`}
                style={{ backgroundColor: colors.active }}
                transition={{ type: 'spring', stiffness: 400, damping: 25 }}
              />
            )}

            <div className="relative">
              <motion.div
                whileTap={{ scale: 0.85 }}
                transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                className="p-1 rounded-full hover:bg-white/10 transition-colors"
              >
                <Icon
                  size={isHorizontal ? 24 : 20}
                  strokeWidth={isActive ? 2.5 : 2}
                  color={iconColor}
                  className="transition-colors duration-200"
                />
              </motion.div>

            </div>

            <span
              className={`${isHorizontal ? 'text-[10px] mt-0.5' : 'text-sm'} font-medium transition-colors duration-200 ${
                isActive ? '' : 'opacity-70'
              }`}
              style={{ color: labelColor }}
            >
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
};

export default NavBar;
