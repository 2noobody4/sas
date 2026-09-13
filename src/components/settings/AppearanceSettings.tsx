import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Palette, Film } from 'lucide-react';

export const AppearanceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    theme_mode: config.theme_mode || 'light',
    font_family: config.font_family || 'Inter',
    animations_enabled: config.animations_enabled ?? true,
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        theme_mode: config.theme_mode || 'light',
        font_family: config.font_family || 'Inter',
        animations_enabled: config.animations_enabled ?? true,
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
          theme_mode: form.theme_mode,
          font_family: form.font_family,
          animations_enabled: form.animations_enabled,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Apparence mise à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Apparence" icon="🎨" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Mode</label>
          <select
            value={form.theme_mode}
            onChange={(e) => setForm({ ...form, theme_mode: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="light">Clair</option>
            <option value="dark">Sombre</option>
            <option value="auto">Automatique</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Police globale</label>
          <select
            value={form.font_family}
            onChange={(e) => setForm({ ...form, font_family: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="Inter">Inter</option>
            <option value="Sora">Sora</option>
            <option value="Roboto">Roboto</option>
            <option value="Open Sans">Open Sans</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-textPrimary)]">
            <input
              type="checkbox"
              checked={form.animations_enabled}
              onChange={(e) => setForm({ ...form, animations_enabled: e.target.checked })}
              className="accent-[var(--color-primary)]"
            />
            Animations activées
          </label>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <Link
          to="/gestion/theme"
          className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textPrimary)]"
        >
          <Palette size={16} /> Éditeur de thème
        </Link>
        <Link
          to="/gestion/animations"
          className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textPrimary)]"
        >
          <Film size={16} /> Éditeur d'animations
        </Link>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={loading}
          className="px-4 py-2 rounded bg-[var(--color-primary)] text-white"
        >
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </SettingsSection>
  );
};
