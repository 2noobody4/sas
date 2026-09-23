/**
 * Helpers de dates pour les filtres de periode Supabase.
 *
 * Une date "YYYY-MM-DD" comparee a une colonne timestamp vaut minuit :
 * `.lte('date_transaction', '2026-09-20')` exclut donc tout ce qui a ete
 * saisi le 20 septembre apres 00:00. On etend la borne de fin a 23:59:59.999.
 */
export const finDeJournee = (d: string): string =>
  /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${d}T23:59:59.999` : d;
