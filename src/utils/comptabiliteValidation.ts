/**
 * comptabiliteValidation – Garde-fous partagés pour les écritures comptables.
 * ------------------------------------------------------------
 * 🔧 Bug corrigé : aucune vérification n'existait pour empêcher de créer
 * une écriture avec le même compte en débit et en crédit (ce qui n'a
 * aucun sens comptable — le mouvement s'annule lui-même). Ce contrôle
 * était absent de TOUS les points d'insertion (useCreateTransaction,
 * useUpdateTransaction, et les 6 hooks de useComptabilisation.ts), ce
 * qui laissait passer ce genre d'écriture sans erreur.
 *
 * On centralise le contrôle ici pour qu'il soit appliqué une seule fois,
 * de façon identique, partout où une transaction comptable est créée
 * ou mise à jour.
 */

export const assertComptesDistincts = (
  compteDebitId?: string | null,
  compteCreditId?: string | null
): void => {
  if (compteDebitId && compteCreditId && compteDebitId === compteCreditId) {
    throw new Error(
      'Le compte débit et le compte crédit doivent être différents'
    );
  }
};
