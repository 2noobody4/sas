import React, { useState } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../components/MotionBox';
import { useNotifications, useMarkNotificationRead, useMarkAllNotificationsRead, useDeleteNotification, useUnreadCount } from '../hooks/useNotifications';
import { Notification } from '../types/notification';
import { Bell, Check, CheckCheck, Trash2, Eye, Filter, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { fr } from 'date-fns/locale';

const typeIcons: Record<string, string> = {
  message: '💬',
  vente: '💰',
  stock: '📦',
  promotion: '🏷️',
  system: '⚙️',
};

const typeColors: Record<string, string> = {
  message: 'bg-blue-500/10 text-blue-500',
  vente: 'bg-green-500/10 text-green-500',
  stock: 'bg-yellow-500/10 text-yellow-500',
  promotion: 'bg-purple-500/10 text-purple-500',
  system: 'bg-gray-500/10 text-gray-400',
};

export const NotificationsPage: React.FC = () => {
  const history = useHistory();
  const [filterType, setFilterType] = useState<string>('');
  const [filterRead, setFilterRead] = useState<string>('');
  const [searchTerm, setSearchTerm] = useState('');

  const { data: notifications = [], isLoading, refetch } = useNotifications({
    type: filterType as any || undefined,
    read: filterRead === 'read' ? true : filterRead === 'unread' ? false : undefined,
    search: searchTerm || undefined,
  });
  const { data: unreadCount = 0 } = useUnreadCount();
  const markRead = useMarkNotificationRead();
  const markAllRead = useMarkAllNotificationsRead();
  const deleteNotification = useDeleteNotification();

  const handleMarkRead = async (id: string) => {
    await markRead.mutateAsync(id);
    refetch();
  };

  const handleDelete = async (id: string) => {
    if (window.confirm('Supprimer cette notification ?')) {
      await deleteNotification.mutateAsync(id);
      refetch();
    }
  };

  const handleMarkAllRead = async () => {
    await markAllRead.mutateAsync();
    refetch();
  };

  const handleClick = (notification: Notification) => {
    if (!notification.read) {
      handleMarkRead(notification.id);
    }
    if (notification.link) {
      history.push(notification.link);
    }
  };

  const getTimeAgo = (date: string) => {
    return formatDistanceToNow(new Date(date), { addSuffix: true, locale: fr });
  };

  if (isLoading) {
    return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;
  }

  return (
    <div className="p-6 max-w-4xl mx-auto">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-3">
          <Bell size={28} className="text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">Notifications</h1>
          {unreadCount > 0 && (
            <span className="px-2 py-1 text-xs font-medium bg-[var(--color-primary)] text-white rounded-full">
              {unreadCount} non lue{unreadCount > 1 ? 's' : ''}
            </span>
          )}
        </div>
        {unreadCount > 0 && (
          <button
            onClick={handleMarkAllRead}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <CheckCheck size={18} /> Tout marquer comme lu
          </button>
        )}
      </div>

      {/* Filtres */}
      <div className="flex flex-wrap gap-3 mb-4">
        <div className="relative flex-1 min-w-[200px]">
          <input
            type="text"
            placeholder="Rechercher..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full px-4 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] placeholder:text-[var(--color-textSecondary)]"
          />
        </div>
        <select
          value={filterType}
          onChange={(e) => setFilterType(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les types</option>
          <option value="message">💬 Messages</option>
          <option value="vente">💰 Ventes</option>
          <option value="stock">📦 Stock</option>
          <option value="promotion">🏷️ Promotions</option>
          <option value="system">⚙️ Système</option>
        </select>
        <select
          value={filterRead}
          onChange={(e) => setFilterRead(e.target.value)}
          className="px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
        >
          <option value="">Tous les statuts</option>
          <option value="unread">Non lues</option>
          <option value="read">Lues</option>
        </select>
      </div>

      {/* Liste des notifications */}
      {notifications.length === 0 ? (
        <MotionBox type="card" variant="default" className="p-12 text-center text-[var(--color-textSecondary)]">
          <Bell size={48} className="mx-auto opacity-30 mb-4" />
          <p className="text-lg">Aucune notification</p>
          <p className="text-sm">Les notifications apparaîtront ici</p>
        </MotionBox>
      ) : (
        <div className="space-y-2">
          {notifications.map((notification) => (
            <MotionBox
              key={notification.id}
              type="card"
              variant="default"
              className={`p-4 cursor-pointer hover:bg-[var(--color-secondary)] transition border-l-4 ${
                notification.read
                  ? 'border-[var(--color-borderColor)] opacity-70'
                  : 'border-[var(--color-primary)]'
              }`}
              onClick={() => handleClick(notification)}
            >
              <div className="flex items-start gap-4">
                <div className={`p-2 rounded-full ${typeColors[notification.type]}`}>
                  <span className="text-xl">{typeIcons[notification.type]}</span>
                </div>
                <div className="flex-1 min-w-0">
                  <div className="flex items-start justify-between gap-2">
                    <div>
                      <p className={`font-medium ${notification.read ? 'text-[var(--color-textSecondary)]' : 'text-[var(--color-textPrimary)]'}`}>
                        {notification.title}
                      </p>
                      <p className="text-sm text-[var(--color-textSecondary)]">{notification.content}</p>
                    </div>
                    <div className="flex items-center gap-1 flex-shrink-0">
                      {!notification.read && (
                        <button
                          onClick={(e) => { e.stopPropagation(); handleMarkRead(notification.id); }}
                          className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                          title="Marquer comme lue"
                        >
                          <Check size={16} />
                        </button>
                      )}
                      <button
                        onClick={(e) => { e.stopPropagation(); handleDelete(notification.id); }}
                        className="p-1 rounded hover:bg-red-50 text-[var(--color-textSecondary)] hover:text-[var(--color-danger)]"
                        title="Supprimer"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </div>
                  <div className="flex items-center gap-2 mt-1 text-xs text-[var(--color-textSecondary)]">
                    <span>{getTimeAgo(notification.created_at)}</span>
                    {notification.read && <span>• Lu</span>}
                  </div>
                </div>
              </div>
            </MotionBox>
          ))}
        </div>
      )}
    </div>
  );
};

export default NotificationsPage;
