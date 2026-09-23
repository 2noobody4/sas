// ============================================================
// USE BOOTSTRAP — Prefetch tout au login
// Version V3 — Compatible React 16
// ------------------------------------------------------------
// Évite les appels en cascade quand on ouvre /gestion.
// ============================================================

import { useEffect, useRef } from 'react';
import { useQueryClient } from 'react-query';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from './useAuth';

export const useBootstrap = () => {
  const queryClient = useQueryClient();
  const { user } = useAuth();
  const bootstrappedRef = useRef<string | null>(null);

  useEffect(() => {
    if (!user?.id) {
      bootstrappedRef.current = null;
      return;
    }

    // Ne pas rebootstrap si déjà fait pour cet utilisateur
    if (bootstrappedRef.current === user.id) return;
    bootstrappedRef.current = user.id;

    const t0 = performance.now();

    // ============================================================
    // Prefetch toutes les queries en parallèle
    // ============================================================

    const prefecth = async () => {
      try {
        // 1. user_config
        queryClient.prefetchQuery(
          ['user_config', user.id],
          async () => {
            const { data, error } = await supabase
              .from('user_config')
              .select('*')
              .eq('user_id', user.id)
              .maybeSingle();
            if (error && error.code !== 'PGRST116') throw error;
            return data || null;
          },
          { staleTime: 1000 * 60 * 60 } // 1h
        );

        // 2. user_modules
        queryClient.prefetchQuery(
          ['user_modules', user.id],
          async () => {
            const { data, error } = await supabase
              .from('user_modules')
              .select('module_id')
              .eq('user_id', user.id)
              .eq('actif', true);
            if (error) throw error;
            return (data || []).map((row: any) => row.module_id);
          },
          { staleTime: 1000 * 60 * 60 }
        );

        // 3. menu_items (overrides)
        queryClient.prefetchQuery(
          ['menu_items'],
          async () => {
            const { data, error } = await supabase
              .from('menu_items')
              .select('id, label, icone, ordre, visible, section, badge_count, badge_color, disabled, permission');
            if (error) throw error;
            return data || [];
          },
          { staleTime: 1000 * 60 * 60 }
        );

        await Promise.all([
          queryClient.getQueryCache().findAll().map(() => Promise.resolve()),
        ]);

        const duration = Math.round(performance.now() - t0);
        console.log(`[Bootstrap] Prefetch terminé en ${duration}ms`);
      } catch (err) {
        console.warn('[Bootstrap] Erreur prefetch:', err);
      }
    };

    prefecth();
  }, [user?.id, queryClient]);
};

export default useBootstrap;
