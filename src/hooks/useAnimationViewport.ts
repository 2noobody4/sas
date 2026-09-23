// ============================================================
// USE ANIMATION VIEWPORT — Hauteur fixe pour 4 items visibles
// Version V3 — Compatible React 16
// ============================================================

/**
 * Calcule la hauteur totale de 4 items dans une grille de N colonnes,
 * avec gaps, pour limiter le container à 4 items visibles + scroll.
 *
 * @param columns Nombre de colonnes de la grille (2, 3 ou 4)
 * @returns Hauteur CSS en pixels
 */
export const useAnimationViewport = (columns: number = 3) => {
  const ITEM_HEIGHT = 64;    // hauteur approximative d'un item (px)
  const GAP = 8;             // gap entre items (px)
  const ROWS_VISIBLE = 4;    // nombre de lignes visibles (une ligne = N colonnes)

  // On veut 4 ITEMS visibles au total, pas 4 lignes
  const rowsNeeded = Math.ceil(ROWS_VISIBLE / columns);
  const totalHeight = rowsNeeded * ITEM_HEIGHT + (rowsNeeded - 1) * GAP;

  return {
    maxHeight: `${totalHeight}px`,
    overflowY: 'auto' as const,
  };
};

export default useAnimationViewport;
