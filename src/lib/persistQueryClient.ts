import type { QueryClient } from 'react-query';

const STORAGE_KEY = 'app-pme-query-cache';
const MAX_SIZE_MB = 4; // Limite pour ne pas dépasser localStorage (5 MB)

type PersistedQueryState = {
  state?: {
    data?: unknown;
    dataUpdatedAt?: number;
    status?: string;
  };
  updatedAt?: number;
};

type PersistedCache = Record<string, PersistedQueryState>;

export function saveCache(queryClient: QueryClient): void {
  try {
    const cache = queryClient.getQueryCache().getAll();
    const serialized: PersistedCache = {};

    for (const query of cache) {
      const state = query.state;
      if (state.status !== 'success' || state.data === undefined) continue;

      // Sérialiser la clé en JSON (support clés simples ET complexes)
      let keyStr: string;
      try {
        keyStr = JSON.stringify(query.queryKey);
      } catch {
        continue;
      }
      if (keyStr.length > 500) continue; // clé trop longue

      serialized[keyStr] = {
        state: {
          data: state.data,
          dataUpdatedAt: state.dataUpdatedAt,
          status: state.status,
        },
        updatedAt: Date.now(),
      };
    }

    const json = JSON.stringify(serialized);
    const sizeMB = new Blob([json]).size / (1024 * 1024);

    if (sizeMB > MAX_SIZE_MB) {
      console.warn(`[persistQueryClient] Cache trop volumineux (${sizeMB.toFixed(2)} Mo), sauvegarde partielle`);
      // Sauvegarder seulement les 50 queries les plus récentes
      const entries = Object.entries(serialized)
        .sort((a, b) => (b[1].updatedAt || 0) - (a[1].updatedAt || 0))
        .slice(0, 50);
      localStorage.setItem(STORAGE_KEY, JSON.stringify(Object.fromEntries(entries)));
      return;
    }

    localStorage.setItem(STORAGE_KEY, json);
  } catch (e) {
    console.warn('[persistQueryClient] Erreur sauvegarde cache:', e);
  }
}

export function loadCache(queryClient: QueryClient): void {
  try {
    const cached = localStorage.getItem(STORAGE_KEY);
    if (!cached) return;

    const parsed = JSON.parse(cached) as PersistedCache;

    Object.entries(parsed).forEach(([keyStr, entry]) => {
      const data = entry?.state?.data;
      if (data === undefined) return;

      let queryKey: unknown;
      try {
        queryKey = JSON.parse(keyStr);
      } catch {
        return;
      }

      const updatedAt = entry.state?.dataUpdatedAt ?? entry.updatedAt;

      if (updatedAt !== undefined) {
        queryClient.setQueryData(queryKey as any, data, { updatedAt });
      } else {
        queryClient.setQueryData(queryKey as any, data);
      }
    });
  } catch (e) {
    console.warn('[persistQueryClient] Erreur restauration cache:', e);
  }
}

export function clearCache(): void {
  try {
    localStorage.removeItem(STORAGE_KEY);
  } catch (e) {
    console.warn('[persistQueryClient] Erreur suppression cache:', e);
  }
}
