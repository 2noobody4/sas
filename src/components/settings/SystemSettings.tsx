import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';

export const SystemSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    maintenance_mode: config.maintenance_mode ?? false,
    app_version: config.app_version || 'v3.0.0',
    log_level: config.log_level || 'info',
    cache_enabled: config.cache_enabled ?? true,
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        maintenance_mode: config.maintenance_mode ?? false,
        app_version: config.app_version || 'v3.0.0',
        log_level: config.log_level || 'info',
        cache_enabled: config.cache_enabled ?? true,
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
          maintenance_mode: form.maintenance_mode,
          app_version: form.app_version,
          log_level: form.log_level,
          cache_enabled: form.cache_enabled,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Système mis à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Système" icon="🛠️" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">Mode maintenance</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Active le mode maintenance pour les utilisateurs.</p>
            </div>
            <input
              type="checkbox"
              checked={form.maintenance_mode}
              onChange={(e) => setForm({ ...form, maintenance_mode: e.target.checked })}
              className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
            />
          </label>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Version de l'application</label>
          <input
            type="text"
            value={form.app_version}
            onChange={(e) => setForm({ ...form, app_version: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Niveau de logs</label>
          <select
            value={form.log_level}
            onChange={(e) => setForm({ ...form, log_level: e.target.value })}
            className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="debug">Debug</option>
            <option value="info">Info</option>
            <option value="warn">Warning</option>
            <option value="error">Error</option>
            <option value="fatal">Fatal</option>
          </select>
        </div>
        <div>
          <label className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200">
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">Cache activé</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Active le cache pour améliorer les performances.</p>
            </div>
            <input
              type="checkbox"
              checked={form.cache_enabled}
              onChange={(e) => setForm({ ...form, cache_enabled: e.target.checked })}
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
