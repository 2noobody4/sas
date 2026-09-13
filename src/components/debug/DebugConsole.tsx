/**
 * DebugConsole – Pop-up de débogage pour afficher les logs
 * Utilise MotionBox pour l'animation
 * Compatible React 16.14
 */

import React, { useState, useEffect, useRef } from 'react';
import { MotionBox } from '../ui/MotionBox';
import { X, Terminal, Trash2, Copy, Download, Filter } from 'lucide-react';

interface LogEntry {
  id: number;
  timestamp: string;
  level: 'log' | 'info' | 'warn' | 'error' | 'debug';
  message: string;
  data?: any;
}

interface DebugConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

// Stockage global des logs
let logs: LogEntry[] = [];
let logIdCounter = 0;
let listeners: ((logs: LogEntry[]) => void)[] = [];

// Fonction pour ajouter un log
export const addLog = (level: LogEntry['level'], message: string, data?: any) => {
  const entry: LogEntry = {
    id: logIdCounter++,
    timestamp: new Date().toISOString(),
    level,
    message,
    data,
  };
  logs.push(entry);
  listeners.forEach(listener => listener(logs));
};

// Intercepter console.log, console.error, etc.
const originalConsoleLog = console.log;
const originalConsoleInfo = console.info;
const originalConsoleWarn = console.warn;
const originalConsoleError = console.error;

