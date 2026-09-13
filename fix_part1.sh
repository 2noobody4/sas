#!/bin/bash
echo "🔄 Partie 1/2 : Restauration de useBoutique et ThemeContext"

cat > src/hooks/useBoutique.ts << 'EOFBOUTIQUE'
import { useState, useEffect } from 'react';
import { useQuery, useMutation, useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { Panier, Commande, CommandeFormData, StatutCommande } from '../types/boutique';
import { useToast } from './useToast';
import { useDataLoader } from '../contexts/DataLoaderContext';
import { useLocalStorage } from './useLocalStorage';

export const usePanier = () => {
  const { value: panier, setValue: setPanier } = useLocalStorage<Panier>('panier', { items: [], total: 0 });

  const calculerTotal = (items: any[]): number => {
    return items.reduce((acc, item) => acc + (item.prix_unitaire * item.quantite), 0);
  };

  const ajouter = (produit_id: string, prix: number, quantite: number = 1) => {
    setPanier((prev) => {
      const existing = prev.items.find((item) => item.produit_id === produit_id);
      let newItems;
      if (existing) {
        newItems = prev.items.map((item) =>
          item.produit_id === produit_id ? { ...item, quantite: item.quantite + quantite } : item
        );
      } else {
        newItems = [...prev.items, { produit_id, quantite, prix_unitaire: prix }];
      }
      return { items: newItems, total: calculerTotal(newItems) };
    });
  };

  const retirer = (produit_id: string) => {
    setPanier((prev) => {
      const newItems = prev.items.filter((item) => item.produit_id !== produit_id);
      return { items: newItems, total: calculerTotal(newItems) };
    });
  };

  const modifierQuantite = (produit_id: string, quantite: number) => {
    setPanier((prev) => {
      if (quantite <= 0) {
        const newItems = prev.items.filter((item) => item.produit_id !== produit_id);
        return { items: newItems, total: calculerTotal(newItems) };
      }
      const newItems = prev.items.map((item) =>
        item.produit_id === produit_id ? { ...item, quantite } : item
      );
      return { items: newItems, total: calculerTotal(newItems) };
    });
  };

  const vider = () => {
    setPanier({ items: [], total: 0 });
  };

  return { panier, ajouter, retirer, modifierQuantite, vider };
};

export const useCommandes = (filters?: { statut?: StatutCommande; client_id?: string }) => {
  const { getData } = useDataLoader();
  return useQuery<Commande[], Error>({
    queryKey: ['commandes', filters],
    queryFn: async () => {
      try {
        let query = supabase
          .from('commandes')
          .select('*, user:users(id, nom, prenom, email)')
          .order('date_commande', { ascending: false });

        if (filters?.statut) query = query.eq('statut', filters.statut);
        if (filters?.client_id) query = query.eq('client_id', filters.client_id);

        const { data, error } = await query;
        if (error) throw error;
        return data as Commande[];
      } catch {
        const cached = await getData<Commande[]>('commandes');
        if (cached) return cached;
        throw new Error('Impossible de charger les commandes');
      }
    },
    staleTime: 1000 * 60 * 2,
    cacheTime: 1000 * 60 * 60 * 24,
  });
};

export const useCommande = (id?: string) => {
  return useQuery<Commande | null, Error>({
    queryKey: ['commande', id],
    queryFn: async () => {
      if (!id) return null;
      const { data, error } = await supabase
        .from('commandes')
        .select('*, user:users(id, nom, prenom, email)')
        .eq('id', id)
        .single();
      if (error) throw error;
      return data as Commande;
    },
    enabled: !!id,
  });
};

export const useCreateCommande = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (data: CommandeFormData): Promise<Commande> => {
    const userId = (await supabase.auth.getUser()).data.user?.id;
    if (!userId) throw new Error('Utilisateur non authentifié');

    const { data: client } = await supabase
      .from('clients')
      .select('id, nom, prenom, email, telephone, adresse')
      .eq('user_id', userId)
      .maybeSingle();

    const montant_total = data.items.reduce((acc, item) => acc + (item.prix_unitaire * item.quantite), 0) + (data.frais_livraison || 0);

    const { data: inserted, error } = await supabase
      .from('commandes')
      .insert([{
        client_id: client?.id || null,
        client_nom: data.client_nom || client?.nom || null,
        client_email: data.client_email || client?.email || null,
        client_telephone: data.client_telephone || client?.telephone || null,
        client_adresse: data.client_adresse || client?.adresse || null,
        items: data.items,
        montant_total,
        frais_livraison: data.frais_livraison || 0,
        statut: 'en_attente',
        mode_paiement: data.mode_paiement || null,
        notes: data.notes || null,
        user_id: userId,
      }])
      .select()
      .single();

    if (error) throw error;
    return inserted;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('commandes');
      success('Commande créée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useUpdateCommandeStatut = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async ({ id, statut }: { id: string; statut: StatutCommande }): Promise<Commande> => {
    const { data: updated, error } = await supabase
      .from('commandes')
      .update({ statut })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return updated;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('commandes');
      success('Statut mis à jour ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};

export const useDeleteCommande = () => {
  const queryClient = useQueryClient();
  const { success, error: toastError } = useToast();

  const mutationFn = async (id: string): Promise<string> => {
    const { error } = await supabase
      .from('commandes')
      .delete()
      .eq('id', id);

    if (error) throw error;
    return id;
  };

  return useMutation(mutationFn, {
    onSuccess: () => {
      queryClient.invalidateQueries('commandes');
      success('Commande supprimée ✅');
    },
    onError: (err: any) => {
      toastError(err.message);
    },
  });
};
EOFBOUTIQUE

cat > src/components/theme/ThemeContext.tsx << 'EOFTHEME'
import React, { createContext, useContext, useState, useEffect, useCallback, useRef } from 'react';
import { supabase } from '../../lib/supabaseClient';
import { useConfig } from '../../contexts/ConfigContext';
import { Theme, Style, Animation, ThemeContextType } from '../../types/theme';
import { resolveComponentForHook } from './resolveComponent';
import { THEME_PAR_DEFAUT } from './theme-default';

function mergeWithDefaults<T extends Record<string, any>>(loaded: T | null | undefined, defaults: T): T {
  if (!loaded || typeof loaded !== 'object' || Array.isArray(loaded)) return defaults;
  const result = { ...defaults };
  for (const key of Object.keys(loaded)) {
    const typedKey = key as keyof T;
    const loadedValue = loaded[typedKey];
    const defaultValue = defaults[typedKey];
    if (loadedValue !== undefined && loadedValue !== null) {
      if (typeof loadedValue === 'object' && !Array.isArray(loadedValue)) {
        if (defaultValue && typeof defaultValue === 'object' && !Array.isArray(defaultValue)) {
          result[typedKey] = mergeWithDefaults(loadedValue, defaultValue) as T[keyof T];
        } else {
          result[typedKey] = loadedValue;
        }
      } else {
        result[typedKey] = loadedValue;
      }
    }
  }
  return result;
}

function applyThemeCSS(theme: Theme) {
  const root = document.documentElement;
  if (!root) return;
  if (theme.couleurs) {
    Object.entries(theme.couleurs).forEach(([key, value]) => {
      root.style.setProperty(`--color-${key}`, value as string);
    });
  }
  if (theme.typographie) {
    if (theme.typographie.policeTitre) root.style.setProperty('--font-title', theme.typographie.policeTitre);
    if (theme.typographie.policeTexte) root.style.setProperty('--font-body', theme.typographie.policeTexte);
    if (theme.typographie.policeChiffres) root.style.setProperty('--font-mono', theme.typographie.policeChiffres);
  }
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useConfig();
  const [theme, setTheme] = useState<Theme>(THEME_PAR_DEFAUT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  const loadTheme = useCallback(async (force = false) => {
    if (loadedRef.current && !force) return;
    if (!config.loaded) return;
    try {
      setLoading(true);
      setError(null);

      const { data: themeData, error: themeError } = await supabase
        .from('themes')
        .select('*')
        .eq('actif', true)
        .maybeSingle();

      if (themeError || !themeData) {
        setTheme(THEME_PAR_DEFAUT);
        applyThemeCSS(THEME_PAR_DEFAUT);
        loadedRef.current = true;
        setLoading(false);
        return;
      }

      let components: any[] = [];
      try {
        const { data } = await supabase
          .from('component_styles')
          .select('*')
          .eq('theme_id', themeData.id);
        components = data || [];
      } catch (e) {
        console.warn('[ThemeContext] Erreur composants:', e);
      }

      const loadedColors = (themeData.couleurs as any) || {};
      const loadedTypo = (themeData.typographie as any) || {};

      const mergedColors = mergeWithDefaults(loadedColors, THEME_PAR_DEFAUT.couleurs);
      const mergedTypo = mergeWithDefaults(loadedTypo, THEME_PAR_DEFAUT.typographie);

      const loadedTheme: Theme = {
        id: themeData.id,
        nom: themeData.nom || 'Défaut',
        actif: themeData.actif || false,
        couleurs: mergedColors,
        typographie: mergedTypo,
        composants: components.length > 0
          ? components.map((c: any) => ({
              typeComponent: c.type_component,
              style: c.style || { proprietes: {} },
              animation: c.animation || undefined,
            }))
          : THEME_PAR_DEFAUT.composants,
      };

      setTheme(loadedTheme);
      applyThemeCSS(loadedTheme);
      loadedRef.current = true;
    } catch (err: any) {
      console.error('[ThemeContext] Erreur:', err);
      setError(err.message);
      setTheme(THEME_PAR_DEFAUT);
      applyThemeCSS(THEME_PAR_DEFAUT);
      loadedRef.current = true;
    } finally {
      setLoading(false);
    }
  }, [config]);

  useEffect(() => {
    if (config.loaded) loadTheme();
  }, [config.loaded, loadTheme]);

  useEffect(() => {
    applyThemeCSS(theme);
  }, [theme]);

  const updateTheme = useCallback(async (newTheme: Theme) => {
    try {
      const { data: existing, error: findError } = await supabase
        .from('themes')
        .select('id')
        .eq('actif', true)
        .maybeSingle();
      if (findError) throw findError;

      let themeId = existing?.id;
      if (!themeId) {
        const { data: inserted, error: insertError } = await supabase
          .from('themes')
          .insert({ nom: newTheme.nom, actif: true, couleurs: newTheme.couleurs, typographie: newTheme.typographie })
          .select('id')
          .single();
        if (insertError) throw insertError;
        themeId = inserted.id;
      } else {
        const { error: updateError } = await supabase
          .from('themes')
          .update({ couleurs: newTheme.couleurs, typographie: newTheme.typographie, updated_at: new Date().toISOString() })
          .eq('id', themeId);
        if (updateError) throw updateError;
      }

      const updatedTheme = { ...newTheme, id: themeId };
      setTheme(updatedTheme);
      applyThemeCSS(updatedTheme);
    } catch (err: any) {
      console.error('[ThemeContext] Erreur updateTheme:', err);
      throw err;
    }
  }, []);

  const updateComponentStyle = useCallback(async (typeComponent: string, style: Style) => {
    try {
      const { data: activeTheme, error: findError } = await supabase
        .from('themes')
        .select('id')
        .eq('actif', true)
        .maybeSingle();
      if (findError || !activeTheme) throw new Error('Aucun thème actif');
      const themeId = activeTheme.id;

      const { data: existing, error: checkError } = await supabase
        .from('component_styles')
        .select('id')
        .eq('theme_id', themeId)
        .eq('type_component', typeComponent)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        await supabase.from('component_styles').update({ style }).eq('id', existing.id);
      } else {
        await supabase.from('component_styles').insert({ theme_id: themeId, type_component: typeComponent, style });
      }

      setTheme(prev => ({
        ...prev,
        composants: prev.composants.map(c => c.typeComponent === typeComponent ? { ...c, style } : c),
      }));
    } catch (err: any) {
      console.error('[ThemeContext] Erreur updateComponentStyle:', err);
      throw err;
    }
  }, []);

  const updateComponentAnimation = useCallback(async (typeComponent: string, animation: Animation) => {
    try {
      const { data: activeTheme, error: findError } = await supabase
        .from('themes')
        .select('id')
        .eq('actif', true)
        .maybeSingle();
      if (findError || !activeTheme) throw new Error('Aucun thème actif');
      const themeId = activeTheme.id;

      const { data: existing, error: checkError } = await supabase
        .from('component_styles')
        .select('id')
        .eq('theme_id', themeId)
        .eq('type_component', typeComponent)
        .maybeSingle();

      if (checkError && checkError.code !== 'PGRST116') throw checkError;

      if (existing) {
        await supabase.from('component_styles').update({ animation }).eq('id', existing.id);
      } else {
        await supabase.from('component_styles').insert({
          theme_id: themeId,
          type_component: typeComponent,
          style: { proprietes: {} },
          animation,
        });
      }

      setTheme(prev => ({
        ...prev,
        composants: prev.composants.map(c => c.typeComponent === typeComponent ? { ...c, animation } : c),
      }));
    } catch (err: any) {
      console.error('[ThemeContext] Erreur updateComponentAnimation:', err);
      throw err;
    }
  }, []);

  const refreshTheme = useCallback(() => {
    loadedRef.current = false;
    return loadTheme(true);
  }, [loadTheme]);

  const value: ThemeContextType = { theme, loading, error, updateTheme, updateComponentStyle, updateComponentAnimation, refreshTheme };

  return <ThemeContext.Provider value={value}>{children}</ThemeContext.Provider>;
};

export const useTheme = (): ThemeContextType => {
  const context = useContext(ThemeContext);
  if (!context) throw new Error('useTheme must be used within ThemeProvider');
  return context;
};

export const useComponentStyle = (typeComponent: string, styleOverride?: Style, animationOverride?: Animation) => {
  const { theme } = useTheme();
  return resolveComponentForHook(typeComponent, theme, styleOverride, animationOverride);
};

export default ThemeContext;
EOFTHEME

echo "✅ Partie 1 terminée."
