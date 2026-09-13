import React from 'react';
import { useHistory } from 'react-router-dom';
import { Bell } from 'lucide-react';
import { useUnreadCount } from '../../hooks/useNotifications';

export const NotificationBell: React.FC = () => {
  const history = useHistory();
  const { data: unreadCount = 0 } = useUnreadCount();

  return (
    <button
      onClick={() => history.push('/notifications')}
      className="relative p-1.5 rounded-lg hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)]"
    >
      <Bell size={18} />
      {unreadCount > 0 && (
        <span className="absolute -top-0.5 -right-0.5 min-w-[18px] h-[18px] px-1 text-[10px] font-bold text-white bg-[var(--color-danger)] rounded-full flex items-center justify-center">
          {unreadCount > 99 ? '99+' : unreadCount}
        </span>
      )}
    </button>
  );
};

export default NotificationBell;