console.log = (...args: any[]) => {
  originalConsoleLog(...args);
  addLog('log', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '), args);
};

console.info = (...args: any[]) => {
  originalConsoleInfo(...args);
  addLog('info', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '), args);
};

console.warn = (...args: any[]) => {
  originalConsoleWarn(...args);
  addLog('warn', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '), args);
};

console.error = (...args: any[]) => {
  originalConsoleError(...args);
  addLog('error', args.map(a => typeof a === 'string' ? a : JSON.stringify(a)).join(' '), args);
};

// Fonction pour ajouter un log personnalisé depuis l'application
export const debugLog = (message: string, data?: any) => {
  addLog('debug', message, data);
};

export const DebugConsole: React.FC<DebugConsoleProps> = ({ isOpen, onClose }) => {
  const [localLogs, setLocalLogs] = useState<LogEntry[]>(logs);
  const [filterLevel, setFilterLevel] = useState<string>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [autoScroll, setAutoScroll] = useState(true);
  const logsContainerRef = useRef<HTMLDivElement>(null);
  const [isMinimized, setIsMinimized] = useState(false);

  // S'abonner aux changements de logs
  useEffect(() => {
    const handler = (newLogs: LogEntry[]) => {
      setLocalLogs([...newLogs]);
      if (autoScroll && logsContainerRef.current) {
        setTimeout(() => {
          logsContainerRef.current!.scrollTop = logsContainerRef.current!.scrollHeight;
        }, 50);
      }
    };
    listeners.push(handler);
    return () => {
      listeners = listeners.filter(l => l !== handler);
    };
  }, [autoScroll]);

  // Filtrer les logs
  const filteredLogs = localLogs.filter(log => {
    const matchLevel = filterLevel === 'all' || log.level === filterLevel;
    const matchSearch = log.message.toLowerCase().includes(searchTerm.toLowerCase()) ||
                        log.timestamp.includes(searchTerm);
    return matchLevel && matchSearch;
  });

  const getLevelColor = (level: string) => {
    switch (level) {
      case 'error': return 'text-[var(--color-danger)]';
      case 'warn': return 'text-[var(--color-warning)]';
      case 'info': return 'text-[var(--color-info)]';
      case 'debug': return 'text-[var(--color-primary)]';
      default: return 'text-[var(--color-textPrimary)]';
    }
  };

  const getLevelBadge = (level: string) => {
    const map: Record<string, { label: string; bg: string }> = {
      log: { label: 'LOG', bg: 'bg-gray-500' },
      info: { label: 'INFO', bg: 'bg-blue-500' },
      warn: { label: 'WARN', bg: 'bg-yellow-500' },
      error: { label: 'ERROR', bg: 'bg-red-500' },
      debug: { label: 'DEBUG', bg: 'bg-purple-500' },
    };
    const info = map[level] || map.log;
    return <span className={`px-1.5 py-0.5 rounded text-[10px] font-bold text-white ${info.bg}`}>{info.label}</span>;
  };

  const clearLogs = () => {
    logs = [];
    setLocalLogs([]);
  };

  const copyLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] ${l.level.toUpperCase()}: ${l.message}`).join('\n');
    navigator.clipboard.writeText(text).then(() => {
      addLog('info', 'Logs copiés dans le presse-papiers');
    }).catch(() => {
      const textarea = document.createElement('textarea');
      textarea.value = text;
      document.body.appendChild(textarea);
      textarea.select();
      document.execCommand('copy');
      document.body.removeChild(textarea);
    });
  };

  const downloadLogs = () => {
    const text = filteredLogs.map(l => `[${l.timestamp}] ${l.level.toUpperCase()}: ${l.message}${l.data ? ' ' + JSON.stringify(l.data, null, 2) : ''}`).join('\n');
    const blob = new Blob([text], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `debug-logs-${new Date().toISOString().slice(0, 10)}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (!isOpen) return null;

  return (
    <MotionBox
      as="div"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[9999] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        className={`bg-[var(--color-cardBg)] rounded-2xl shadow-2xl w-full max-w-5xl flex flex-col transition-all duration-300 ${
          isMinimized ? 'max-h-[60px]' : 'max-h-[90vh] h-[80vh]'
        }`}
        animation={{ animationInitiale: 'slideUp' }}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-3 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)] rounded-t-2xl flex-shrink-0">
          <div className="flex items-center gap-3">
            <Terminal size={20} className="text-[var(--color-primary)]" />
            <span className="font-bold text-[var(--color-textPrimary)]">Console de débogage</span>
            <span className="text-xs text-[var(--color-textSecondary)]">
              {localLogs.length} logs
            </span>
            {filteredLogs.length !== localLogs.length && (
              <span className="text-xs text-[var(--color-info)]">
                filtrés: {filteredLogs.length}
              </span>
            )}
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsMinimized(!isMinimized)}
              className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
            >
              {isMinimized ? '□' : '−'}
            </button>
            <button
              onClick={onClose}
              className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        {!isMinimized && (
          <>
            {/* Barre d'outils */}
            <div className="flex flex-wrap items-center gap-2 p-2 border-b border-[var(--color-borderColor)] bg-[var(--color-cardBg)] flex-shrink-0">
              <div className="flex items-center gap-1">
                <Filter size={16} className="text-[var(--color-textSecondary)]" />
                <select
                  value={filterLevel}
                  onChange={(e) => setFilterLevel(e.target.value)}
                  className="px-2 py-1 text-xs rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                >
                  <option value="all">Tous</option>
                  <option value="log">Log</option>
                  <option value="info">Info</option>
                  <option value="warn">Warn</option>
                  <option value="error">Error</option>
                  <option value="debug">Debug</option>
                </select>
              </div>
              <div className="flex-1 min-w-[100px]">
                <input
                  type="text"
                  placeholder="Rechercher..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full px-2 py-1 text-xs rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)]"
                />
              </div>
              <div className="flex items-center gap-1">
                <label className="flex items-center gap-1 text-xs text-[var(--color-textSecondary)]">
                  <input
                    type="checkbox"
                    checked={autoScroll}
                    onChange={(e) => setAutoScroll(e.target.checked)}
                    className="accent-[var(--color-primary)]"
                  />
                  Auto-scroll
                </label>
              </div>
              <div className="flex items-center gap-1 ml-auto">
                <button
                  onClick={copyLogs}
                  className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                  title="Copier les logs"
                >
                  <Copy size={16} />
                </button>
                <button
                  onClick={downloadLogs}
                  className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                  title="Télécharger les logs"
                >
                  <Download size={16} />
                </button>
                <button
                  onClick={clearLogs}
                  className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)]"
                  title="Effacer les logs"
                >
                  <Trash2 size={16} />
                </button>
              </div>
            </div>

            {/* Liste des logs */}
            <div
              ref={logsContainerRef}
              className="flex-1 overflow-y-auto p-2 font-mono text-xs bg-[var(--color-background)]"
              style={{ fontFamily: 'monospace' }}
            >
              {filteredLogs.length === 0 ? (
                <div className="flex items-center justify-center h-full text-[var(--color-textSecondary)]">
                  {localLogs.length === 0 ? 'Aucun log. Utilisez console.log()' : 'Aucun log correspondant aux filtres'}
                </div>
              ) : (
                filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className={`flex items-start gap-2 py-0.5 hover:bg-[var(--color-secondary)]/30 px-1 rounded ${getLevelColor(log.level)}`}
                  >
                    <span className="text-[10px] text-[var(--color-textSecondary)] whitespace-nowrap">
                      {new Date(log.timestamp).toLocaleTimeString()}
                    </span>
                    <span className="flex-shrink-0">{getLevelBadge(log.level)}</span>
                    <span className="break-all">{log.message}</span>
                    {log.data && (
                      <span className="text-[10px] text-[var(--color-textSecondary)] opacity-60">
                        {JSON.stringify(log.data, null, 2).slice(0, 100)}
                        {JSON.stringify(log.data, null, 2).length > 100 && '...'}
                      </span>
                    )}
                  </div>
                ))
              )}
            </div>

            {/* Pied de page */}
            <div className="flex items-center justify-between p-2 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] rounded-b-2xl flex-shrink-0">
              <span className="text-xs text-[var(--color-textSecondary)]">
                {filteredLogs.length} / {localLogs.length} logs
              </span>
              <span className="text-xs text-[var(--color-textSecondary)]">
                Utilisez <code className="bg-[var(--color-cardBg)] px-1 rounded">console.log()</code> ou <code className="bg-[var(--color-cardBg)] px-1 rounded">debugLog()</code>
              </span>
            </div>
          </>
        )}
      </MotionBox>
    </MotionBox>
  );
};

export default DebugConsole;
