import React, { createContext, useContext, useState, useEffect, ReactNode, useCallback, useRef } from 'react';
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
  // ============================================================
  // BOUTIQUE & SERVICES
  // ============================================================
  show_boutique: boolean;
  show_services: boolean;
  boutique_display_mode: 'grid' | 'list';
  service_display_mode: 'full' | 'compact';
  products_per_page: number;
  services_per_page: number;
  // ============================================================
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
  // Boutique & Services
  show_boutique: true,
  show_services: true,
  boutique_display_mode: 'grid',
  service_display_mode: 'full',
  products_per_page: 12,
  services_per_page: 12,
  loaded: false,
  loading: true,
  error: null,
};

const CONFIG_STORAGE_KEY = 'app_config_cache';

const ConfigContext = createContext<AppConfig & { refreshConfig: () => Promise<void> } | null>(null);

export const ConfigProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { value: cachedConfig, setValue: setCachedConfig } = useLocalStorage<AppConfig>(CONFIG_STORAGE_KEY, DEFAULT_CONFIG);
  const [config, setConfig] = useState<AppConfig>(() => cachedConfig || DEFAULT_CONFIG);
  const loadingRef = useRef(false);
  const mountedRef = useRef(true);

  const loadConfig = useCallback(async () => {
    if (loadingRef.current) return;
    loadingRef.current = true;

    try {
      setConfig(prev => ({ ...prev, loading: true }));
      
      const { data, error } = await supabase
        .from('config')
        .select('*')
        .limit(1)
        .maybeSingle();

      if (error && error.code !== 'PGRST116') {
        console.warn('[ConfigContext] Erreur:', error);
        if (mountedRef.current) {
          setConfig({ ...DEFAULT_CONFIG, loaded: true, loading: false });
        }
        loadingRef.current = false;
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
          // Boutique & Services
          show_boutique: data.show_boutique ?? DEFAULT_CONFIG.show_boutique,
          show_services: data.show_services ?? DEFAULT_CONFIG.show_services,
          boutique_display_mode: data.boutique_display_mode || DEFAULT_CONFIG.boutique_display_mode,
          service_display_mode: data.service_display_mode || DEFAULT_CONFIG.service_display_mode,
          products_per_page: data.products_per_page ?? DEFAULT_CONFIG.products_per_page,
          services_per_page: data.services_per_page ?? DEFAULT_CONFIG.services_per_page,
          loaded: true,
          loading: false,
          error: null,
        };
      } else {
        newConfig = { ...DEFAULT_CONFIG, loaded: true, loading: false };
      }

      if (mountedRef.current) {
        setConfig(newConfig);
        setCachedConfig(newConfig);
      }
    } catch (err: any) {
      console.error('[ConfigContext] Erreur fatale:', err);
      if (mountedRef.current) {
        setConfig({ ...DEFAULT_CONFIG, loaded: true, loading: false, error: err.message });
      }
    } finally {
      loadingRef.current = false;
    }
  }, [setCachedConfig]);

  useEffect(() => {
    mountedRef.current = true;
    loadConfig();
    return () => {
      mountedRef.current = false;
    };
  }, [loadConfig]);

  const refreshConfig = useCallback(async () => {
    loadingRef.current = false;
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
