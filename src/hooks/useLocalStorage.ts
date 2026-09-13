import { useState, useEffect, useRef, useCallback } from 'react';
import { db } from '../lib/localDb';

export function useLocalStorage<T>(key: string, initialValue: T) {
  const [storedValue, setStoredValue] = useState<T>(initialValue);
  const [loading, setLoading] = useState(true);
  const mountedRef = useRef(true);
  const loadingRef = useRef(false);

  useEffect(() => {
    mountedRef.current = true;
    const loadData = async () => {
      if (loadingRef.current) return;
      loadingRef.current = true;
      try {
        const value = await db.getItem<T>(key);
        if (value !== null && mountedRef.current) {
          setStoredValue(value);
        }
      } catch (error) {
        console.error('Erreur de chargement depuis IndexedDB:', error);
      } finally {
        if (mountedRef.current) {
          setLoading(false);
        }
        loadingRef.current = false;
      }
    };
    loadData();

    return () => {
      mountedRef.current = false;
    };
  }, [key]);

  const setValue = useCallback(async (value: T | ((val: T) => T)) => {
    try {
      const newValue = value instanceof Function ? value(storedValue) : value;
      setStoredValue(newValue);
      await db.setItem(key, newValue);
    } catch (error) {
      console.error('Erreur de sauvegarde dans IndexedDB:', error);
    }
  }, [key, storedValue]);

  const removeValue = useCallback(async () => {
    try {
      await db.removeItem(key);
      setStoredValue(initialValue);
    } catch (error) {
      console.error('Erreur de suppression dans IndexedDB:', error);
    }
  }, [key, initialValue]);

  return { value: storedValue, setValue, removeValue, loading };
}

export default useLocalStorage;
