#!/bin/bash

mkdir -p src/lib src/hooks

cat > src/lib/localDb.ts << 'EOF1'
import localforage from 'localforage';
export const db = localforage.createInstance({
  name: 'AppPME',
  storeName: 'app_data',
  description: 'Stockage local pour App PME',
});
localforage.setDriver([
  localforage.INDEXEDDB,
  localforage.WEBSQL,
  localforage.LOCALSTORAGE,
]);
export default db;
EOF1

cat > src/hooks/useLocalStorage.ts << 'EOF2'
import { useState, useEffect } from 'react';
import { db } from '../lib/localDb';
export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  useEffect(() => {
    const loadData = async () => {
      try {
        const value = await db.getItem<T>(key);
        if (value !== null) setStoredValue(value);
      } catch (error) {
        console.error('Erreur de chargement depuis IndexedDB:', error);
      } finally {
        setLoading(false);
      }
    };
    loadData();
  }, [key]);
  const setValue = async (value: T | ((val: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      await db.setItem(key, newValue);
    } catch (error) {
      console.error('Erreur de sauvegarde dans IndexedDB:', error);
    }
  };
  const removeValue = async () => {
    try {
      await db.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Erreur de suppression dans IndexedDB:', error);
    }
  };
  return { value: storedValue, setValue, removeValue, loading };
}
export default useLocalStorage;
EOF2
echo "✅ Partie 1 terminée."
