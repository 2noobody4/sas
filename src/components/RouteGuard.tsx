// ============================================================
// RouteGuard — Bloque le rendu d'une page si le rôle courant
// ne figure pas dans route.roles. Tant que roles est vide/undefined,
// la route reste ouverte à tous (comportement identique à avant).
// ============================================================

import React from 'react';
import type { ComponentType } from 'react';

interface RouteGuardProps {
  roles?: string[];
  currentRole: string;
  component: ComponentType<any>;
  routeProps: any;
}

export function RouteGuard({ roles, currentRole, component: Component, routeProps }: RouteGuardProps) {
  const isAllowed = !roles || roles.length === 0 || roles.includes(currentRole);

  if (!isAllowed) {
    return (
      <div className="p-6 text-center text-[var(--color-textSecondary)]">
        <p className="font-medium">Accès refusé</p>
        <p className="text-sm mt-1">
          Vous n'avez pas les droits nécessaires pour accéder à cette page.
        </p>
      </div>
    );
  }

  return <Component {...routeProps} />;
}
