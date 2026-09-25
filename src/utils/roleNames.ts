// ============================================================
// NORMALISATION DES NOMS DE RÔLES
// La table `roles` en base utilise des libellés français affichables
// ('Administrateur', 'Manager', 'Caissier', 'Comptable'...), alors que
// tout le code de permissions (mainModules.ts, otherModules.ts,
// RouteGuard.tsx, etc.) compare avec des clés internes en minuscules
// ('admin', 'gestionnaire', 'cashier', 'comptable', 'magasinier',
// 'employe', 'client', 'fournisseur').
//
// Cette fonction fait le pont entre les deux, à un seul endroit,
// pour que le reste de l'app n'ait jamais besoin de le savoir.
// ============================================================

/**
 * Cas où le libellé français ne correspond à aucune clé interne
 * simplement en le mettant en minuscule (mots différents).
 */
const ROLE_NAME_MAP: Record<string, string> = {
  administrateur: 'admin',
  manager: 'gestionnaire',
  caissier: 'cashier',
};

/** Retire les accents ('é' -> 'e', etc.) pour une comparaison fiable. */
function stripAccents(value: string): string {
  return value.normalize('NFD').replace(/[̀-ͯ]/g, '');
}

/**
 * Convertit un nom de rôle tel que stocké en base (ex: 'Administrateur',
 * 'Manager', 'Comptable') en la clé interne utilisée pour les
 * vérifications de permissions dans le code (ex: 'admin', 'gestionnaire',
 * 'comptable'). Les clés déjà en minuscule et sans accent (ex:
 * 'comptable', 'client') passent inchangées.
 */
export function normalizeRoleName(nom: string | null | undefined): string {
  if (!nom) return 'client';
  const cleaned = stripAccents(nom.trim().toLowerCase());
  return ROLE_NAME_MAP[cleaned] || cleaned;
}
