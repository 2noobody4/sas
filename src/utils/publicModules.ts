// ============================================================
// PUBLIC MODULES — Modules visibles pour tous
// Version V3 — Compatible React 16
// ============================================================

import { MODULES_REGISTRY } from '../registres/modulesRegistry';
import type { ModuleDefinition } from '../registres/modulesTypes';

export const PUBLIC_MODULE_IDS: string[] = [
  'home',
  'boutique',
  'services-public',
  'panier',
  'dashboard',
  'debug',
  'forgot-password',
  'reset-password',
];

export function isPublicModule(moduleId: string): boolean {
  return PUBLIC_MODULE_IDS.includes(moduleId);
}

export function getPublicModules(): ModuleDefinition[] {
  return MODULES_REGISTRY.filter((m) => PUBLIC_MODULE_IDS.includes(m.id));
}
