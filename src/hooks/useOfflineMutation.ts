import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import { useOffline, SupabaseQueueAction } from '../contexts/OfflineContext';

/**
 * 🔧 Correction : l'app n'a pas de vrai backend derrière `/api/...` (elle
 * parle directement à Supabase). Une action mise en file hors-ligne était
 * donc rejouée au retour du réseau par un `fetch('/api/...')` qui échoue
 * systématiquement (aucune route ne répond) — l'action était perdue en
 * silence après épuisement des tentatives.
 *
 * Le 4e paramètre `supabaseAction` est optionnel et rétrocompatible :
 *  - Si fourni, l'action mise en file est rejouée directement via le
 *    client Supabase (insert/update/delete/rpc) au lieu de fetch().
 *  - S'il est omis, le comportement est identique à avant (fetch vers
 *    `endpoint`) — aucun appelant existant n'est impacté par ce changement.
 *
 * Peut être une valeur fixe ou une fonction des variables de la mutation,
 * pour construire l'action à partir des paramètres réels (ex: l'id créé
 * n'est connu qu'à l'exécution — voir useEcritureMultiligne.ts).
 */
export function useOfflineMutation<TData, TVariables>(
  options: UseMutationOptions<TData, Error, TVariables>,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST',
  supabaseAction?: SupabaseQueueAction | ((variables: TVariables) => SupabaseQueueAction)
): UseMutationResult<TData, Error, TVariables> {
  const { isOnline, addToQueue } = useOffline();

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!isOnline) {
        const headers = (options as any).context?.headers || {};
        const resolvedAction =
          typeof supabaseAction === 'function'
            ? (supabaseAction as (v: TVariables) => SupabaseQueueAction)(variables)
            : supabaseAction;
        addToQueue({
          url: endpoint,
          method,
          body: variables,
          headers,
          supabaseAction: resolvedAction,
        });
        return { offline: true, queued: true } as TData;
      }
      return await options.mutationFn?.(variables) as TData;
    },
    onSuccess: (data, variables, context) => {
      if ((data as any)?.offline) {
        // Ne pas appeler onSuccess original car l'action est en file
      } else {
        options.onSuccess?.(data, variables, context);
      }
    },
    onError: (error, variables, context) => {
      options.onError?.(error, variables, context);
    },
  });
}
