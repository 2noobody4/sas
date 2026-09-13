import { useState, useEffect } from 'react';
import { HeaderStyleKey } from '../styles';
import { getHeaderStyles } from '../registres/headerRegistry';

interface UseHeaderProps {
  style: HeaderStyleKey;
}

export const useHeader = ({ style: initialStyle }: UseHeaderProps) => {
  const [style, setStyle] = useState<HeaderStyleKey>(initialStyle);

  // Synchroniser l'état avec la prop initialStyle quand elle change
  useEffect(() => {
    setStyle(initialStyle);
  }, [initialStyle]);

  const availableStyles = getHeaderStyles().map(s => ({
    id: s.id,
    nom: s.nom,
  }));

  return {
    style,
    setStyle,
    availableStyles,
  };
};

export default useHeader;
