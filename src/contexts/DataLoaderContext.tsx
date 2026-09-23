/**
 * DataLoaderContext
 * Gère le chargement initial de toutes les données depuis Supabase,
 * les stocke dans IndexedDB (via localForage) et alimente React Query.
 * Compatible React 16.14.
 * Inclut le cache des images.
 */

import React, { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import localForage from 'localforage';
import { supabase } from '../lib/supabaseClient';

// Configuration de localForage (IndexedDB)
localForage.config({
  name: 'AppPMEData',
  storeName: 'app_data',
  description: 'Cache des données de l’application',
});

// Clés de stockage
const STORAGE_KEYS = {
  produits: 'produits',
  categories: 'categories',
  fournisseurs: 'fournisseurs',
  mouvements: 'mouvements',
  config: 'config',
  theme: 'theme',
};

// Interface du contexte
interface DataLoaderContextType {
  isLoading: boolean;
  progress: number;
  error: string | null;
  loadData: () => Promise<void>;
  getData: <T>(key: string) => Promise<T | null>;
  setData: <T>(key: string, data: T) => Promise<void>;
  getCachedImage: (url: string) => Promise<string>;
}

const DataLoaderContext = createContext<DataLoaderContextType | null>(null);

export const DataLoaderProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [isLoading, setIsLoading] = useState(true);
  const [progress, setProgress] = useState(0);
  const [error, setError] = useState<string | null>(null);
  const [initialized, setInitialized] = useState(false);

  // Fonction pour cacher une image en base64 dans IndexedDB
  const cacheImage = async (url: string): Promise<string> => {
    if (!url) return url;
    try {
      const cached = await localForage.getItem<string>(`img_${url}`);
      if (cached) return cached;
    } catch {
      // ignore
    }

    try {
      const response = await fetch(url);
      if (!response.ok) throw new Error('Image introuvable');
      const blob = await response.blob();
      const reader = new FileReader();
      const base64 = await new Promise<string>((resolve) => {
        reader.onloadend = () => resolve(reader.result as string);
        reader.readAsDataURL(blob);
      });
      await localForage.setItem(`img_${url}`, base64);
      return base64;
    } catch (e) {
      console.warn('[DataLoader] Échec du cache image:', url, e);
      return url; // fallback sur l'URL originale
    }
  };

  // Fonction pour récupérer une image depuis le cache ou l'URL
  const getCachedImage = async (url: string): Promise<string> => {
    if (!url) return url;
    try {
      const cached = await localForage.getItem<string>(`img_${url}`);
      if (cached) return cached;
    } catch {}
    return url;
  };

  // Fonction pour charger toutes les données depuis Supabase
  const loadData = async () => {
    setIsLoading(true);
    setError(null);
    setProgress(0);

    try {
      // 1. Config
      setProgress(10);
      const { data: configData } = await supabase.from('config').select('*').limit(1).maybeSingle();
      if (configData) await localForage.setItem(STORAGE_KEYS.config, configData);
      setProgress(20);

      // 2. Catégories
      const { data: categories } = await supabase.from('categories').select('*');
      if (categories) await localForage.setItem(STORAGE_KEYS.categories, categories);
      setProgress(40);

      // 3. Produits (avec catégories jointes)
      const { data: produits } = await supabase.from('produits').select('*, categorie:categories(*)');
      if (produits) await localForage.setItem(STORAGE_KEYS.produits, produits);
      setProgress(60);

      // 4. Fournisseurs
      const { data: fournisseurs } = await supabase.from('fournisseurs').select('*');
      if (fournisseurs) await localForage.setItem(STORAGE_KEYS.fournisseurs, fournisseurs);
      setProgress(80);

      // 5. Mouvements (derniers 1000)
      const { data: mouvements } = await supabase
        .from('mouvements_stock')
        .select('*, produit:produits(*)')
        .order('date_mouvement', { ascending: false })
        .limit(1000);
      if (mouvements) await localForage.setItem(STORAGE_KEYS.mouvements, mouvements);
      setProgress(90);

      // 6. Thème (si besoin)
      const { data: themeData } = await supabase.from('themes').select('*').eq('actif', true).maybeSingle();
      if (themeData) await localForage.setItem(STORAGE_KEYS.theme, themeData);

      // 7. Cache des images
      const imageUrls: string[] = [];
      if (configData?.logo_url) imageUrls.push(configData.logo_url);
      produits?.forEach((p: any) => { if (p.image_url) imageUrls.push(p.image_url); });
      categories?.forEach((c: any) => { if (c.image_url) imageUrls.push(c.image_url); });
      fournisseurs?.forEach((f: any) => { if (f.image_url) imageUrls.push(f.image_url); });

      // Télécharger et cacher les images en parallèle
      if (imageUrls.length > 0) {
        await Promise.all(imageUrls.map(url => cacheImage(url)));
      }
      setProgress(100);

      setInitialized(true);
      setIsLoading(false);
    } catch (err: any) {
      console.error('[DataLoader] Erreur:', err);
      setError(err.message || 'Erreur lors du chargement des données');
      setIsLoading(false);
    }
  };

  // Charger les données au montage
  useEffect(() => {
    const checkCache = async () => {
      try {
        const cachedConfig = await localForage.getItem(STORAGE_KEYS.config);
        const cachedProduits = await localForage.getItem(STORAGE_KEYS.produits);
        if (cachedConfig && cachedProduits) {
          setInitialized(true);
          setIsLoading(false);
          setProgress(100);
        } else {
          await loadData();
        }
      } catch {
        await loadData();
      }
    };
    checkCache();
  }, []);

  // Fonctions getter/setter pour les composants
  const getData = async <T,>(key: string): Promise<T | null> => {
    try {
      return await localForage.getItem<T>(key);
    } catch {
      return null;
    }
  };

  const setData = async <T,>(key: string, data: T): Promise<void> => {
    await localForage.setItem(key, data);
  };

  const value: DataLoaderContextType = {
    isLoading,
    progress,
    error,
    loadData,
    getData,
    setData,
    getCachedImage,
  };

  return (
    <DataLoaderContext.Provider value={value}>
      {children}
    </DataLoaderContext.Provider>
  );
};

export const useDataLoader = (): DataLoaderContextType => {
  const context = useContext(DataLoaderContext);
  if (!context) throw new Error('useDataLoader must be used within DataLoaderProvider');
  return context;
};

export default DataLoaderProvider;
