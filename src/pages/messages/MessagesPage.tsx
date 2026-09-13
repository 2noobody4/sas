import React, { useState, useEffect } from 'react';
import { useHistory, useParams } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { useAuth } from '../../hooks/useAuth';
import { useConversations, useMessages, useMarkAsRead, useMarkAllAsRead, useDeleteMessage } from '../../hooks/useMessages';
import { MessageCompose } from './MessageCompose';
import { MessageList } from './MessageList';
import { MessageDetail } from './MessageDetail';
import { MessageSquare, Users, Mail, Inbox, Send, CheckCircle, Trash2, ArrowLeft } from 'lucide-react';

type TabType = 'inbox' | 'sent' | 'unread';

export const MessagesPage: React.FC = () => {
  const history = useHistory();
  const { user } = useAuth();
  const { userId } = useParams<{ userId?: string }>();
  const [activeTab, setActiveTab] = useState<TabType>('inbox');
  const [selectedUserId, setSelectedUserId] = useState<string | null>(userId || null);
  const [showCompose, setShowCompose] = useState(false);

  const { data: conversations, isLoading: convLoading, refetch: refetchConv } = useConversations();
  const { data: messages, isLoading: msgLoading, refetch: refetchMsg } = useMessages(selectedUserId || '');
  const markAsRead = useMarkAsRead();
  const markAllAsRead = useMarkAllAsRead();
  const deleteMessage = useDeleteMessage();

  // Si userId est passé en paramètre, sélectionner automatiquement
  useEffect(() => {
    if (userId) {
      setSelectedUserId(userId);
    }
  }, [userId]);

  // Marquer les messages comme lus quand on ouvre une conversation
  useEffect(() => {
    if (selectedUserId && messages) {
      const unread = messages.filter(m => !m.read && m.receiver_id === user?.id);
      if (unread.length > 0) {
        markAllAsRead.mutate(selectedUserId);
      }
    }
  }, [selectedUserId, messages]);

  const handleSelectConversation = (userId: string) => {
    setSelectedUserId(userId);
    history.push(`/messages/${userId}`);
  };

  const handleDeleteMessage = async (messageId: string) => {
    await deleteMessage.mutateAsync(messageId);
    refetchMsg();
    refetchConv();
  };

  const handleBack = () => {
    setSelectedUserId(null);
    history.push('/messages');
  };

  const getTabCount = (type: TabType) => {
    if (!conversations) return 0;
    if (type === 'unread') {
      return conversations.reduce((sum, c) => sum + c.unread_count, 0);
    }
    return conversations.length;
  };

  return (
    <div className="p-4 max-w-7xl mx-auto h-[calc(100vh-130px)]">
      <div className="flex items-center justify-between mb-4">
        <div className="flex items-center gap-3">
          <MessageSquare size={24} className="text-[var(--color-primary)]" />
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">Messagerie</h1>
          {selectedUserId && (
            <button
              onClick={handleBack}
              className="flex items-center gap-1 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
            >
              <ArrowLeft size={16} /> Retour
            </button>
          )}
        </div>
        <button
          onClick={() => setShowCompose(true)}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white hover:bg-[var(--color-primary-dark)] transition flex items-center gap-2"
        >
          <Mail size={18} /> Nouveau message
        </button>
      </div>

      {!selectedUserId ? (
        // Vue des conversations
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-full">
          {/* Onglets et liste */}
          <div className="lg:col-span-1 bg-[var(--color-cardBg)] rounded-xl border border-[var(--color-borderColor)] overflow-hidden flex flex-col">
            <div className="flex border-b border-[var(--color-borderColor)]">
              {[
                { id: 'inbox', icon: Inbox, label: 'Boîte' },
                { id: 'sent', icon: Send, label: 'Envoyés' },
                { id: 'unread', icon: CheckCircle, label: 'Non lus' },
              ].map((tab) => (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as TabType)}
                  className={`flex-1 px-3 py-2 text-sm font-medium transition relative ${
                    activeTab === tab.id
                      ? 'text-[var(--color-primary)] border-b-2 border-[var(--color-primary)]'
                      : 'text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]'
                  }`}
                >
                  <div className="flex items-center justify-center gap-1">
                    <tab.icon size={16} />
                    <span className="hidden sm:inline">{tab.label}</span>
                    {getTabCount(tab.id as TabType) > 0 && (
                      <span className="ml-1 text-xs px-1.5 py-0.5 rounded-full bg-[var(--color-primary)] text-white">
                        {getTabCount(tab.id as TabType)}
                      </span>
                    )}
                  </div>
                </button>
              ))}
            </div>
            <div className="flex-1 overflow-y-auto">
              <MessageList
                conversations={conversations || []}
                activeTab={activeTab}
                loading={convLoading}
                onSelect={handleSelectConversation}
                currentUserId={user?.id || ''}
              />
            </div>
          </div>

          {/* Panneau de droite (vide ou messages récents) */}
          <div className="lg:col-span-2 bg-[var(--color-cardBg)] rounded-xl border border-[var(--color-borderColor)] p-8 flex flex-col items-center justify-center text-[var(--color-textSecondary)]">
            <MessageSquare size={48} className="opacity-30 mb-4" />
            <p className="text-lg font-medium">Sélectionnez une conversation</p>
            <p className="text-sm">Choisissez un contact dans la liste pour voir vos échanges</p>
          </div>
        </div>
      ) : (
        // Vue des messages d'une conversation
        <div className="bg-[var(--color-cardBg)] rounded-xl border border-[var(--color-borderColor)] h-full flex flex-col overflow-hidden">
          <MessageDetail
            messages={messages || []}
            loading={msgLoading}
            onDelete={handleDeleteMessage}
            currentUserId={user?.id || ''}
            otherUserId={selectedUserId}
            onReply={() => setShowCompose(true)}
          />
        </div>
      )}

      {/* Modal de composition */}
      {showCompose && (
        <MessageCompose
          isOpen={showCompose}
          onClose={() => setShowCompose(false)}
          onSuccess={() => {
            refetchConv();
            refetchMsg();
          }}
          preselectedUserId={selectedUserId || undefined}
        />
      )}
    </div>
  );
};

export default MessagesPage;
