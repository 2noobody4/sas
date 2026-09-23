// ============================================================
// THEME CONTEXT — Gestion du thème actif
// Version V3.5 — Sauvegarde animations fiabilisée
// ------------------------------------------------------------
// - updateComponentAnimation avec select + update/insert
//   (plus d'upsert → plus de besoin de contrainte UNIQUE)
// - Logs détaillés en dev
// - Erreurs propagées
// ============================================================

import React, {
  createContext,
  useContext,
  useState,
  useEffect,
  useCallback,
  useRef,
} from 'react';
import { supabase } from '../lib/supabaseClient';
import { useConfig } from './ConfigContext';
import { Theme, Style, Animation, ThemeContextType } from '../types/theme-types';
import { resolveComponentForHook } from '../lib/resolveComponent';
import { THEME_PAR_DEFAUT } from '../lib/theme-default';

function mergeWithDefaults<T extends Record<string, any>>(
  loaded: T | null | undefined,
  defaults: T
): T {
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

function setColorVariable(root: HTMLElement, key: string, value: string) {
  root.style.setProperty(`--color-${key}`, value);
  const kebabFull = key.replace(/([A-Z])/g, '-$1').toLowerCase().replace(/^-/, '');
  if (kebabFull !== key.toLowerCase()) {
    root.style.setProperty(`--color-${kebabFull}`, value);
  }
  const kebabPartial = key.replace(/([a-z])([A-Z])/g, '$1-$2');
  if (kebabPartial !== key) {
    root.style.setProperty(`--color-${kebabPartial}`, value);
  }
}

function applyThemeCSS(theme: Theme, fontFamilyOverride?: string) {
  const root = document.documentElement;
  if (!root) return;

  if (theme.couleurs) {
    Object.entries(theme.couleurs).forEach(([key, value]) => {
      if (typeof value === 'string') {
        setColorVariable(root, key, value);
      }
    });
  }

  if (theme.typographie) {
    const titre = theme.typographie.policeTitre || "'Sora', sans-serif";
    const texte = fontFamilyOverride
      ? `'${fontFamilyOverride}', sans-serif`
      : theme.typographie.policeTexte || "'Inter', sans-serif";
    const chiffres = theme.typographie.policeChiffres || "'IBM Plex Mono', monospace";

    root.style.setProperty('--font-title', titre);
    root.style.setProperty('--font-body', texte);
    root.style.setProperty('--font-mono', chiffres);
    document.body.style.fontFamily = texte;
  }
}

const ThemeContext = createContext<ThemeContextType | null>(null);

export const ThemeProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const config = useConfig();
  const [theme, setTheme] = useState<Theme>(THEME_PAR_DEFAUT);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const loadedRef = useRef(false);

  // ---- Charger le thème ----
  const loadTheme = useCallback(
    async (force = false) => {
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
          applyThemeCSS(THEME_PAR_DEFAUT, config.font_family);
          loadedRef.current = true;
          setLoading(false);
          return;
        }

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
          composants:
            components && components.length > 0
              ? components.map((c: any) => ({
                  id: c.id,
                  typeComponent: c.type_component,
                  style: c.style || { proprietes: {} },
                  animation: c.animation || undefined,
                }))
              : THEME_PAR_DEFAUT.composants,
        };

        if (process.env.NODE_ENV === 'development') {
          console.log('[ThemeContext] ✓ Thème chargé:', {
            themeId: themeData.id,
            composants: loadedTheme.composants.length,
            avecAnimations: loadedTheme.composants.filter((c) => c.animation).length,
          });
        }

        setTheme(loadedTheme);
        applyThemeCSS(loadedTheme, config.font_family);
        loadedRef.current = true;
      } catch (err: any) {
        console.error('[ThemeContext] Erreur:', err);
        setError(err.message);
        setTheme(THEME_PAR_DEFAUT);
        applyThemeCSS(THEME_PAR_DEFAUT, config.font_family);
        loadedRef.current = true;
      } finally {
        setLoading(false);
      }
    },
    [config]
  );

  useEffect(() => {
    if (config.loaded) loadTheme();
  }, [config.loaded, loadTheme]);

  useEffect(() => {
    applyThemeCSS(theme, config.font_family);
  }, [theme, config.font_family]);

  // ---- Sauvegarder le thème complet ----
  const updateTheme = useCallback(
    async (newTheme: Theme) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) throw new Error('Utilisateur non authentifié');

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
            .insert({
              nom: newTheme.nom,
              actif: true,
              couleurs: newTheme.couleurs,
              typographie: newTheme.typographie,
            })
            .select('id')
            .single();
          if (insertError) throw insertError;
          themeId = inserted.id;
        } else {
          const { error: updateError } = await supabase
            .from('themes')
            .update({
              couleurs: newTheme.couleurs,
              typographie: newTheme.typographie,
              updated_at: new Date().toISOString(),
            })
            .eq('id', themeId);
          if (updateError) throw updateError;
        }

        // Sauvegarder chaque composant (select + update/insert)
        for (const comp of newTheme.composants) {
          const { data: existingComp } = await supabase
            .from('component_styles')
            .select('id')
            .eq('theme_id', themeId)
            .eq('type_component', comp.typeComponent)
            .maybeSingle();

          if (existingComp) {
            await supabase
              .from('component_styles')
              .update({
                style: comp.style,
                animation: comp.animation || null,
                updated_at: new Date().toISOString(),
              })
              .eq('id', existingComp.id);
          } else {
            await supabase
              .from('component_styles')
              .insert({
                theme_id: themeId,
                type_component: comp.typeComponent,
                style: comp.style,
                animation: comp.animation || null,
                user_id: user.id,
              });
          }
        }

        const updatedTheme = { ...newTheme, id: themeId };
        setTheme(updatedTheme);
        applyThemeCSS(updatedTheme, config.font_family);
      } catch (err: any) {
        console.error('[ThemeContext] Erreur updateTheme:', err);
        throw err;
      }
    },
    [config.font_family]
  );

  // ---- Mettre à jour un style de composant ----
  const updateComponentStyle = useCallback(async (typeComponent: string, style: Style) => {
    try {
      const { data: { user } } = await supabase.auth.getUser();
      if (!user?.id) throw new Error('Utilisateur non authentifié');

      const { data: activeTheme, error: findError } = await supabase
        .from('themes')
        .select('id')
        .eq('actif', true)
        .maybeSingle();
      if (findError || !activeTheme) throw new Error('Aucun thème actif');
      const themeId = activeTheme.id;

      const { data: existing } = await supabase
        .from('component_styles')
        .select('id')
        .eq('theme_id', themeId)
        .eq('type_component', typeComponent)
        .maybeSingle();

      if (existing) {
        const { error } = await supabase
          .from('component_styles')
          .update({ style, updated_at: new Date().toISOString() })
          .eq('id', existing.id);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('component_styles').insert({
          theme_id: themeId,
          type_component: typeComponent,
          style,
          user_id: user.id,
        });
        if (error) throw error;
      }

      setTheme((prev) => ({
        ...prev,
        composants: prev.composants.map((c) =>
          c.typeComponent === typeComponent ? { ...c, style } : c
        ),
      }));
    } catch (err: any) {
      console.error('[ThemeContext] Erreur updateComponentStyle:', err);
      throw err;
    }
  }, []);

  // ---- ⭐ Mettre à jour une animation de composant (CORRIGÉ) ----
  const updateComponentAnimation = useCallback(
    async (typeComponent: string, animation: Animation) => {
      try {
        const { data: { user } } = await supabase.auth.getUser();
        if (!user?.id) throw new Error('Utilisateur non authentifié');

        const { data: activeTheme, error: findError } = await supabase
          .from('themes')
          .select('id')
          .eq('actif', true)
          .maybeSingle();

        if (findError) throw new Error('Erreur recherche thème : ' + findError.message);
        if (!activeTheme) throw new Error('Aucun thème actif');

        const themeId = activeTheme.id;

        // 1. Vérifier si une ligne existe déjà
        const { data: existing, error: selectError } = await supabase
          .from('component_styles')
          .select('id')
          .eq('theme_id', themeId)
          .eq('type_component', typeComponent)
          .maybeSingle();

        if (selectError && selectError.code !== 'PGRST116') {
          throw new Error('Erreur lecture : ' + selectError.message);
        }

        let savedRow: any = null;

        if (existing) {
          // 2a. Update
          const { data, error } = await supabase
            .from('component_styles')
            .update({
              animation,
              updated_at: new Date().toISOString(),
            })
            .eq('id', existing.id)
            .select()
            .single();

          if (error) throw new Error('Erreur update : ' + error.message);
          savedRow = data;
        } else {
          // 2b. Insert
          const { data, error } = await supabase
            .from('component_styles')
            .insert({
              theme_id: themeId,
              type_component: typeComponent,
              animation,
              user_id: user.id,
            })
            .select()
            .single();

          if (error) throw new Error('Erreur insert : ' + error.message);
          savedRow = data;
        }

        if (process.env.NODE_ENV === 'development') {
          console.log('[ThemeContext] ✓ Animation sauvegardée:', {
            typeComponent,
            animation,
            row: savedRow,
          });
        }

        // 3. Mettre à jour l'état local
        setTheme((prev) => ({
          ...prev,
          composants: prev.composants.map((c) =>
            c.typeComponent === typeComponent ? { ...c, animation } : c
          ),
        }));
      } catch (err: any) {
        console.error('[ThemeContext] ✗ updateComponentAnimation:', err);
        throw err;
      }
    },
    []
  );

  // ---- Recharger le thème ----
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

export const useComponentStyle = (
  typeComponent: string,
  styleOverride?: Style,
  animationOverride?: Animation
) => {
  const { theme } = useTheme();
  return resolveComponentForHook(typeComponent, theme, styleOverride, animationOverride);
};

export default ThemeContext;
