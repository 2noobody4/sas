// ============================================================
// NAVBAR DARK — Style sombre
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavItem } from '../../../types/navigation';

interface NavbarDarkProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
  className?: string;
}

function resolveIcon(nom: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[nom];
  return icon ?? Icons.Circle;
}

export const NavbarDark: React.FC<NavbarDarkProps> = ({
  items,
  onItemClick,
  className = '',
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-gray-900 border-t border-gray-800 ${className}`}>
      <div className="flex justify-around items-center h-16 max-w-md mx-auto px-2">
        {items.map((item) => {
          const Icon = resolveIcon(item.icone);
          const isActive = window.location.pathname === item.path;
          const hasBadge = (item.badgeCount ?? 0) > 0;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="flex flex-col items-center justify-center gap-0.5 min-w-[48px]"
            >
              <div className="relative">
                <Icon
                  size={24}
                  color={isActive ? '#E8A33D' : '#6B6B8A'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {hasBadge && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {item.badgeCount}
                  </span>
                )}
              </div>
              <span className={`text-[10px] ${isActive ? 'text-accent-500 font-semibold' : 'text-gray-500'}`}>
                {item.label}
              </span>
              {isActive && (
                <motion.div
                  layoutId="dark-indicator"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="w-5 h-0.5 rounded-full bg-accent-500"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavbarDark;
