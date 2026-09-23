import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabaseClient';

export const LocalizationSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    locale: config.locale || 'fr',
    currency: config.currency || 'XOF',
    timezone: config.timezone || 'Africa/Dakar',
    date_format: config.dateFormat || 'DD/MM/YYYY',
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        locale: config.locale || 'fr',
        currency: config.currency || 'XOF',
        timezone: config.timezone || 'Africa/Dakar',
        date_format: config.dateFormat || 'DD/MM/YYYY',
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
          locale: form.locale,
          currency: form.currency,
          timezone: form.timezone,
          date_format: form.date_format,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Régionalisation mise à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Régionalisation" icon="🌍" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Langue</label>
          <select
            value={form.locale}
            onChange={(e) => setForm({ ...form, locale: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="fr">Français</option>
            <option value="en">English</option>
            <option value="ar">العربية</option>
            <option value="wo">Wolof</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Devise</label>
          <select
            value={form.currency}
            onChange={(e) => setForm({ ...form, currency: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="XOF">FCFA (XOF)</option>
            <option value="EUR">Euro (€)</option>
            <option value="USD">Dollar ($)</option>
            <option value="GBP">Livre (£)</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Fuseau horaire</label>
          <select
            value={form.timezone}
            onChange={(e) => setForm({ ...form, timezone: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="Africa/Dakar">Africa/Dakar</option>
            <option value="Africa/Abidjan">Africa/Abidjan</option>
            <option value="Africa/Lagos">Africa/Lagos</option>
            <option value="Europe/Paris">Europe/Paris</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Format des dates</label>
          <select
            value={form.date_format}
            onChange={(e) => setForm({ ...form, date_format: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="DD/MM/YYYY">DD/MM/YYYY</option>
            <option value="MM/DD/YYYY">MM/DD/YYYY</option>
            <option value="YYYY-MM-DD">YYYY-MM-DD</option>
          </select>
        </div>
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
