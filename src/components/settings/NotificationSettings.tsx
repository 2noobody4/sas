import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';

export const NotificationSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    enable_notifications: config.enableNotifications ?? true,
    push_enabled: config.push_enabled ?? true,
    in_app: config.in_app_notifications ?? true,
    sound_enabled: config.sound_enabled ?? true,
    show_badges: config.show_badges ?? true,
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        enable_notifications: config.enableNotifications ?? true,
        push_enabled: config.push_enabled ?? true,
        in_app: config.in_app_notifications ?? true,
        sound_enabled: config.sound_enabled ?? true,
        show_badges: config.show_badges ?? true,
      });
    }
  }, [config]);

  const handleSave = async () => {
    setLoading(true);
    try {
      const configId = config.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase
        .from('config')
        .update({
          enable_notifications: form.enable_notifications,
          push_enabled: form.push_enabled,
          in_app_notifications: form.in_app,
          sound_enabled: form.sound_enabled,
          show_badges: form.show_badges,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Notifications mises à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Notifications" icon="🔔" onClose={onClose}>
      <div className="space-y-3">
        {[
          ['enable_notifications', 'Notifications activées'],
          ['push_enabled', 'Notifications push'],
          ['in_app', 'Notifications dans l\'application'],
          ['sound_enabled', 'Son des notifications'],
          ['show_badges', 'Badges'],
        ].map(([key, label]) => (
          <label
            key={key}
            className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">{label}</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Active ou désactive cette option.</p>
            </div>
            <input
              type="checkbox"
              checked={form[key as keyof typeof form] as boolean}
              onChange={(e) => setForm({ ...form, [key]: e.target.checked })}
              className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
            />
          </label>
        ))}
      </div>
      <div className="flex justify-end gap-3 mt-6">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white"
        >
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </SettingsSection>
  );
};
