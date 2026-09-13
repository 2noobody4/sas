#!/bin/bash
echo "🔄 Partie 2/2 : Restauration de ConfigContext, useAuth et useProduits"

cat > src/contexts/ConfigContext.tsx << 'EOFCONFIG'
import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useLocalStorage } from '../hooks/useLocalStorage';

export interface AppConfig {
  id?: string;
  storeName: string;
  logo_url: string;
  header_style: string;
  navbar_style: string;
  nav_background_color: string;
  locale: string;
  currency: string;
  timezone: string;
  dateFormat: string;
  enableNotifications: boolean;
  theme_mode: string;
  font_family: string;
  animations_enabled: boolean;
  push_enabled: boolean;
  in_app_notifications: boolean;
  sound_enabled: boolean;
  show_badges: boolean;
  storeEmail: string;
  storePhone: string;
  storeAddress: string;
  facebook_url: string;
  twitter_url: string;
  instagram_url: string;
  linkedin_url: string;
  youtube_url: string;
  tiktok_url: string;
  themeId?: string | null;
  session_duration: number;
  inactivity_timeout: number;
  two_factor_auth: boolean;
  maintenance_mode: boolean;
  app_version: string;
  log_level: string;
  cache_enabled: boolean;
  sidebar_shortcuts: string[];
  loaded: boolean;
  loading: boolean;
  error: string | null;
}

const DEFAULT_CONFIG: AppConfig = {
  id: undefined,
  storeName: 'Ma Boutique',
  logo_url: '',
  header_style: 'classic',
  navbar_style: 'classic',
  nav_background_color: '#FFFFFF',
  locale: 'fr',
  currency: 'XOF',
  timezone: 'Africa/Dakar',
  dateFormat: 'DD/MM/YYYY',
  enableNotifications: true,
  theme_mode: 'light',
  font_family: 'Inter',
  animations_enabled: true,
  push_enabled: true,
  in_app_notifications: true,
  sound_enabled: true,
  show_badges: true,
  storeEmail: '',
  storePhone: '',
  storeAddress: '',
  facebook_url: '',
  twitter_url: '',
  instagram_url: '',
  linkedin_url: '',
  youtube_url: '',
  tiktok_url: '',
  themeId: null,
  session_duration: 60,
  inactivity_timeout: 15,
  two_factor_auth: false,
  maintenance_mode: false,
  app_version: 'v3.0.0',
  log_level: 'info',
  cache_enabled: true,
  sidebar_shortcuts: [],
  loaded: false,
  loading: true,
  error: null,
};

const CONFIG_STORAGE_KEY = 'app_config_cache';

const ConfigContext = createContext<AppConfig & { refreshConfig: () => Promise<void> } | null>(null);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { value: cachedConfig, setValue: setCachedConfig } = useLocalStorage<AppConfig>(CONFIG_STORAGE_KEY, DEFAULT_CONFIG);
  const [config, setConfig] = useState<AppConfig>(() => cachedConfig || DEFAULT_CONFIG);

  const loadConfig = useCallback(async () => {
    try {
      setConfig(prev => ({ ...prev, loading: true }));
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[ConfigContext] Erreur:', error);
        setConfig({ ...DEFAULT_CONFIG, loaded: true, loading: false });
        return;
      }

      let newConfig: AppConfig;
      if (data) {
        newConfig = {
          id: data.id || '00000000-0000-0000-0000-000000000000',
          storeName: data.store_name || DEFAULT_CONFIG.storeName,
          logo_url: data.logo_url || DEFAULT_CONFIG.logo_url,
          header_style: data.header_style || DEFAULT_CONFIG.header_style,
          navbar_style: data.navbar_style || DEFAULT_CONFIG.navbar_style,
          nav_background_color: data.nav_background_color || DEFAULT_CONFIG.nav_background_color,
          locale: data.locale || DEFAULT_CONFIG.locale,
          currency: data.currency || DEFAULT_CONFIG.currency,
          timezone: data.timezone || DEFAULT_CONFIG.timezone,
          dateFormat: data.date_format || DEFAULT_CONFIG.dateFormat,
          enableNotifications: data.enable_notifications ?? DEFAULT_CONFIG.enableNotifications,
          theme_mode: data.theme_mode || DEFAULT_CONFIG.theme_mode,
          font_family: data.font_family || DEFAULT_CONFIG.font_family,
          animations_enabled: data.animations_enabled ?? DEFAULT_CONFIG.animations_enabled,
          push_enabled: data.push_enabled ?? DEFAULT_CONFIG.push_enabled,
          in_app_notifications: data.in_app_notifications ?? DEFAULT_CONFIG.in_app_notifications,
          sound_enabled: data.sound_enabled ?? DEFAULT_CONFIG.sound_enabled,
          show_badges: data.show_badges ?? DEFAULT_CONFIG.show_badges,
          storeEmail: data.store_email || DEFAULT_CONFIG.storeEmail,
          storePhone: data.store_phone || DEFAULT_CONFIG.storePhone,
          storeAddress: data.store_address || DEFAULT_CONFIG.storeAddress,
          facebook_url: data.facebook_url || DEFAULT_CONFIG.facebook_url,
          twitter_url: data.twitter_url || DEFAULT_CONFIG.twitter_url,
          instagram_url: data.instagram_url || DEFAULT_CONFIG.instagram_url,
          linkedin_url: data.linkedin_url || DEFAULT_CONFIG.linkedin_url,
          youtube_url: data.youtube_url || DEFAULT_CONFIG.youtube_url,
          tiktok_url: data.tiktok_url || DEFAULT_CONFIG.tiktok_url,
          themeId: data.theme_id || null,
          session_duration: data.session_duration ?? DEFAULT_CONFIG.session_duration,
          inactivity_timeout: data.inactivity_timeout ?? DEFAULT_CONFIG.inactivity_timeout,
          two_factor_auth: data.two_factor_auth ?? DEFAULT_CONFIG.two_factor_auth,
          maintenance_mode: data.maintenance_mode ?? DEFAULT_CONFIG.maintenance_mode,
          app_version: data.app_version || DEFAULT_CONFIG.app_version,
          log_level: data.log_level || DEFAULT_CONFIG.log_level,
          cache_enabled: data.cache_enabled ?? DEFAULT_CONFIG.cache_enabled,
          sidebar_shortcuts: data.sidebar_shortcuts || [],
          loaded: true,
          loading: false,
          error: null,
        };
      } else {
        newConfig = { ...DEFAULT_CONFIG, loaded: true, loading: false };
      }

      setConfig(newConfig);
      setCachedConfig(newConfig);
    } catch (err: any) {
      console.error('[ConfigContext] Erreur fatale:', err);
      setConfig({ ...DEFAULT_CONFIG, loaded: true, loading: false, error: err.message });
    }
  }, [setCachedConfig]);

  useEffect(() => {
    loadConfig();
  }, [loadConfig]);

  const refreshConfig = useCallback(async () => {
    await loadConfig();
  }, [loadConfig]);

  return (
    <ConfigContext.Provider value={{ ...config, refreshConfig }}>
      {children}
    </ConfigContext.Provider>
  );
};

