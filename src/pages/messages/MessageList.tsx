import React from 'react';
import { Conversation } from '../../types/messages';
import { User, CheckCheck } from 'lucide-react';
import { MotionBox } from '../../components/ui/MotionBox';

interface MessageListProps {
  conversations: Conversation[];
  activeTab: 'inbox' | 'sent' | 'unread';
  loading: boolean;
  onSelect: (userId: string) => void;
  currentUserId: string;
}

export const MessageList: React.FC<MessageListProps> = ({
  conversations,
  activeTab,
  loading,
  onSelect,
  currentUserId,
}) => {
  if (loading) return <MotionBox type="state" variant="loading" usageId="messages-list-loading" page="MessageList" className="p-4 text-center text-[var(--color-textSecondary)]">Chargement...</MotionBox>;

  let filtered = conversations;
  if (activeTab === 'unread') filtered = conversations.filter(c => c.unread_count > 0);
  else if (activeTab === 'sent') filtered = conversations.filter(c => c.last_message.sender_id === currentUserId);

  if (filtered.length === 0) {
    return (
      <MotionBox type="state" variant="empty" usageId="messages-list-empty" page="MessageList" className="p-8 text-center text-[var(--color-textSecondary)]">
        <p>Aucune conversation</p>
        <p className="text-sm">Commencez à échanger avec vos contacts</p>
      </MotionBox>
    );
  }

  return (
    <MotionBox type="list" variant="conversations" usageId="messages-list" page="MessageList" className="divide-y divide-[var(--color-borderColor)]">
      {filtered.map((conv) => {
        const isLastFromMe = conv.last_message.sender_id === currentUserId;
        const isUnread = conv.unread_count > 0;
        const otherUser = conv.user;
        return (
          <button
            key={conv.user_id}
            onClick={() => onSelect(conv.user_id)}
            className={`w-full px-4 py-3 text-left hover:bg-[var(--color-secondary)] transition flex items-start gap-3 ${isUnread ? 'bg-[var(--color-primary-light)]/10' : ''}`}
          >
            <div className="w-10 h-10 rounded-full bg-[var(--color-secondary)] flex items-center justify-center flex-shrink-0">
              <User size={20} className="text-[var(--color-textSecondary)]" />
            </div>
            <div className="flex-1 min-w-0">
              <div className="flex items-center justify-between">
                <span className={`font-medium truncate ${isUnread ? 'text-[var(--color-textPrimary)]' : 'text-[var(--color-textSecondary)]'}`}>
                  {otherUser?.prenom || ''} {otherUser?.nom || 'Utilisateur'}
                </span>
                <span className="text-xs text-[var(--color-textSecondary)] flex-shrink-0">
                  {new Date(conv.last_message_at).toLocaleDateString()}
                </span>
              </div>
              <div className="flex items-center justify-between mt-0.5">
                <span className="text-sm truncate text-[var(--color-textSecondary)]">
                  {isLastFromMe && <CheckCheck size={14} className="inline mr-1 text-[var(--color-primary)]" />}
                  {conv.last_message.content?.substring(0, 50)}
                  {conv.last_message.content?.length > 50 ? '...' : ''}
                </span>
                {isUnread && <span className="ml-2 flex-shrink-0 w-2 h-2 rounded-full bg-[var(--color-primary)]" />}
              </div>
            </div>
          </button>
        );
      })}
    </MotionBox>
  );
};

export default MessageList;
