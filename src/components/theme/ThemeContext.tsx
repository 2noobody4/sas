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

      // 1. Charger le thème actif
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

      // 2. Charger les styles des composants depuis la table component_styles
      const { data: components, error: componentsError } = await supabase
        .from('component_styles')
        .select('*')
        .eq('theme_id', themeData.id);

      if (componentsError) {
        console.warn('[ThemeContext] Erreur chargement composants:', componentsError);
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
        composants: components && components.length > 0
          ? components.map((c: any) => ({
              id: c.id,
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

      // Mettre à jour les composants
      for (const comp of newTheme.composants) {
        const { error: upsertError } = await supabase
          .from('component_styles')
          .upsert({
            theme_id: themeId,
            type_component: comp.typeComponent,
            style: comp.style,
            animation: comp.animation || null,
          }, {
            onConflict: 'type_component,theme_id',
          });
        if (upsertError) {
          console.warn('[ThemeContext] Erreur upsert composant:', upsertError);
        }
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

      const { error: upsertError } = await supabase
        .from('component_styles')
        .upsert({
          theme_id: themeId,
          type_component: typeComponent,
          style,
        }, {
          onConflict: 'type_component,theme_id',
        });

      if (upsertError) throw upsertError;

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

      const { error: upsertError } = await supabase
        .from('component_styles')
        .upsert({
          theme_id: themeId,
          type_component: typeComponent,
          animation,
        }, {
          onConflict: 'type_component,theme_id',
        });

      if (upsertError) throw upsertError;

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

  const value: ThemeContextType = {
    theme,
    loading,
    error,
    updateTheme,
    updateComponentStyle,
    updateComponentAnimation,
    refreshTheme,
  };

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
