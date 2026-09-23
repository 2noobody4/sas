// ============================================================
// USE NAVIGATION HISTORY — Historique de navigation personnalisé
// Version V3 — Compatible React 16
// ============================================================

import { useEffect, useRef, useState } from 'react';
import { useLocation } from 'react-router-dom';

const STORAGE_KEY = 'app-pme-nav-history';
const MAX_HISTORY = 50;

function loadHistory(): string[] {
  try {
    const raw = sessionStorage.getItem(STORAGE_KEY);
    if (!raw) return [];
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function saveHistory(history: string[]) {
  try {
    sessionStorage.setItem(STORAGE_KEY, JSON.stringify(history.slice(-MAX_HISTORY)));
  } catch {
    // ignore
  }
}

export const useNavigationHistory = () => {
  const location = useLocation();
  const historyRef = useRef<string[]>(loadHistory());
  const [history, setHistory] = useState<string[]>(historyRef.current);

  // Enregistrer chaque changement de route
  useEffect(() => {
    const current = location.pathname;
    const last = historyRef.current[historyRef.current.length - 1];

    // Ne pas ajouter si c'est la même route
    if (last === current) return;

    // Routes à ignorer (formulaires, login, etc.)
    const ignoredPrefixes = ['/login', '/register', '/debug'];
    if (ignoredPrefixes.some((p) => current.startsWith(p))) return;

    historyRef.current = [...historyRef.current, current];
    if (historyRef.current.length > MAX_HISTORY) {
      historyRef.current = historyRef.current.slice(-MAX_HISTORY);
    }
    saveHistory(historyRef.current);
    setHistory([...historyRef.current]);
  }, [location.pathname]);

  const clearHistory = () => {
    historyRef.current = [];
    saveHistory([]);
    setHistory([]);
  };

  const goBack = (navigate: (path: string) => void): string | null => {
    const h = historyRef.current;
    if (h.length < 2) return null;

    // Retirer la route actuelle
    h.pop();
    const previous = h[h.length - 1] || '/';
    saveHistory(h);
    setHistory([...h]);
    navigate(previous);
    return previous;
  };

  const canGoBack = history.length >= 2;
  const previousPath = canGoBack ? history[history.length - 2] : null;

  return { history, canGoBack, previousPath, goBack, clearHistory };
};

export default useNavigationHistory;
