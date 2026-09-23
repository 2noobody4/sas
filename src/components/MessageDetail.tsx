import React, { useEffect, useRef } from 'react';
import { Message } from '../types/messages';
import { User, Trash2, Reply, CheckCheck, MessageSquare } from 'lucide-react';
import { MotionBox } from './MotionBox';

interface MessageDetailProps {
  messages: Message[];
  loading: boolean;
  onDelete: (id: string) => void;
  onReply: () => void;
  currentUserId: string;
  otherUserId: string;
}

export const MessageDetail: React.FC<MessageDetailProps> = ({
  messages,
  loading,
  onDelete,
  onReply,
  currentUserId,
  otherUserId,
}) => {
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages]);

  if (loading) return <MotionBox type="state" variant="loading" usageId="messages-detail-loading" page="MessageDetail" className="p-4 text-center text-[var(--color-textSecondary)]">Chargement...</MotionBox>;

  if (messages.length === 0) {
    return (
      <MotionBox type="state" variant="empty" usageId="messages-detail-empty" page="MessageDetail" className="flex-1 flex flex-col items-center justify-center p-8 text-[var(--color-textSecondary)]">
        <MessageSquare size={48} className="opacity-30 mb-4" />
        <p>Aucun message</p>
        <button onClick={onReply} className="mt-4 px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition">Écrire un message</button>
      </MotionBox>
    );
  }

  return (
    <MotionBox type="panel" variant="conversation" usageId="messages-detail" page="MessageDetail" className="flex-1 flex flex-col overflow-hidden">
      <div className="p-3 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)] flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-full bg-[var(--color-primary)]/10 flex items-center justify-center">
            <User size={16} className="text-[var(--color-primary)]" />
          </div>
          <span className="font-medium text-[var(--color-textPrimary)]">
            {messages[0]?.sender?.id === currentUserId
              ? messages[0]?.receiver?.prenom + ' ' + messages[0]?.receiver?.nom
              : messages[0]?.sender?.prenom + ' ' + messages[0]?.sender?.nom}
          </span>
        </div>
        <button onClick={onReply} className="px-3 py-1.5 rounded-lg bg-[var(--color-primary)] text-white text-sm hover:bg-[var(--color-primary-dark)] transition flex items-center gap-1">
          <Reply size={16} /> Répondre
        </button>
      </div>
      <div className="flex-1 overflow-y-auto p-4 space-y-3">
        {messages.map((msg) => {
          const isMine = msg.sender_id === currentUserId;
          return (
            <div key={msg.id} className={`flex ${isMine ? 'justify-end' : 'justify-start'} group`}>
              <div className={`max-w-[80%] p-3 rounded-xl ${isMine ? 'bg-[var(--color-primary)] text-white rounded-tr-none' : 'bg-[var(--color-secondary)] text-[var(--color-textPrimary)] rounded-tl-none'}`}>
                {msg.subject && <div className="text-sm font-medium mb-1">{msg.subject}</div>}
                <div className="text-sm whitespace-pre-wrap">{msg.content}</div>
                <div className={`flex items-center gap-1 text-xs mt-1 ${isMine ? 'text-white/70' : 'text-[var(--color-textSecondary)]'}`}>
                  {new Date(msg.created_at).toLocaleString()}
                  {isMine && <CheckCheck size={14} className={msg.read ? 'text-white' : 'text-white/50'} />}
                  {msg.read && isMine && <span className="text-[10px]">Lu</span>}
                </div>
              </div>
              <button onClick={() => onDelete(msg.id)} className="ml-1 p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)] opacity-0 group-hover:opacity-100 transition">
                <Trash2 size={14} />
              </button>
            </div>
          );
        })}
        <div ref={bottomRef} />
      </div>
      <div className="p-3 border-t border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
        <button onClick={onReply} className="w-full px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center gap-2">
          <Reply size={18} /> Répondre
        </button>
      </div>
    </MotionBox>
  );
};

export default MessageDetail;
