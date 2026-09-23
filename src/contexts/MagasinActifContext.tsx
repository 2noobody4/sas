/**
 * MagasinActifContext – Gestion du magasin actif pour l'utilisateur
 * Le magasin actif est stocké dans localStorage pour persistance.
 * Compatible React 16.14
 */

import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { Magasin } from '../types/magasins';

interface MagasinActifContextType {
  magasinActif: Magasin | null;
  magasinActifId: string | null;
  setMagasinActif: (magasinId: string) => Promise<void>;
  loading: boolean;
  error: string | null;
  refreshMagasinActif: () => Promise<void>;
}

const MagasinActifContext = createContext<MagasinActifContextType | null>(null);

const STORAGE_KEY = 'magasin_actif_id';

export const MagasinActifProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [magasinActif, setMagasinActifState] = useState<Magasin | null>(null);
  const [magasinActifId, setMagasinActifId] = useState<string | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  // Charger le magasin actif depuis localStorage et Supabase
  const loadMagasinActif = useCallback(async () => {
    try {
      setLoading(true);
      setError(null);

      // 1. Récupérer l'ID depuis localStorage
      let id: string | null = localStorage.getItem(STORAGE_KEY);

      // 2. Si pas d'ID, essayer de récupérer le magasin par défaut
      if (!id) {
        const { data: defaultMagasin, error: defaultError } = await supabase
          .from('magasins')
          .select('*')
          .eq('est_defaut', true)
          .maybeSingle();

        if (defaultError) throw defaultError;

        if (defaultMagasin) {
          id = defaultMagasin.id;
          if (id) {
            localStorage.setItem(STORAGE_KEY, id);
          }
        } else {
          // Si aucun magasin par défaut, prendre le premier magasin actif
          const { data: firstMagasin, error: firstError } = await supabase
            .from('magasins')
            .select('*')
            .eq('actif', true)
            .limit(1)
            .maybeSingle();

          if (firstError) throw firstError;

          if (firstMagasin) {
            id = firstMagasin.id;
            if (id) {
              localStorage.setItem(STORAGE_KEY, id);
            }
          }
        }
      }

      if (id) {
        // Récupérer les données du magasin
        const { data: magasin, error: magasinError } = await supabase
          .from('magasins')
          .select('*')
          .eq('id', id)
          .single();

        if (magasinError) throw magasinError;

        setMagasinActifState(magasin);
        setMagasinActifId(magasin.id);
      } else {
        setMagasinActifState(null);
        setMagasinActifId(null);
      }
    } catch (err: any) {
      console.error('[MagasinActif] Erreur de chargement:', err);
      setError(err.message || 'Erreur de chargement');
    } finally {
      setLoading(false);
    }
  }, []);

  useEffect(() => {
    loadMagasinActif();
  }, [loadMagasinActif]);

  // Fonction pour définir le magasin actif (celle qui sera exposée)
  const setMagasinActif = useCallback(async (magasinId: string): Promise<void> => {
    try {
      setLoading(true);
      setError(null);

      // Vérifier que le magasin existe
      const { data: magasin, error: magasinError } = await supabase
        .from('magasins')
        .select('*')
        .eq('id', magasinId)
        .single();

      if (magasinError) throw magasinError;

      // Stocker dans localStorage
      localStorage.setItem(STORAGE_KEY, magasinId);

      setMagasinActifState(magasin);
      setMagasinActifId(magasin.id);
    } catch (err: any) {
      console.error('[MagasinActif] Erreur de mise à jour:', err);
      setError(err.message || 'Erreur de mise à jour');
      throw err;
    } finally {
      setLoading(false);
    }
  }, []);

  const refreshMagasinActif = useCallback(async (): Promise<void> => {
    await loadMagasinActif();
  }, [loadMagasinActif]);

  const value: MagasinActifContextType = {
    magasinActif,
    magasinActifId,
    setMagasinActif,
    loading,
    error,
    refreshMagasinActif,
  };

  return (
    <MagasinActifContext.Provider value={value}>
      {children}
    </MagasinActifContext.Provider>
  );
};

export const useMagasinActif = (): MagasinActifContextType => {
  const context = useContext(MagasinActifContext);
  if (!context) {
    throw new Error('useMagasinActif must be used within MagasinActifProvider');
  }
  return context;
};

export default MagasinActifProvider;
