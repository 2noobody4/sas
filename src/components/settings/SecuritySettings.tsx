import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';

export const SecuritySettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    session_duration: config.session_duration ?? 60,
    inactivity_timeout: config.inactivity_timeout ?? 15,
    two_factor_auth: config.two_factor_auth ?? false,
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        session_duration: config.session_duration ?? 60,
        inactivity_timeout: config.inactivity_timeout ?? 15,
        two_factor_auth: config.two_factor_auth ?? false,
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
          session_duration: form.session_duration,
          inactivity_timeout: form.inactivity_timeout,
          two_factor_auth: form.two_factor_auth,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Sécurité mise à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Sécurité" icon="🔐" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Durée de session (minutes)
          </label>
          <input
            type="number"
            value={form.session_duration}
            onChange={(e) => setForm({ ...form, session_duration: parseInt(e.target.value) || 60 })}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            min={5}
            max={480}
          />
          <p className="text-xs mt-1 text-[var(--color-textSecondary)]">
            Temps maximum d'une session avant expiration (5-480 min).
          </p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Déconnexion automatique (minutes)
          </label>
          <input
            type="number"
            value={form.inactivity_timeout}
            onChange={(e) => setForm({ ...form, inactivity_timeout: parseInt(e.target.value) || 15 })}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            min={1}
            max={120}
          />
          <p className="text-xs mt-1 text-[var(--color-textSecondary)]">
            Durée d'inactivité avant déconnexion automatique.
          </p>
        </div>
        <div className="md:col-span-2">
          <label
            className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200"
          >
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">Authentification à deux facteurs</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">
                Renforce la sécurité de connexion (à venir).
              </p>
            </div>
            <input
              type="checkbox"
              checked={form.two_factor_auth}
              onChange={(e) => setForm({ ...form, two_factor_auth: e.target.checked })}
              className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
            />
          </label>
        </div>
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
