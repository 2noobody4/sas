import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';
import { MODULES_REGISTRY } from '../../registres/modulesRegistry';
import { resolveLucideIcon } from '../../registres/lucideRegistry';

export const InterfaceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    header_style: config.header_style || 'classic',
    navbar_style: config.navbar_style || 'classic',
    nav_background_color: config.nav_background_color || '#FFFFFF',
    show_logo: true,
    show_name: true,
    show_search: true,
    show_cart: true,
    show_notifications: true,
    show_messages: true,
    show_profile: true,
    sidebar_shortcuts: config.sidebar_shortcuts || [],
  });

  // Récupérer les modules de gestion (isManagement true)
  const managementModules = MODULES_REGISTRY.filter(m => m.isManagement && m.isSidebarItem !== false);

  useEffect(() => {
    if (config.loaded) {
      setForm(prev => ({
        ...prev,
        header_style: config.header_style || 'classic',
        navbar_style: config.navbar_style || 'classic',
        nav_background_color: config.nav_background_color || '#FFFFFF',
        sidebar_shortcuts: config.sidebar_shortcuts || [],
      }));
    }
  }, [config]);

  const toggleShortcut = (moduleId: string) => {
    setForm(prev => {
      const current = prev.sidebar_shortcuts || [];
      if (current.includes(moduleId)) {
        return { ...prev, sidebar_shortcuts: current.filter(id => id !== moduleId) };
      } else {
        return { ...prev, sidebar_shortcuts: [...current, moduleId] };
      }
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      const configId = config.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase
        .from('config')
        .update({
          header_style: form.header_style,
          navbar_style: form.navbar_style,
          nav_background_color: form.nav_background_color,
          sidebar_shortcuts: form.sidebar_shortcuts,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Interface mise à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Interface" icon="🧭" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Style du header</label>
          <select
            value={form.header_style}
            onChange={(e) => setForm({ ...form, header_style: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="classic">Classique</option>
            <option value="dark">Sombre</option>
            <option value="minimal">Minimaliste</option>
            <option value="glass">Verre</option>
            <option value="gradient">Dégradé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Style de navbar</label>
          <select
            value={form.navbar_style}
            onChange={(e) => setForm({ ...form, navbar_style: e.target.value })}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="classic">Classique</option>
            <option value="dark">Sombre</option>
            <option value="floating">Flottant</option>
            <option value="minimal">Minimaliste</option>
            <option value="gradient">Dégradé</option>
            <option value="glass">Verre</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Couleur de fond de la nav</label>
          <input
            type="color"
            value={form.nav_background_color}
            onChange={(e) => setForm({ ...form, nav_background_color: e.target.value })}
            className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
          />
        </div>
        {/* === Gestion des raccourcis de la sidebar === */}
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-[var(--color-textPrimary)]">Raccourcis de la sidebar</p>
          <p className="text-xs text-[var(--color-textSecondary)] mb-2">
            Sélectionnez les modules à afficher dans la sidebar de gestion.
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
            {managementModules.map((mod) => {
              const isChecked = form.sidebar_shortcuts.includes(mod.id);
              const Icon = resolveLucideIcon(mod.icon);
              return (
                <label
                  key={mod.id}
                  className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
                    isChecked ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-[var(--color-borderColor)]'
                  }`}
                >
                  <input
                    type="checkbox"
                    checked={isChecked}
                    onChange={() => toggleShortcut(mod.id)}
                    className="accent-[var(--color-primary)]"
                  />
                  <Icon size={16} className="text-[var(--color-textPrimary)]" />
                  <span className="text-sm text-[var(--color-textPrimary)]">{mod.label}</span>
                </label>
              );
            })}
          </div>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-6">
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
