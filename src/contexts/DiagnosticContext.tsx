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
  const lastTickRef = useRef(Date.now());
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);

  const addLog = (message: string) => {
    const timestamp = new Date().toLocaleTimeString();
    setLogs(prev => [...prev, `[${timestamp}] ${message}`]);
    lastTickRef.current = Date.now();
    setLastTick(lastTickRef.current);
    console.log(`[Diagnostic] ${message}`);
  };

  const clearLogs = () => setLogs([]);

  useEffect(() => {
    addLog('🧪 Diagnostic démarré');

    intervalRef.current = setInterval(() => {
      const now = Date.now();
      const diff = now - lastTickRef.current;
      lastTickRef.current = now;
      setLastTick(now);

      if (diff > 5000) {
        setIsFreeze(true);
        addLog(`❌ FREEZE DÉTECTÉ ! ${diff}ms sans activité`);
      } else {
        setIsFreeze(false);
      }
    }, 1000);

    timeoutRef.current = setTimeout(() => {
      addLog('⏰ Timeout de sécurité : 10 secondes écoulées');
    }, 10000);

    return () => {
      if (intervalRef.current) clearInterval(intervalRef.current);
      if (timeoutRef.current) clearTimeout(timeoutRef.current);
      addLog('🧪 Diagnostic arrêté');
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const value = { logs, addLog, clearLogs, isFreeze, lastTick };

  return (
    <DiagnosticContext.Provider value={value}>
      {children}
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
  if (!context) throw new Error('useDiagnostic must be used within DiagnosticProvider');
  return context;
};

export default DiagnosticProvider;
