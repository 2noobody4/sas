import React, { useState, useEffect } from 'react';
import { MotionBox } from './MotionBox';
import { useMessageRecipients, useSendMessage } from '../hooks/useMessages';
import { useAuth } from '../hooks/useAuth';
import { X, Send } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface MessageComposeProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: () => void;
  preselectedUserId?: string;
}

export const MessageCompose: React.FC<MessageComposeProps> = ({
  isOpen,
  onClose,
  onSuccess,
  preselectedUserId,
}) => {
  const { user } = useAuth();
  const { data: recipients = [], isLoading } = useMessageRecipients();
  const sendMessage = useSendMessage();
  const { error: toastError } = useToast();

  const [form, setForm] = useState({
    receiver_id: preselectedUserId || '',
    subject: '',
    content: '',
  });
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState<{ receiver_id?: string; content?: string }>({});

  useEffect(() => {
    if (preselectedUserId) setForm(prev => ({ ...prev, receiver_id: preselectedUserId }));
  }, [preselectedUserId]);

  const validate = () => {
    const newErrors: { receiver_id?: string; content?: string } = {};
    if (!form.receiver_id) newErrors.receiver_id = 'Veuillez sélectionner un destinataire';
    if (!form.content.trim()) newErrors.content = 'Le message ne peut pas être vide';
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    try {
      await sendMessage.mutateAsync(form);
      onSuccess();
      onClose();
      setForm({ receiver_id: '', subject: '', content: '' });
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  if (!isOpen) return null;
  const availableRecipients = recipients.filter((r: any) => r.id !== user?.id);

  return (
    <MotionBox as="div" className="fixed inset-0 bg-black/60 flex items-center justify-center z-[100] modal-overlay-safe"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      animation={{ animationInitiale: 'fadeIn' }}>
      <MotionBox as="div" type="card" variant="xlarge"
        className="w-full max-w-lg p-6 bg-[var(--color-cardBg)] rounded-2xl shadow-2xl modal-content-safe overflow-y-auto"
        animation={{ animationInitiale: 'slideUp' }}>
        <div className="flex items-center justify-between mb-4">
          <h3 className="text-xl font-bold text-[var(--color-textPrimary)] flex items-center gap-2">
            <Send size={20} className="text-[var(--color-primary)]" />
            Nouveau message
          </h3>
          <button onClick={onClose} className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]">
            <X size={24} />
          </button>
        </div>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">Destinataire *</label>
            <select
              value={form.receiver_id}
              onChange={(e) => setForm({ ...form, receiver_id: e.target.value })}
              className={`w-full px-3 py-2 rounded-xl border ${errors.receiver_id ? 'border-[var(--color-danger)]' : 'border-[var(--color-borderColor)]'} bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]`}
            >
              <option value="">Sélectionner</option>
              {availableRecipients.map((r: any) => (
                <option key={r.id} value={r.id}>{r.prenom || ''} {r.nom || ''} - {r.role?.nom || 'Utilisateur'}</option>
              ))}
            </select>
            {errors.receiver_id && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.receiver_id}</p>}
            {availableRecipients.length === 0 && !isLoading && (
              <p className="text-xs text-[var(--color-textSecondary)] mt-1">Aucun destinataire disponible</p>
            )}
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">Sujet (optionnel)</label>
            <input
              type="text"
              value={form.subject}
              onChange={(e) => setForm({ ...form, subject: e.target.value })}
              placeholder="Objet"
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          </div>
          <div>
            <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">Message *</label>
            <textarea
              value={form.content}
              onChange={(e) => setForm({ ...form, content: e.target.value })}
              rows={5}
              placeholder="Écrivez votre message..."
              className={`w-full px-3 py-2 rounded-xl border ${errors.content ? 'border-[var(--color-danger)]' : 'border-[var(--color-borderColor)]'} bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] resize-none`}
            />
            {errors.content && <p className="text-xs text-[var(--color-danger)] mt-1">{errors.content}</p>}
          </div>
          <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
            <button type="button" onClick={onClose} className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)]">Annuler</button>
            <button type="submit" disabled={loading} className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${loading ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'}`}>
              {loading ? 'Envoi...' : <><Send size={18} /> Envoyer</>}
            </button>
          </div>
        </form>
      </MotionBox>
    </MotionBox>
  );
};

export default MessageCompose;