export const useConfig = (): AppConfig & { refreshConfig: () => Promise<void> } => {
  const context = useContext(ConfigContext);
  if (!context) throw new Error('useConfig must be used within ConfigProvider');
  return context;
};

export default ConfigProvider;
EOFCONFIG

cat > src/hooks/useAuth.ts << 'EOFAUTH'
import { useState, useEffect, useCallback } from 'react';
import { supabase } from '../lib/supabaseClient';
import { User as SupabaseUser } from '@supabase/supabase-js';

export interface User {
  id: string;
  email: string;
  nom?: string;
  prenom?: string;
  role?: {
    id: string;
    nom: string;
    permissions: string[];
  };
}

export interface AuthState {
  user: User | null;
  loading: boolean;
  error: string | null;
}

export interface LoginResult {
  success: boolean;
  error?: string;
}

export interface RegisterResult {
  success: boolean;
  error?: string;
  user?: SupabaseUser;
}

export const useAuth = () => {
  const [state, setState] = useState<AuthState>({
    user: null,
    loading: true,
    error: null,
  });

  const [stableUser, setStableUser] = useState<User | null>(null);

  const loadUser = useCallback(async (): Promise<User | null> => {
    try {
      const { data: { user: supabaseUser }, error } = await supabase.auth.getUser();

      if (error && error.name !== 'AuthSessionMissingError') {
        throw error;
      }

      if (!supabaseUser) {
        setState({ user: null, loading: false, error: null });
        setStableUser(null);
        return null;
      }

      const { data: userData, error: userError } = await supabase
        .from('users')
        .select('id, nom, prenom, email, role_id')
        .eq('id', supabaseUser.id)
        .maybeSingle();

      if (userError) {
        console.warn('Erreur chargement utilisateur:', userError);
      }

      let role = undefined;
      if (userData?.role_id) {
        const { data: roleData, error: roleError } = await supabase
          .from('roles')
          .select('id, nom, permissions')
          .eq('id', userData.role_id)
          .maybeSingle();

        if (roleError) {
          console.warn('Erreur chargement rôle:', roleError);
        } else if (roleData) {
          role = {
            id: roleData.id,
            nom: roleData.nom,
            permissions: roleData.permissions || [],
          };
        }
      }

      const newUser: User = {
        id: supabaseUser.id,
        email: supabaseUser.email || '',
        nom: userData?.nom || '',
        prenom: userData?.prenom || '',
        role,
      };

      setStableUser(prev => (prev && prev.id === newUser.id ? prev : newUser));
      setState({ user: newUser, loading: false, error: null });

      return newUser;
    } catch (err: any) {
      if (err.name === 'AuthSessionMissingError' || err.message?.includes('Auth session missing')) {
        setState({ user: null, loading: false, error: null });
        setStableUser(null);
        return null;
      }
      console.error('Erreur chargement utilisateur:', err);
      setState({ user: null, loading: false, error: err.message });
      setStableUser(null);
      return null;
    }
  }, []);

  const refreshUser = useCallback(async () => {
    await loadUser();
  }, [loadUser]);

  const updateUserRole = useCallback(async (roleNom: string): Promise<void> => {
    if (!state.user) throw new Error('Utilisateur non connecté');

    const { data: roleData, error: roleError } = await supabase
      .from('roles')
      .select('id')
      .eq('nom', roleNom)
      .maybeSingle();

    if (roleError) throw new Error('Erreur lors de la récupération du rôle: ' + roleError.message);
    if (!roleData) throw new Error(`Rôle "${roleNom}" introuvable`);

    const roleId = roleData.id;

    const { error: updateError } = await supabase
      .from('users')
      .update({ role_id: roleId })
      .eq('id', state.user.id);

    if (updateError) throw new Error('Erreur lors de la mise à jour du rôle: ' + updateError.message);

    await loadUser();
  }, [state.user, loadUser]);

  useEffect(() => {
    loadUser();

    const { data } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_IN' && session?.user) {
        loadUser();
      } else if (event === 'SIGNED_OUT') {
        setState({ user: null, loading: false, error: null });
        setStableUser(null);
      }
    });

    return () => {
      data?.subscription?.unsubscribe();
    };
  }, [loadUser]);

  const login = useCallback(async (email: string, password: string): Promise<LoginResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) throw error;
      await loadUser();
      return { success: true };
    } catch (err: any) {
      const errorMessage = err.message === 'Invalid login credentials'
        ? 'Email ou mot de passe incorrect'
        : 'Erreur de connexion: ' + err.message;
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, [loadUser]);

  const register = useCallback(async (
    email: string,
    password: string,
    nom: string,
    prenom: string
  ): Promise<RegisterResult> => {
    setState(prev => ({ ...prev, loading: true, error: null }));
    try {
      const { data: roleData, error: roleError } = await supabase
        .from('roles')
        .select('id')
        .eq('nom', 'client')
        .maybeSingle();

      if (roleError && roleError.code !== 'PGRST116') {
        throw new Error('Erreur lors de la vérification du rôle: ' + roleError.message);
      }

      let roleId = roleData?.id || null;

      if (!roleId) {
        const { data: newRole, error: createError } = await supabase
          .from('roles')
          .upsert(
            { nom: 'client', description: 'Client standard', permissions: [] },
            { onConflict: 'nom' }
          )
          .select()
          .single();

        if (createError || !newRole) {
          throw new Error('Impossible de créer le rôle client: ' + (createError?.message || 'inconnu'));
        }
        roleId = newRole.id;
      }

      const { data: authData, error: authError } = await supabase.auth.signUp({
        email,
        password,
        options: {
          data: { nom, prenom },
        },
      });

      if (authError) {
        let friendlyMessage = 'Erreur lors de l\'inscription. ';
        if (authError.message.includes('already registered')) {
          friendlyMessage += 'Cet email est déjà utilisé. Veuillez vous connecter.';
        } else if (authError.message.includes('Database error saving new user')) {
          friendlyMessage += 'Problème technique. Contactez le support.';
        } else {
          friendlyMessage += authError.message;
        }
        setState(prev => ({ ...prev, loading: false, error: friendlyMessage }));
        return { success: false, error: friendlyMessage };
      }

      if (!authData.user) {
        throw new Error('Aucun utilisateur créé');
      }

      const { error: upsertError } = await supabase
        .from('users')
        .upsert({
          id: authData.user.id,
          nom,
          prenom,
          email,
          actif: true,
          role_id: roleId,
        }, {
          onConflict: 'id',
        });

      if (upsertError) {
        const errorMessage = 'Compte créé mais profil non enregistré: ' + upsertError.message;
        setState(prev => ({ ...prev, loading: false, error: errorMessage }));
        return { success: false, error: errorMessage, user: authData.user };
      }

      setState(prev => ({ ...prev, loading: false }));
      return { success: true, user: authData.user };

    } catch (err: any) {
      const errorMessage = err.message || 'Erreur inattendue';
      setState(prev => ({ ...prev, loading: false, error: errorMessage }));
      return { success: false, error: errorMessage };
    }
  }, []);

  const logout = useCallback(async () => {
    await supabase.auth.signOut();
    setState({ user: null, loading: false, error: null });
    setStableUser(null);
  }, []);

  return {
    ...state,
    user: stableUser,
    login,
    register,
    logout,
    loadUser,
    refreshUser,
    updateUserRole,
  };
};

export default useAuth;
EOFAUTH

# On ajoute la fonction useProduitsFilters à la fin de useProduits.ts
echo "export const useProduitsFilters = () => {
  const { value: filters, setValue: setFilters } = useLocalStorage<{ categorie?: string; search?: string }>('produits_filters', {});
  return { filters, setFilters };
};" >> src/hooks/useProduits.ts

echo "✅ Partie 2 terminée."
echo "👉 Redémarrez l'application avec : npm start"
