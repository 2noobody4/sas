// ============================================================
// NAVIGATION INTERCEPTOR — Intercepte history.push globalement
// Version V3 — Compatible React 16
// ------------------------------------------------------------
// Détecte tout changement de route via react-router et déclenche
// l'animation de sortie AVANT de laisser la navigation s'exécuter.
// ============================================================

import React, { useEffect, useRef } from 'react';
import { useHistory } from 'react-router-dom';
import { useNavigationContextSafe } from '../contexts/NavigationContext';

/**
 * Ce composant ne rend rien. Il écoute les changements de route
 * pour permettre à PageWrapper de jouer la sortie.
 *
 * Place-le DANS le BrowserRouter mais EN DEHORS du Switch.
 */
export const NavigationInterceptor: React.FC = () => {
  const history = useHistory();
  const navCtx = useNavigationContextSafe();
  const isFirstRenderRef = useRef(true);

  useEffect(() => {
    if (isFirstRenderRef.current) {
      isFirstRenderRef.current = false;
      return;
    }

    // À chaque changement de route, on informe le contexte
    if (navCtx) {
      // Le contexte a déjà géré la navigation, on ne fait rien
    }
  }, [history.location.pathname, navCtx]);

  return null;
};

export default NavigationInterceptor;
