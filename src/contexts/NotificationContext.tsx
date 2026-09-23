/**
 * NotificationContext – Gestion des notifications et annonces en temps réel
 * Version V3 – Compatible React 16
 */

import React, { createContext, useContext, useState, useEffect, useCallback, ReactNode, useRef } from 'react';
import { supabase } from '../lib/supabaseClient';
import { useAuth } from '../hooks/useAuth';
import { useToast } from '../hooks/useToast';
import { create } from 'zustand';
import { ToastItem } from '../components/NotificationToast';
import { Announcement } from '../components/AnnouncementBanner';

// --- Store pour les toasts (notifications métier) ---
interface ToastState {
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
}

export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  addToast: (toast) =>
    set((state) => ({
      toasts: [
        { ...toast, id: `toast-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
        ...state.toasts,
      ].slice(0, 50), // Limite à 50 notifications
    })),
  dismissToast: (id) =>
    set((state) => ({
      toasts: state.toasts.filter((t) => t.id !== id),
    })),
  clearToasts: () => set({ toasts: [] }),
}));

// --- Store pour les annonces (bannières) ---
interface AnnouncementState {
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  dismissAnnouncement: (id: string) => void;
  clearAnnouncements: () => void;
}

export const useAnnouncementStore = create<AnnouncementState>((set) => ({
  announcements: [],
  addAnnouncement: (announcement) =>
    set((state) => ({
      announcements: [
        { ...announcement, id: `announce-${Date.now()}-${Math.random().toString(36).slice(2, 6)}` },
        ...state.announcements,
      ],
    })),
  dismissAnnouncement: (id) =>
    set((state) => ({
      announcements: state.announcements.filter((a) => a.id !== id),
    })),
  clearAnnouncements: () => set({ announcements: [] }),
}));

// --- Contexte combiné ---
interface NotificationContextType {
  // Toasts
  toasts: ToastItem[];
  addToast: (toast: Omit<ToastItem, 'id'>) => void;
  dismissToast: (id: string) => void;
  clearToasts: () => void;
  // Annonces
  announcements: Announcement[];
  addAnnouncement: (announcement: Omit<Announcement, 'id'>) => void;
  dismissAnnouncement: (id: string) => void;
  clearAnnouncements: () => void;
  // État de connexion
  isConnected: boolean;
}

const NotificationContext = createContext<NotificationContextType | null>(null);

// ✅ Éviter d'ajouter l'annonce de bienvenue plusieurs fois

export const NotificationProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const { user } = useAuth();
  const { info } = useToast();
  const [isConnected, setIsConnected] = useState(false);
  const toastStore = useToastStore();
  const announcementStore = useAnnouncementStore();
  const channelsRef = useRef<any[]>([]);
  const isMounted = useRef(true);

  // ✅ Nettoyer les canaux au démontage
  useEffect(() => {
    isMounted.current = true;
    return () => {
      isMounted.current = false;
      channelsRef.current.forEach(ch => {
        try { supabase.removeChannel(ch); } catch {}
      });
      channelsRef.current = [];
    };
  }, []);

  // Connexion Supabase Realtime – UNE SEULE FOIS
  useEffect(() => {
    if (!user) return;

    // ✅ Ajouter l'annonce de bienvenue une seule fois

    const channels: any[] = [];

    // --- Canal Ventes ---
    const ventesChannel = supabase
      .channel('ventes-realtime')
      .on(
        'postgres_changes',
        { event: 'INSERT', schema: 'public', table: 'ventes' },
        (payload) => {
          if (!isMounted.current) return;
          const vente = payload.new;
          toastStore.addToast({
            type: 'success',
            title: '🛒 Nouvelle vente',
            description: `Montant : ${vente.montant_total?.toLocaleString() || '0'} FCFA`,
            duration: 5000,
            grouped: true,
            action: {
              label: 'Voir',
              onClick: () => {
                window.location.href = `/gestion/caisse/ventes/${vente.id}`;
              },
            },
          });
          info(`🛒 Nouvelle vente : ${vente.montant_total?.toLocaleString() || '0'} FCFA`);
        }
      )
      .subscribe((status) => {
        if (status === 'SUBSCRIBED' && isMounted.current) {
          setIsConnected(true);
          console.log('[Notifications] Connecté à Realtime');
        }
      });

    channels.push(ventesChannel);

    // --- Canal Stock (alertes) ---
    const stockChannel = supabase
      .channel('stock-realtime')
      .on(
        'postgres_changes',
        { event: 'UPDATE', schema: 'public', table: 'produits' },
        (payload) => {
          if (!isMounted.current) return;
          const produit = payload.new;
          if (produit.quantite <= produit.seuil_alerte && produit.quantite > 0) {
            toastStore.addToast({
              type: 'warning',
              title: '⚠️ Stock bas',
              description: `${produit.nom} : ${produit.quantite} restant(s)`,
              duration: 8000,
              grouped: true,
              action: {
                label: 'Voir',
                onClick: () => {
                  window.location.href = `/gestion/stocks/produits/${produit.id}`;
                },
              },
            });
            info(`⚠️ Stock bas : ${produit.nom}`);
          }
          if (produit.quantite === 0) {
            toastStore.addToast({
              type: 'error',
              title: '🚫 Rupture de stock',
              description: `${produit.nom} est en rupture`,
              duration: 10000,
              grouped: true,
            });
            info(`🚫 Rupture de stock : ${produit.nom}`);
          }
        }
      )
      .subscribe();

    channels.push(stockChannel);

    channelsRef.current = channels;

    // Nettoyage à la fin
    return () => {
      channels.forEach(ch => {
        try { supabase.removeChannel(ch); } catch {}
      });
      channelsRef.current = [];
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [user]); // ✅ Dépendances minimales pour éviter les boucles

  const value = {
    ...toastStore,
    ...announcementStore,
    isConnected,
  };

  return (
    <NotificationContext.Provider value={value}>
      {children}
    </NotificationContext.Provider>
  );
};

export const useNotifications = (): NotificationContextType => {
  const context = useContext(NotificationContext);
  if (!context) throw new Error('useNotifications must be used within NotificationProvider');
  return context;
};

export default NotificationProvider;
