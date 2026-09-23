import localForage from 'localforage';

export interface QueueItem {
  id: string;
  url: string;
  method: 'POST' | 'PUT' | 'DELETE' | 'PATCH';
  body?: any;
  headers?: Record<string, string>;
  timestamp: number;
  retries: number;
  maxRetries?: number;
}

const QUEUE_STORE = 'offline_queue';

const queueStore = localForage.createInstance({
  name: 'AppPMEOffline',
  storeName: QUEUE_STORE,
  driver: [
    localForage.INDEXEDDB,
    localForage.WEBSQL,
    localForage.LOCALSTORAGE,
  ],
});

async function getAllItems(): Promise<QueueItem[]> {
  const items = await queueStore.getItem<QueueItem[]>(QUEUE_STORE);
  return items || [];
}

async function setAllItems(items: QueueItem[]): Promise<void> {
  await queueStore.setItem(QUEUE_STORE, items);
}

export const OfflineQueue = {
  async add(item: Omit<QueueItem, 'id' | 'timestamp' | 'retries'>): Promise<void> {
    const newItem: QueueItem = {
      ...item,
      id: `offline-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`,
      timestamp: Date.now(),
      retries: 0,
    };
    const items = await getAllItems();
    items.push(newItem);
    await setAllItems(items);
  },

  async getAll(): Promise<QueueItem[]> {
    return getAllItems();
  },

  async remove(id: string): Promise<void> {
    const items = await getAllItems();
    await setAllItems(items.filter((item) => item.id !== id));
  },

  async update(id: string, updates: Partial<QueueItem>): Promise<void> {
    const items = await getAllItems();
    const index = items.findIndex((item) => item.id === id);
    if (index !== -1) {
      items[index] = { ...items[index], ...updates };
      await setAllItems(items);
    }
  },

  async clear(): Promise<void> {
    await queueStore.removeItem(QUEUE_STORE);
  },

  async count(): Promise<number> {
    const items = await getAllItems();
    return items.length;
  },
};

export default OfflineQueue;
