// ============================================================
// NAVBAR MINIMAL — Style minimaliste (sans labels)
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { motion } from 'framer-motion';
import * as Icons from 'lucide-react';
import type { LucideIcon } from 'lucide-react';
import type { NavItem } from '../../../types/navigation';

interface NavbarMinimalProps {
  items: NavItem[];
  onItemClick?: (item: NavItem) => void;
  className?: string;
}

function resolveIcon(nom: string): LucideIcon {
  const icon = (Icons as unknown as Record<string, LucideIcon>)[nom];
  return icon ?? Icons.Circle;
}

export const NavbarMinimal: React.FC<NavbarMinimalProps> = ({
  items,
  onItemClick,
  className = '',
}) => {
  return (
    <nav className={`fixed bottom-0 left-0 right-0 z-50 bg-white border-t border-gray-100 py-2 ${className}`}>
      <div className="flex justify-around items-center h-12 max-w-md mx-auto px-2">
        {items.map((item) => {
          const Icon = resolveIcon(item.icone);
          const isActive = window.location.pathname === item.path;
          const hasBadge = (item.badgeCount ?? 0) > 0;

          return (
            <button
              key={item.id}
              onClick={() => onItemClick?.(item)}
              className="flex flex-col items-center justify-center min-w-[48px]"
            >
              <div className="relative">
                <Icon
                  size={26}
                  color={isActive ? '#1E3A5F' : '#ADB5BD'}
                  strokeWidth={isActive ? 2.5 : 2}
                />
                {hasBadge && (
                  <span className="absolute -top-1 -right-2 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-red-500 rounded-full flex items-center justify-center">
                    {item.badgeCount}
                  </span>
                )}
              </div>
              {isActive && (
                <motion.div
                  layoutId="minimal-indicator"
                  transition={{ type: 'spring', stiffness: 350, damping: 30 }}
                  className="mt-1 w-1 h-1 rounded-full bg-primary-500"
                />
              )}
            </button>
          );
        })}
      </div>
    </nav>
  );
};

export default NavbarMinimal;
