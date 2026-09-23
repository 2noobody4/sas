// ============================================================
// Annulation d'une transaction comptable liée à une référence
// Compatible avec le schéma réel (pas de colonne annulee)
//
// 🔧 Correction : cette fonction ne connaissait que
// transactions_comptables (moteur 2 comptes). Une référence peut
// désormais aussi correspondre à une écriture du nouveau moteur
// multi-lignes (ecritures / ecritures_lignes) — elle est maintenant
// annulée elle aussi, via la RPC SQL annuler_ecritures_par_reference
// (contre-passation des soldes + suppression, atomique côté serveur).
// ============================================================

import { supabase } from '../lib/supabaseClient';

/**
 * Annule toutes les transactions ET écritures liées à une référence
 * donnée :
 *  - transactions_comptables (2 comptes) : contre-passe les soldes
 *    (débit/crédit inversés) puis supprime la transaction, comme avant.
 *  - ecritures / ecritures_lignes (multi-comptes) : idem, via la RPC
 *    annuler_ecritures_par_reference.
 */
export async function annulerTransactionsParReference(
  reference: string,
  types?: string[]
): Promise<void> {
  let query = supabase
    .from('transactions_comptables')
    .select('*')
    .eq('reference', reference);

  if (types && types.length > 0) {
    query = query.in('type', types);
  }

  const { data: transactions, error } = await query;
  if (error) throw error;

  if (transactions && transactions.length > 0) {
    for (const t of transactions) {
      // Contre-passer les soldes
      await supabase.rpc('update_compte_solde', {
        p_compte_id: t.compte_debit_id,
        p_montant: -t.montant,
        p_sens: 'debit',
      });
      await supabase.rpc('update_compte_solde', {
        p_compte_id: t.compte_credit_id,
        p_montant: -t.montant,
        p_sens: 'credit',
      });
    }

    // Supprimer les transactions
    const ids = transactions.map((t: any) => t.id);
    const { error: deleteError } = await supabase
      .from('transactions_comptables')
      .delete()
      .in('id', ids);

    if (deleteError) throw deleteError;
  }

  // Écritures multi-lignes partageant la même référence (nouveau moteur).
  // NB : le filtre `types` ne s'applique qu'à transactions_comptables
  // ci-dessus ; ici toutes les écritures de cette référence sont annulées,
  // car une écriture multi-lignes n'a qu'un seul `type` global (pas de
  // notion de sous-type par ligne).
  const { error: ecrituresError } = await supabase.rpc('annuler_ecritures_par_reference', {
    p_reference: reference,
  });
  if (ecrituresError) throw ecrituresError;
}
