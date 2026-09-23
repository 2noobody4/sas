import React from 'react';
import { Link, useLocation } from 'react-router-dom';
import { motion } from 'framer-motion';
import { resolveLucideIcon } from '../registres/lucideRegistry';
import { NavItem } from '../types/navigation';
import { NAVBAR_REGISTRY } from '../registres/navbarRegistry';

interface NavbarBaseProps {
  items: NavItem[];
  styleDef: any;
  className?: string;
  onItemClick?: (item: NavItem) => void;
}

const NavbarBase: React.FC<NavbarBaseProps> = ({
  items,
  styleDef,
  className = '',
  onItemClick,
}) => {
  const location = useLocation();

  if (items.length === 0) return null;

  const containerStyle: React.CSSProperties = {
    backgroundColor: 'var(--color-cardBg)',
    borderTop: '1px solid var(--color-borderColor)',
    boxShadow: '0 -2px 8px rgba(0,0,0,0.05)',
    zIndex: 50, // 🔧 priorité élevée
    ...styleDef.containerStyle,
  };

  return (
    <nav
      className={`fixed bottom-0 left-0 right-0 ${className}`}
      style={containerStyle}
    >
      <div className="flex items-center justify-around max-w-7xl mx-auto px-2 h-16">
        {items.map((item) => {
          const isActive = location.pathname === item.path ||
            (item.path !== '/' && location.pathname.startsWith(item.path));

          const Icon = resolveLucideIcon(item.icone);
          const iconColor = isActive ? 'var(--color-primary)' : 'var(--color-textSecondary)';
          const labelColor = isActive ? 'var(--color-primary)' : 'var(--color-textSecondary)';

          return (
            <Link
              key={item.id}
              to={item.path}
              onClick={() => onItemClick?.(item)}
              className="flex flex-col items-center justify-center relative py-1 px-3 min-w-[56px] transition-all active:scale-95 focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)] focus:ring-opacity-50 rounded-lg"
            >
              {/* Indicateur actif */}
              {isActive && (
                <motion.div
                  layoutId="navbar-indicator"
                  className="absolute -top-0.5 w-8 h-0.5 rounded-full"
                  style={{ backgroundColor: 'var(--color-primary)' }}
                  transition={{ type: 'spring', stiffness: 400, damping: 25 }}
                />
              )}

              {/* Icône avec animation au tap */}
              <div className="relative">
                <motion.div
                  whileTap={{ scale: 0.85 }}
                  transition={{ type: 'spring', stiffness: 400, damping: 20 }}
                  className="p-1 rounded-full hover:bg-[var(--color-primary)]/10 transition-colors"
                >
                  <Icon
                    size={24}
                    strokeWidth={isActive ? 2.5 : 2}
                    color={iconColor}
                    className="transition-colors duration-200"
                  />
                </motion.div>

              </div>

              {/* Label */}
              <span
                className={`text-[10px] mt-0.5 font-medium transition-colors duration-200 ${
                  isActive ? '' : 'opacity-70'
                }`}
                style={{ color: labelColor }}
              >
                {item.label}
              </span>
            </Link>
          );
        })}
      </div>
    </nav>
  );
};

export const NavbarClassic: React.FC<Omit<NavbarBaseProps, 'styleDef'>> = (props) => (
  <NavbarBase {...props} styleDef={NAVBAR_REGISTRY.classic} />
);

export const NavbarDark: React.FC<Omit<NavbarBaseProps, 'styleDef'>> = (props) => (
  <NavbarBase {...props} styleDef={NAVBAR_REGISTRY.dark} className="border-t border-gray-800" />
);

export const NavbarFloating: React.FC<Omit<NavbarBaseProps, 'styleDef'>> = (props) => (
  <NavbarBase {...props} styleDef={NAVBAR_REGISTRY.floating} className="mx-4 mb-3 rounded-2xl" />
);

export const NavbarMinimal: React.FC<Omit<NavbarBaseProps, 'styleDef'>> = (props) => (
  <NavbarBase {...props} styleDef={NAVBAR_REGISTRY.minimal} className="border-t border-gray-100" />
);

export const NavbarGradient: React.FC<Omit<NavbarBaseProps, 'styleDef'>> = (props) => (
  <NavbarBase {...props} styleDef={NAVBAR_REGISTRY.gradient} className="border-none shadow-lg" />
);

export const NavbarGlass: React.FC<Omit<NavbarBaseProps, 'styleDef'>> = (props) => (
  <NavbarBase {...props} styleDef={NAVBAR_REGISTRY.glass} className="border-t border-white/20" />
);

export const NAVBAR_STYLES_MAP = {
  classic: NavbarClassic,
  dark: NavbarDark,
  floating: NavbarFloating,
  minimal: NavbarMinimal,
  gradient: NavbarGradient,
  glass: NavbarGlass,
};

export type NavbarStyleKey = keyof typeof NAVBAR_STYLES_MAP;
