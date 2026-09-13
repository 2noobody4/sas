import React, { createContext, useContext, useState, useEffect, useRef, ReactNode } from 'react';

interface DiagnosticContextType {
  logs: string[];
  addLog: (message: string) => void;
  clearLogs: () => void;
  isFreeze: boolean;
  lastTick: number;
}

const DiagnosticContext = createContext<DiagnosticContextType | null>(null);

export const DiagnosticProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [logs, setLogs] = useState<string[]>([]);
  const [isFreeze, setIsFreeze] = useState(false);
  const [lastTick, setLastTick] = useState(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Ajouter un log
  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    setLastTick(Date.now());
    console.log(`[Diagnostic] ${message}`);
  };

  // Vider les logs
  const clearLogs = () => {
    setLogs([]);
  };

  // ✅ Détecter les freezes : si pas de tick pendant 5 secondes
  useEffect(() => {
    addLog('🧪 Diagnostic démarré');

    // Tick toutes les secondes
    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - lastTick;
      setLastTick(now);

      // Si plus de 5 secondes sans tick => freeze
      if (diff > 5000 && lastTick > 0) {
        setIsFreeze(true);
        addLog(`❌ FREEZE DÉTECTÉ ! ${diff}ms sans activité`);
      } else {
        setIsFreeze(false);
      }
    }, 1000);

    // Timeout de sécurité : si le composant reste bloqué 10 secondes
    timeoutRef.current = setTimeout(() => {
      addLog('⏰ Timeout de sécurité : 10 secondes écoulées');
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      addLog('🧪 Diagnostic arrêté');
    };
  }, []);

  // ✅ Vérifier que le contexte est toujours actif
  useEffect(() => {
    const checkAlive = setInterval(() => {
      setLastTick(prev => {
        const now = Date.now();
        if (now - prev > 10000) {
          addLog(`⚠️ Attention : ${Math.round((now - prev) / 1000)}s sans activité`);
        }
        return prev;
      });
    }, 5000);
    return () => clearInterval(checkAlive);
  }, []);

  const value = {
    logs,
    addLog,
    clearLogs,
    isFreeze,
    lastTick,
  };

  return (
    <DiagnosticContext.Provider value={value}>
      {children}
      {/* Afficher un indicateur de freeze en bas à droite */}
      {isFreeze && (
        <div className="fixed bottom-24 right-4 z-[9999] bg-red-600 text-white px-4 py-2 rounded-xl shadow-lg animate-pulse text-sm font-bold">
          ⚠️ FREEZE DÉTECTÉ
        </div>
      )}
    </DiagnosticContext.Provider>
  );
};

export const useDiagnostic = (): DiagnosticContextType => {
  const context = useContext(DiagnosticContext);
  if (!context) {
    throw new Error('useDiagnostic must be used within DiagnosticProvider');
  }
  return context;
};

export default DiagnosticProvider;
