import localForage from 'localforage';

export interface QueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
}

const QUEUE_STORE = 'offline_queue';

// Initialiser localForage pour la file
const queueStore = localForage.createInstance({
  name: 'AppPMEOffline',
  storeName: QUEUE_STORE,
});

export const OfflineQueue = {
  // Ajouter un élément
  async add(item: Omit<QueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const newItem: QueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    const items = await this.getAll();
    items.push(newItem);
    await queueStore.setItem(QUEUE_STORE, items);
  },

  // Récupérer tous les éléments
  async getAll(): Promise<QueueItem[]> {
    const items = await queueStore.getItem<QueueItem[]>(QUEUE_STORE);
    return items || [];
  },

  // Supprimer un élément par ID
  async remove(id: string): Promise<void> {
    const items = await this.getAll();
    const filtered = items.filter(item => item.id !== id);
    await queueStore.setItem(QUEUE_STORE, filtered);
  },

  // Mettre à jour un élément (ex: incrémenter les tentatives)
  async update(id: string, updates: Partial<QueueItem>): Promise<void> {
    const items = await this.getAll();
    const index = items.findIndex(item => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await queueStore.setItem(QUEUE_STORE, items);
    }
  },

  // Vider toute la file
  async clear(): Promise<void> {
    await queueStore.removeItem(QUEUE_STORE);
  },

  // Compter les éléments
  async count(): Promise<number> {
    const items = await this.getAll();
    return items.length;
  },
};
