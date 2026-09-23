// ============================================================
// USE SESSION GUARD — Expire la session + déconnexion inactivité
// Version V3 — Compatible React 16
// ============================================================

import { useEffect, useRef, useCallback } from 'react';
import { useHistory } from 'react-router-dom';
import { useConfig } from '../contexts/ConfigContext';
import { useAuth } from './useAuth';
import { useToast } from './useToast';

const SESSION_START_KEY = 'app-pme-session-start';
const ACTIVITY_KEY = 'app-pme-last-activity';

const ACTIVITY_EVENTS = ['mousedown', 'keydown', 'touchstart', 'scroll', 'click'];

export const useSessionGuard = () => {
  const config = useConfig();
  const { user, logout } = useAuth();
  const history = useHistory();
  const { info } = useToast();

  const sessionDurationRef = useRef(config.session_duration ?? 60);
  const inactivityRef = useRef(config.inactivity_timeout ?? 15);
  const loggingOutRef = useRef(false);

  // Mettre à jour les refs quand la config change
  useEffect(() => {
    sessionDurationRef.current = config.session_duration ?? 60;
    inactivityRef.current = config.inactivity_timeout ?? 15;
  }, [config.session_duration, config.inactivity_timeout]);

  const forceLogout = useCallback(async (reason: string) => {
    if (loggingOutRef.current) return;
    loggingOutRef.current = true;

    try {
      await logout();
      info(reason);
      history.push('/login');
    } catch (e) {
      console.warn('[SessionGuard] Erreur logout:', e);
    } finally {
      loggingOutRef.current = false;
    }
  }, [logout, history, info]);

  // ----- Init session à la connexion -----
  useEffect(() => {
    if (!user) {
      try {
        sessionStorage.removeItem(SESSION_START_KEY);
        sessionStorage.removeItem(ACTIVITY_KEY);
      } catch {}
      return;
    }

    const now = Date.now();
    if (!sessionStorage.getItem(SESSION_START_KEY)) {
      sessionStorage.setItem(SESSION_START_KEY, String(now));
    }
    sessionStorage.setItem(ACTIVITY_KEY, String(now));
  }, [user]);

  // ----- Check périodique -----
  useEffect(() => {
    if (!user) return;

    const checkInterval = setInterval(() => {
      const now = Date.now();

      // 1. Session expirée ?
      const sessionStart = Number(sessionStorage.getItem(SESSION_START_KEY) || now);
      const sessionMinutes = (now - sessionStart) / 60000;
      if (sessionMinutes >= sessionDurationRef.current) {
        forceLogout('Session expirée. Reconnectez-vous.');
        return;
      }

      // 2. Inactivité trop longue ?
      const lastActivity = Number(sessionStorage.getItem(ACTIVITY_KEY) || now);
      const inactiveMinutes = (now - lastActivity) / 60000;
      if (inactiveMinutes >= inactivityRef.current) {
        forceLogout('Déconnexion automatique pour inactivité.');
        return;
      }
    }, 30000); // toutes les 30 secondes

    return () => clearInterval(checkInterval);
  }, [user, forceLogout]);

  // ----- Tracker l'activité utilisateur -----
  useEffect(() => {
    if (!user) return;

    const handleActivity = () => {
      try {
        sessionStorage.setItem(ACTIVITY_KEY, String(Date.now()));
      } catch {}
    };

    ACTIVITY_EVENTS.forEach((event) => {
      window.addEventListener(event, handleActivity, { passive: true });
    });

    return () => {
      ACTIVITY_EVENTS.forEach((event) => {
        window.removeEventListener(event, handleActivity);
      });
    };
  }, [user]);
};

export default useSessionGuard;
