import React, { useEffect, useState } from 'react';
import { MotionBox } from './MotionBox';
import { X, CheckCircle, AlertTriangle, Info, XCircle } from 'lucide-react';

export type ToastType = 'success' | 'error' | 'warning' | 'info';
export type ToastAction = { label: string; onClick: () => void };

export interface ToastItem {
  id: string;
  type: ToastType;
  title: string;
  description?: string;
  action?: ToastAction;
  duration?: number;
  grouped?: boolean;
}

interface NotificationToastProps {
  toasts: ToastItem[];
  onDismiss: (id: string) => void;
  onAction?: (id: string) => void;
}

const icons = {
  success: CheckCircle,
  error: XCircle,
  warning: AlertTriangle,
  info: Info,
};

const colors = {
  success: 'var(--color-success)',
  error: 'var(--color-danger)',
  warning: 'var(--color-warning)',
  info: 'var(--color-info)',
};

export const NotificationToast: React.FC<NotificationToastProps> = ({
  toasts,
  onDismiss,
  onAction,
}) => {
  const [progress, setProgress] = useState<Record<string, number>>({});

  useEffect(() => {
    toasts.forEach((toast) => {
      if (toast.duration && toast.duration > 0) {
        const start = Date.now();
        const interval = setInterval(() => {
          const elapsed = Date.now() - start;
          const progressVal = toast.duration ? Math.min(100, (elapsed / toast.duration) * 100) : 0;
          setProgress((prev) => ({ ...prev, [toast.id]: progressVal }));
          if (progressVal >= 100) {
            clearInterval(interval);
            onDismiss(toast.id);
          }
        }, 50);
        return () => clearInterval(interval);
      }
    });
  }, [toasts, onDismiss]);

  if (!toasts || toasts.length === 0) return null;

  // Regrouper les notifications de même type si `grouped` est true
  const groupedToasts = toasts.reduce((acc, toast) => {
    if (toast.grouped) {
      const key = toast.type;
      if (!acc[key]) acc[key] = [];
      acc[key].push(toast);
    } else {
      acc[toast.id] = [toast];
    }
    return acc;
  }, {} as Record<string, ToastItem[]>);

  return (
    <div className="fixed bottom-20 right-4 z-[150] flex flex-col gap-2 max-w-sm w-full pointer-events-none">
      {Object.values(groupedToasts).map((group) => {
        const first = group[0];
        const Icon = icons[first.type];
        const color = colors[first.type];
        const isGroup = group.length > 1;

        return (
          <MotionBox
            key={first.id}
            as="div"
            type="card"
            variant="default"
            className="pointer-events-auto bg-[var(--color-cardBg)] border border-[var(--color-borderColor)] shadow-xl rounded-xl overflow-hidden"
            animation={{ animationInitiale: 'slideUp', animationSortie: { nom: 'slideDownExit' } }}
          >
            {/* Barre de progression */}
            {first.duration && first.duration > 0 && (
              <div
                className="h-1 transition-all duration-100"
                style={{
                  width: `${Math.min(100, progress[first.id] || 0)}%`,
                  backgroundColor: color,
                }}
              />
            )}

            <div className="p-3 flex items-start gap-3">
              <div className="flex-shrink-0" style={{ color }}>
                <Icon size={20} />
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2">
                  <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                    {first.title}
                  </p>
                  {isGroup && (
                    <span className="text-xs text-[var(--color-textSecondary)]">
                      +{group.length - 1} autres
                    </span>
                  )}
                </div>
                {first.description && (
                  <p className="text-xs text-[var(--color-textSecondary)] truncate">
                    {first.description}
                  </p>
                )}
                {first.action && (
                  <button
                    onClick={() => {
                      first.action?.onClick();
                      onAction?.(first.id);
                    }}
                    className="mt-1 text-xs font-medium hover:underline"
                    style={{ color }}
                  >
                    {first.action.label}
                  </button>
                )}
              </div>

              <button
                onClick={() => onDismiss(first.id)}
                className="flex-shrink-0 text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
              >
                <X size={16} />
              </button>
            </div>

            {/* Si groupé, afficher les descriptions des autres */}
            {isGroup && (
              <div className="px-3 pb-2 space-y-1 border-t border-[var(--color-borderColor)]">
                {group.slice(1).map((t) => (
                  <div key={t.id} className="flex items-center gap-2 text-xs text-[var(--color-textSecondary)]">
                    <span className="w-2 h-2 rounded-full flex-shrink-0" style={{ backgroundColor: colors[t.type] }} />
                    <span className="truncate">{t.description || t.title}</span>
                  </div>
                ))}
              </div>
            )}
          </MotionBox>
        );
      })}
    </div>
  );
};

export default NotificationToast;
