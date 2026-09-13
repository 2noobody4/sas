/**
 * componentRegistry.ts – Point d'entrée
 * Importe et ré-exporte depuis les 3 parties
 */

// ============================================================
// IMPORTS DEPUIS LES 3 PARTIES
// ============================================================

import { COMPONENT_REGISTRY as _COMPONENT_REGISTRY } from './componentRegistry_part1';
import { COMPONENT_CATEGORIES as _COMPONENT_CATEGORIES } from './componentRegistry_part2';
import {
  getComponentCategories as _getComponentCategories,
  getComponentsByCategory as _getComponentsByCategory,
  getComponentLabel as _getComponentLabel,
} from './componentRegistry_part3';

// ============================================================
// EXPORTS NOMÉS
// ============================================================

export const COMPONENT_REGISTRY = _COMPONENT_REGISTRY;
export const COMPONENT_CATEGORIES = _COMPONENT_CATEGORIES;
export const getComponentCategories = _getComponentCategories;
export const getComponentsByCategory = _getComponentsByCategory;
export const getComponentLabel = _getComponentLabel;

// Ré-exporter tout depuis la partie 3 (helpers)
export * from './componentRegistry_part3';

// ============================================================
// EXPORT PAR DÉFAUT (UN SEUL)
// ============================================================

const registry = {
  COMPONENT_REGISTRY: _COMPONENT_REGISTRY,
  COMPONENT_CATEGORIES: _COMPONENT_CATEGORIES,
  getComponentCategories: _getComponentCategories,
  getComponentsByCategory: _getComponentsByCategory,
  getComponentLabel: _getComponentLabel,
};

export default registry;
