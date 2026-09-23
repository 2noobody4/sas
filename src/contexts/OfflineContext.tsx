import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import localForage from 'localforage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast } from '../hooks/useToast';
import { syncAllImages } from '../lib/imageStorage';
import { supabase } from '../lib/supabaseClient';

const queueStore = localForage.createInstance({
  name: 'AppPMEOffline',
  storeName: 'offline_queue',
});

// 🔧 Correction : l'app n'a pas de vrai backend derrière `/api/...`.
// Une action déclarant `supabaseAction` est rejouée directement via le
// client Supabase au lieu d'un `fetch(url)` qui échouait systématiquement.
// Voir useOfflineMutation.ts pour la façade côté hooks.
export type SupabaseQueueAction =
  | { kind: 'rpc'; fn: string; args: Record<string, any> }
  | { kind: 'insert'; table: string; values: any }
  | { kind: 'update'; table: string; values: any; match: Record<string, any> }
  | { kind: 'delete'; table: string; match: Record<string, any> };

async function rejouerActionSupabase(action: SupabaseQueueAction): Promise<void> {
  if (action.kind === 'rpc') {
    const { error } = await supabase.rpc(action.fn, action.args);
    if (error) throw error;
    return;
  }
  if (action.kind === 'insert') {
    const { error } = await supabase.from(action.table).insert(action.values);
    if (error) throw error;
    return;
  }
  if (action.kind === 'update') {
    let q = supabase.from(action.table).update(action.values);
    Object.entries(action.match).forEach(([k, v]) => {
      q = q.eq(k, v);
    });
    const { error } = await q;
    if (error) throw error;
    return;
  }
  if (action.kind === 'delete') {
    let q = supabase.from(action.table).delete();
    Object.entries(action.match).forEach(([k, v]) => {
      q = q.eq(k, v);
    });
    const { error } = await q;
    if (error) throw error;
    return;
  }
}

export interface OfflineQueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
  // Optionnel : quand présent, ce mode de rejeu est utilisé à la place
  // de fetch(url). Voir plus haut.
  supabaseAction?: SupabaseQueueAction;
}

interface OfflineContextType {
  isOnline: boolean;
  queue: OfflineQueueItem[];
  queueCount: number;
  addToQueue: (item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries' | 'maxRetries'>) => void;
  removeFromQueue: (id: string) => void;
  clearQueue: () => void;
  processQueue: () => Promise<void>;
  isProcessing: boolean;
}

const OfflineContext = createContext<OfflineContextType | null>(null);
const MAX_RETRIES = 5;
const AUTO_SYNC_DELAY = 60 * 60 * 1000;

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const { success, error: toastError, info } = useToast();
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const lastSyncAttemptRef = React.useRef<number>(0);
  const isProcessingRef = React.useRef(false);

  useEffect(() => {
    const loadQueue = async () => {
      try {
        const stored = await queueStore.getItem<OfflineQueueItem[]>('queue');
        if (stored) setQueue(stored);
      } catch (err) {
        console.error('[OfflineContext] Erreur chargement file:', err);
      } finally {
        setLoaded(true);
      }
    };
    loadQueue();
  }, []);

  useEffect(() => {
    if (loaded) {
      queueStore.setItem('queue', queue).catch(err => {
        console.error('[OfflineContext] Erreur persistance:', err);
      });
    }
  }, [queue, loaded]);

  const addToQueue = useCallback((item: Omit<OfflineQueueItem, 'id' | 'timestamp' | 'retries' | 'maxRetries'>) => {
    const newItem: OfflineQueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      timestamp: Date.now(),
      retries: 0,
      maxRetries: MAX_RETRIES,
    };
    setQueue(prev => [...prev, newItem]);
    info('Action mise en file d\'attente (hors ligne)');
  }, [info]);

  const removeFromQueue = useCallback((id: string) => {
    setQueue(prev => prev.filter(item => item.id !== id));
  }, []);

  const clearQueue = useCallback(() => {
    const count = queue.length;
    setQueue([]);
    success(`${count} action(s) supprimée(s) de la file`);
  }, [queue, success]);

  // Process interne : accepte un flag force pour bypasser le délai
  const doProcessQueue = useCallback(async (force: boolean): Promise<void> => {
    if (!isOnline || isProcessingRef.current) return;
    if (queue.length === 0) return;

    const now = Date.now();
    if (!force && lastSyncAttemptRef.current > 0 && now - lastSyncAttemptRef.current < AUTO_SYNC_DELAY) {
      return;
    }

    isProcessingRef.current = true;
    setIsProcessing(true);
    lastSyncAttemptRef.current = now;

    info(`Synchronisation de ${queue.length} action(s)...`);

    let processed = 0;
    const failed: OfflineQueueItem[] = [];

    for (const item of queue) {
      try {
        if (item.supabaseAction) {
          // 🔧 Rejeu direct via Supabase (voir plus haut) — remplace
          // l'ancien fetch(url) qui n'avait aucune route à appeler.
          await rejouerActionSupabase(item.supabaseAction);
        } else {
          const isFormData = item.body instanceof FormData;
          const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
          const finalHeaders = { ...headers, ...(item.headers || {}) };
          const response = await fetch(item.url, {
            method: item.method,
            headers: finalHeaders,
            body: isFormData ? item.body : JSON.stringify(item.body),
          });
          if (!response.ok) throw new Error(`HTTP ${response.status}`);
        }
        processed++;
      } catch (err) {
        console.warn('[OfflineQueue] Échec de rejeu:', item, err);
        const updatedItem = { ...item, retries: item.retries + 1 };
        if (updatedItem.retries < updatedItem.maxRetries) {
          failed.push(updatedItem);
        } else {
          toastError(`Action hors ligne abandonnée : ${item.url}`);
        }
      }
    }

    setQueue(failed);
    if (processed > 0) success(`${processed} action(s) synchronisée(s) ✅`);
    isProcessingRef.current = false;
    setIsProcessing(false);
  }, [isOnline, queue, info, success, toastError]);

  // Version publique : sync manuelle qui force
  const processQueue = useCallback(async () => {
    await doProcessQueue(true);
  }, [doProcessQueue]);

  // Sync auto
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      const timer = setTimeout(() => { void doProcessQueue(false); }, 2000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, queue.length, isProcessing, doProcessQueue]);

  // Sync images
  const syncImages = useCallback(async () => {
    if (!isOnline) return;
    try {
      // ⭐ FIX : plus de bucket "logos" imposé — chaque image en attente
      // (services, produits, logos, etc.) part vers son propre bucket.
      const result = await syncAllImages();
      if (result.success > 0) success(`${result.success} image(s) synchronisée(s) ✅`);
    } catch (err) {
      console.warn('[OfflineContext] Erreur synchro images:', err);
    }
  }, [isOnline, success]);

  useEffect(() => {
    if (isOnline && !isProcessing && queue.length === 0) {
      const timer = setTimeout(() => syncImages(), 3000);
      return () => clearTimeout(timer);
    }
  }, [isOnline, isProcessing, queue.length, syncImages]);

  const value = {
    isOnline,
    queue,
    queueCount: queue.length,
    addToQueue,
    removeFromQueue,
    clearQueue,
    processQueue,
    isProcessing,
  };

  return <OfflineContext.Provider value={value}>{children}</OfflineContext.Provider>;
};

export const useOffline = (): OfflineContextType => {
  const context = useContext(OfflineContext);
  if (!context) throw new Error('useOffline must be used within OfflineProvider');
  return context;
};

export default OfflineProvider;
