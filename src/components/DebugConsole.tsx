// ============================================================
// DEBUG CONSOLE — Console de débogage (logs)
// Version V1 — Compatible React 16
// ============================================================

import React, { useEffect, useState } from 'react';
import { MotionBox } from './MotionBox';
import { X, Trash2 } from 'lucide-react';

interface DebugConsoleProps {
  isOpen: boolean;
  onClose: () => void;
}

interface LogEntry {
  id: number;
  level: 'log' | 'warn' | 'error';
  message: string;
  timestamp: string;
}

let idCounter = 0;

export const DebugConsole: React.FC<DebugConsoleProps> = ({ isOpen, onClose }) => {
  const [logs, setLogs] = useState<LogEntry[]>([]);

  useEffect(() => {
    const originalLog = console.log;
    const originalWarn = console.warn;
    const originalError = console.error;

    const push = (level: LogEntry['level'], args: any[]) => {
      const message = args.map((a) => {
        try {
          if (typeof a === 'object') return JSON.stringify(a);
          return String(a);
        } catch {
          return '[object]';
        }
      }).join(' ');
      setLogs((prev) => [
        ...prev.slice(-199),
        {
          id: ++idCounter,
          level,
          message,
          timestamp: new Date().toLocaleTimeString(),
        },
      ]);
    };

    console.log = (...args: any[]) => { push('log', args); originalLog(...args); };
    console.warn = (...args: any[]) => { push('warn', args); originalWarn(...args); };
    console.error = (...args: any[]) => { push('error', args); originalError(...args); };

    return () => {
      console.log = originalLog;
      console.warn = originalWarn;
      console.error = originalError;
    };
  }, []);

  if (!isOpen) return null;

  return (
    <MotionBox
      as="div"
      className="fixed inset-0 bg-black/70 z-[300] flex items-end justify-center p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        type="card"
        variant="xlarge"
        className="w-full max-w-3xl h-[70vh] bg-[var(--color-cardBg)] rounded-2xl shadow-2xl flex flex-col overflow-hidden"
        animation={{ animationInitiale: 'slideUp' }}
      >
        <div className="flex items-center justify-between p-3 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
          <span className="font-medium text-[var(--color-textPrimary)]">🖥️ Console ({logs.length})</span>
          <div className="flex gap-2">
            <button onClick={() => setLogs([])} className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-danger)]">
              <Trash2 size={16} />
            </button>
            <button onClick={onClose} className="p-1.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
              <X size={18} />
            </button>
          </div>
        </div>
        <div className="flex-1 overflow-y-auto p-3 font-mono text-xs space-y-1 bg-black/90">
          {logs.length === 0 ? (
            <p className="text-gray-500 italic">Aucun log pour le moment.</p>
          ) : (
            logs.map((l) => (
              <div
                key={l.id}
                className={`flex gap-2 ${
                  l.level === 'error' ? 'text-red-400' :
                  l.level === 'warn' ? 'text-yellow-400' :
                  'text-gray-300'
                }`}
              >
                <span className="opacity-50 flex-shrink-0">{l.timestamp}</span>
                <span className="break-all">{l.message}</span>
              </div>
            ))
          )}
        </div>
      </MotionBox>
    </MotionBox>
  );
};

export default DebugConsole;
