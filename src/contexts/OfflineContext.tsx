import React, { createContext, useContext, useState, useCallback, ReactNode, useEffect } from 'react';
import localForage from 'localforage';
import { useOnlineStatus } from '../hooks/useOnlineStatus';
import { useToast } from '../hooks/useToast';
import { syncAllImages } from '../lib/imageStorage';

const queueStore = localForage.createInstance({
  name: 'AppPMEOffline',
  storeName: 'offline_queue',
});

export interface OfflineQueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries: number;
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
// ✅ Délai de 1 heure avant la synchronisation automatique
const AUTO_SYNC_DELAY = 60 * 60 * 1000; // 1 heure en millisecondes

export const OfflineProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const isOnline = useOnlineStatus();
  const { success, error: toastError, info } = useToast();
  const [queue, setQueue] = useState<OfflineQueueItem[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [loaded, setLoaded] = useState(false);
  const [lastSyncAttempt, setLastSyncAttempt] = useState<number>(0);
  const syncTimeoutRef = React.useRef<NodeJS.Timeout | null>(null);

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

  const processQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isProcessing) return;
    
    // ✅ Vérifier si 1 heure s'est écoulée depuis la dernière tentative
    const now = Date.now();
    if (now - lastSyncAttempt < AUTO_SYNC_DELAY && lastSyncAttempt > 0) {
      // Pas encore 1 heure, on ignore
      return;
    }
    
    setIsProcessing(true);
    setLastSyncAttempt(now);
    info(`Synchronisation de ${queue.length} action(s)...`);
    
    let processed = 0;
    const failed: OfflineQueueItem[] = [];

    for (const item of queue) {
      try {
        const isFormData = item.body instanceof FormData;
        const headers: Record<string, string> = isFormData ? {} : { 'Content-Type': 'application/json' };
        const finalHeaders = { ...headers, ...(item.headers || {}) };
        const response = await fetch(item.url, {
          method: item.method,
          headers: finalHeaders,
          body: isFormData ? item.body : JSON.stringify(item.body),
        });
        if (!response.ok) throw new Error(`HTTP ${response.status}`);
        processed++;
      } catch (err) {
        console.warn('[OfflineQueue] Échec de rejeu:', item, err);
        const updatedItem = { ...item, retries: item.retries + 1 };
        if (updatedItem.retries < updatedItem.maxRetries) {
          failed.push(updatedItem);
        } else {
          toastError(`Action hors ligne abandonnée : ${item.url} (trop de tentatives)`);
        }
      }
    }

    setQueue(failed);
    if (processed > 0) {
      success(`${processed} action(s) synchronisée(s) ✅`);
    } else if (failed.length === 0 && queue.length === 0) {
      success('✅ Toutes les actions ont été synchronisées');
    }
    setIsProcessing(false);
  }, [isOnline, queue, isProcessing, toastError, success, info, lastSyncAttempt]);

  // ✅ Synchronisation automatique uniquement toutes les 1 heure
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      // Nettoyer le timeout précédent
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
      
      // Vérifier si 1 heure s'est écoulée depuis la dernière tentative
      const now = Date.now();
      const timeSinceLastSync = now - lastSyncAttempt;
      
      if (lastSyncAttempt === 0 || timeSinceLastSync >= AUTO_SYNC_DELAY) {
        // Si 1 heure est passée, déclencher immédiatement
        syncTimeoutRef.current = setTimeout(() => {
          processQueue();
        }, 2000);
      } else {
        // Sinon, programmer pour dans 1 heure
        const delay = AUTO_SYNC_DELAY - timeSinceLastSync;
        syncTimeoutRef.current = setTimeout(() => {
          processQueue();
        }, delay);
      }
    }
    
    return () => {
      if (syncTimeoutRef.current) {
        clearTimeout(syncTimeoutRef.current);
        syncTimeoutRef.current = null;
      }
    };
  }, [isOnline, queue.length, isProcessing, processQueue, lastSyncAttempt]);

  // Synchronisation manuelle (bouton "Synchroniser maintenant")
  const manualProcessQueue = useCallback(async () => {
    if (!isOnline || queue.length === 0 || isProcessing) return;
    // ✅ Forcer la synchronisation même si 1 heure n'est pas passée
    setLastSyncAttempt(0); // Réinitialiser pour permettre la synchro
    await processQueue();
  }, [isOnline, queue.length, isProcessing, processQueue]);

  // ✅ Re-synchroniser toutes les 1 heure
  useEffect(() => {
    if (isOnline && queue.length > 0 && !isProcessing) {
      const interval = setInterval(() => {
        if (!isProcessing && queue.length > 0) {
          // Vérifier que 1 heure s'est écoulée
          const now = Date.now();
          if (now - lastSyncAttempt >= AUTO_SYNC_DELAY) {
            processQueue();
          }
        }
      }, AUTO_SYNC_DELAY); // Vérifier toutes les 1 heure
      
      return () => clearInterval(interval);
    }
  }, [isOnline, queue.length, isProcessing, processQueue, lastSyncAttempt]);

  // Synchroniser les images après la file d'attente
  const syncImages = useCallback(async () => {
    if (!isOnline) return;
    try {
      const result = await syncAllImages('logos');
      if (result.success > 0) {
        success(`${result.success} image(s) synchronisée(s) ✅`);
      }
    } catch (err) {
      console.warn('[OfflineContext] Erreur synchro images:', err);
    }
  }, [isOnline, success]);

  // Déclencher la synchronisation des images après le traitement de la file
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
    processQueue: manualProcessQueue, // Exposer la version manuelle
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
