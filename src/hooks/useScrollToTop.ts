/**
 * useScrollToTop – Hook pour remonter en haut de la page lors du changement de route
 * Compatible React 16.14
 */

import { useEffect } from 'react';
import { useLocation } from 'react-router-dom';

export const useScrollToTop = () => {
  const { pathname } = useLocation();

  useEffect(() => {
    window.scrollTo({
      top: 0,
      left: 0,
      behavior: 'smooth',
    });
  }, [pathname]);
};

export default useScrollToTop;
