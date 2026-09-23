import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabaseClient';
import { Clock, LogOut, Shield, Info } from 'lucide-react';

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
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-textPrimary)]">
            <Clock size={16} /> Durée de session (minutes)
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
            Temps maximum avant expiration de la session (5-480 min).
          </p>
        </div>
        <div>
          <label className="flex items-center gap-2 text-sm font-medium text-[var(--color-textPrimary)]">
            <LogOut size={16} /> Déconnexion auto (minutes)
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
      </div>

      {/* Info sur le comportement */}
      <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex gap-2">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Comment ça marche</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
            <li>La session expire automatiquement après <b>{form.session_duration} min</b></li>
            <li>L'utilisateur est déconnecté après <b>{form.inactivity_timeout} min</b> sans action</li>
            <li>Les mouvements de souris, clics et clavier comptent comme activité</li>
          </ul>
        </div>
      </div>

      {/* 2FA — marqué comme à venir */}
      <div className="mt-4">
        <label className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-secondary)] cursor-not-allowed opacity-60">
          <div className="flex items-center gap-3">
            <Shield size={20} className="text-[var(--color-textSecondary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                Authentification à deux facteurs (2FA)
              </p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">
                🔒 Bientôt disponible — nécessite un service SMS/TOTP
              </p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={false}
            disabled
            className="w-5 h-5 rounded cursor-not-allowed"
          />
        </label>
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

export default SecuritySettings;
