import { QueryClient } from 'react-query';
import localforage from 'localforage';

const CACHE_KEY = 'react_query_cache';

export const persister = {
  async save(queryClient: QueryClient) {
    try {
      const state = queryClient.getQueryCache().getAll();
      const data = state.map(query => ({
        queryKey: query.queryKey,
        state: {
          data: query.state.data,
          dataUpdateCount: query.state.dataUpdateCount,
          error: query.state.error,
          errorUpdateCount: query.state.errorUpdateCount,
          isInvalidated: query.state.isInvalidated,
          status: query.state.status,
        },
      }));
      await localforage.setItem(CACHE_KEY, data);
    } catch (error) {
      console.error('[Persister] Erreur de sauvegarde:', error);
    }
  },

  async load(queryClient: QueryClient) {
    try {
      const data = await localforage.getItem<any[]>(CACHE_KEY);
      if (!data) return;
      
      data.forEach(item => {
        queryClient.setQueryData(item.queryKey, item.state.data);
      });
    } catch (error) {
      console.error('[Persister] Erreur de chargement:', error);
    }
  },

  async remove() {
    try {
      await localforage.removeItem(CACHE_KEY);
    } catch (error) {
      console.error('[Persister] Erreur de suppression:', error);
    }
  },
};

export const saveCache = (queryClient: QueryClient) => {
  return persister.save(queryClient);
};

export const loadCache = (queryClient: QueryClient) => {
  return persister.load(queryClient);
};
