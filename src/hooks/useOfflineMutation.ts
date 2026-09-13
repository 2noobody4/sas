import { useMutation, UseMutationOptions, UseMutationResult } from 'react-query';
import { useOffline } from '../contexts/OfflineContext';

export function useOfflineMutation<TData, TVariables>(
  options: UseMutationOptions<TData, Error, TVariables>,
  endpoint: string,
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH' = 'POST'
): UseMutationResult<TData, Error, TVariables> {
  const { isOnline, addToQueue } = useOffline();

  return useMutation({
    ...options,
    mutationFn: async (variables: TVariables) => {
      if (!isOnline) {
        const headers = (options as any).context?.headers || {};
        addToQueue({ url: endpoint, method, body: variables, headers });
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
