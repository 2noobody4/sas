import React from 'react';
import { MotionBox } from '../../components/ui/MotionBox';
import { useOffline } from '../../contexts/OfflineContext';
import { Trash2, RefreshCw, Clock, Wifi, WifiOff } from 'lucide-react';

export const OfflineQueuePage: React.FC = () => {
  const { queue, removeFromQueue, clearQueue, processQueue, isProcessing, isOnline } = useOffline();

  const getMethodColor = (method: string) => {
    const colors: Record<string, string> = {
      POST: 'text-green-500',
      PUT: 'text-yellow-500',
      DELETE: 'text-red-500',
      PATCH: 'text-blue-500',
    };
    return colors[method] || 'text-gray-500';
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Clock size={28} className="text-[var(--color-primary)]" />
            File d'attente hors ligne
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            {queue.length} action{queue.length > 1 ? 's' : ''} en attente de synchronisation
          </p>
        </div>
        <div className="flex gap-3">
          <button
            onClick={processQueue}
            disabled={isProcessing || queue.length === 0 || !isOnline}
            className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 disabled:opacity-50 hover:bg-[var(--color-primary-dark)] transition"
          >
            {isProcessing ? <RefreshCw size={18} className="animate-spin" /> : <RefreshCw size={18} />}
            {isProcessing ? 'Synchronisation...' : 'Synchroniser maintenant'}
          </button>
          <button
            onClick={clearQueue}
            disabled={queue.length === 0}
            className="px-4 py-2 rounded-xl border border-[var(--color-danger)] text-[var(--color-danger)] disabled:opacity-50 hover:bg-red-50 transition"
          >
            <Trash2 size={18} /> Tout effacer
          </button>
        </div>
      </div>

      <div className="flex items-center gap-2 mb-4">
        {isOnline ? (
          <span className="flex items-center gap-1 text-sm text-[var(--color-success)]"><Wifi size={16} /> En ligne</span>
        ) : (
          <span className="flex items-center gap-1 text-sm text-[var(--color-danger)]"><WifiOff size={16} /> Hors ligne</span>
        )}
        {isProcessing && (
          <span className="flex items-center gap-1 text-sm text-[var(--color-primary)]"><RefreshCw size={16} className="animate-spin" /> Synchronisation en cours...</span>
        )}
      </div>

      {queue.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-8 text-center text-[var(--color-textSecondary)]">
          <div className="text-4xl mb-4">✅</div>
          <p className="text-lg">Aucune action en attente</p>
          <p className="text-sm">Toutes les actions sont synchronisées</p>
        </MotionBox>
      ) : (
        <MotionBox type="card" variant="elevated" className="overflow-hidden">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead style={{ backgroundColor: 'var(--color-secondary)' }}>
                <tr>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Date</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">Méthode</th>
                  <th className="px-4 py-3 text-left text-sm font-semibold text-[var(--color-textPrimary)]">URL</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Tentatives</th>
                  <th className="px-4 py-3 text-center text-sm font-semibold text-[var(--color-textPrimary)]">Actions</th>
                </tr>
              </thead>
              <tbody>
                {queue.map((item) => (
                  <tr key={item.id} className="border-t border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50 transition">
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)]">
                      {new Date(item.timestamp).toLocaleString()}
                    </td>
                    <td className="px-4 py-3 text-sm font-medium text-[var(--color-textPrimary)]">
                      <span className={getMethodColor(item.method)}>{item.method}</span>
                    </td>
                    <td className="px-4 py-3 text-sm text-[var(--color-textSecondary)] font-mono truncate max-w-[200px]">
                      {item.url}
                    </td>
                    <td className="px-4 py-3 text-center text-sm text-[var(--color-textSecondary)]">
                      {item.retries} / {item.maxRetries}
                    </td>
                    <td className="px-4 py-3 text-center">
                      <button
                        onClick={() => removeFromQueue(item.id)}
                        className="p-1.5 rounded hover:bg-red-50 text-[var(--color-danger)] transition"
                        title="Supprimer de la file"
                      >
                        <Trash2 size={16} />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="px-4 py-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)]">
            {queue.length} action{queue.length > 1 ? 's' : ''} en attente
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default OfflineQueuePage;
