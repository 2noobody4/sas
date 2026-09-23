import { useState, useEffect, useMemo } from 'react';
import { useLocation } from 'react-router-dom';
import { NavItem } from '../types/navigation';
import { NavbarStyleKey } from '../components/navbarStyles';

export interface UseNavbarProps {
  style: NavbarStyleKey;
  items?: NavItem[];
  role?: string;
}

export const NAVBAR_STYLES_AVAILABLE = [
  { id: 'classic', nom: 'Classique' },
  { id: 'dark', nom: 'Sombre' },
  { id: 'floating', nom: 'Flottant' },
  { id: 'minimal', nom: 'Minimaliste' },
  { id: 'gradient', nom: 'Dégradé' },
  { id: 'glass', nom: 'Verre' },
];

export const useNavbar = ({
  style: initialStyle = 'classic',
  items = [],
  role = 'client',
}: UseNavbarProps) => {
  const [style, setStyle] = useState<NavbarStyleKey>(initialStyle);
  const location = useLocation();

  // Synchroniser l'état avec la prop initialStyle quand elle change
  useEffect(() => {
    setStyle(initialStyle);
  }, [initialStyle]);

  const visibleItems = useMemo(() => {
    return items.filter(item => {
      if (!item.visible) return false;
      if (item.roles && !item.roles.includes(role)) return false;
      return true;
    }).sort((a, b) => a.ordre - b.ordre);
  }, [items, role]);

  return {
    style,
    setStyle,
    activePath: location.pathname,
    visibleItems,
    availableStyles: NAVBAR_STYLES_AVAILABLE,
  };
};

export default useNavbar;
