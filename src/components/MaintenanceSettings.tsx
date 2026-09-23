import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabaseClient';
import { AlertTriangle, Info } from 'lucide-react';

export const MaintenanceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    maintenance_mode: config.maintenance_mode ?? false,
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        maintenance_mode: config.maintenance_mode ?? false,
      });
    }
  }, [config]);

  const handleToggle = async (value: boolean) => {
    setForm({ ...form, maintenance_mode: value });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const configId = config.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase
        .from('config')
        .update({
          maintenance_mode: form.maintenance_mode,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success(
        form.maintenance_mode
          ? 'Mode maintenance ACTIVÉ ✅'
          : 'Mode maintenance désactivé ✅'
      );
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Mode maintenance" icon="🔧" onClose={onClose}>
      {/* Alerte si maintenance active */}
      {form.maintenance_mode && (
        <div className="p-4 rounded-xl bg-[var(--color-warning)]/10 border border-[var(--color-warning)]/30 flex gap-3">
          <AlertTriangle size={20} className="text-[var(--color-warning)] flex-shrink-0 mt-0.5" />
          <div>
            <p className="text-sm font-medium text-[var(--color-textPrimary)]">
              ⚠️ L'application est en mode maintenance
            </p>
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              Seuls les administrateurs et gestionnaires peuvent y accéder. Les autres utilisateurs verront une page de maintenance.
            </p>
          </div>
        </div>
      )}

      {/* Toggle principal */}
      <label className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200 mt-4">
        <div className="flex items-center gap-3">
          <AlertTriangle
            size={20}
            className={form.maintenance_mode ? 'text-[var(--color-warning)]' : 'text-[var(--color-textSecondary)]'}
          />
          <div>
            <p className="text-sm font-medium text-[var(--color-textPrimary)]">
              Activer le mode maintenance
            </p>
            <p className="text-xs mt-1 text-[var(--color-textSecondary)]">
              {form.maintenance_mode
                ? 'L\'application est actuellement en maintenance'
                : 'L\'application est accessible à tous les utilisateurs'}
            </p>
          </div>
        </div>
        <input
          type="checkbox"
          checked={form.maintenance_mode}
          onChange={(e) => handleToggle(e.target.checked)}
          className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
        />
      </label>

      {/* Info */}
      <div className="mt-4 p-3 rounded-xl bg-blue-50 border border-blue-200 flex gap-2">
        <Info size={18} className="text-blue-600 flex-shrink-0 mt-0.5" />
        <div className="text-sm text-blue-700">
          <p className="font-medium">Qui est affecté ?</p>
          <ul className="list-disc list-inside mt-1 space-y-0.5 text-xs">
            <li><b>Admin</b> et <b>Gestionnaire</b> : accès complet (pour préparer la sortie de maintenance)</li>
            <li><b>Autres rôles</b> : voient la page "Maintenance en cours"</li>
          </ul>
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

export default MaintenanceSettings;
