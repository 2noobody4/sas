import React, { useState, useEffect, useMemo } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useUserConfig, useUpdateUserConfig } from '../hooks/useUserConfig';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabaseClient';
import { MODULES_REGISTRY } from '../registres/modulesRegistry';
import { resolveLucideIcon } from '../registres/lucideRegistry';
import { useAuth } from '../hooks/useAuth';
import type { ModuleDefinition } from '../registres/modulesTypes';

export const InterfaceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { user } = useAuth();
  const { data: userConfig } = useUserConfig();
  const updateUserConfig = useUpdateUserConfig();
  const { success, error: toastError } = useToast();

  const role = user?.role?.nom || 'client';
  const isAdmin = role === 'admin' || role === 'gestionnaire';

  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    header_style: config.header_style || 'classic',
    navbar_style: config.navbar_style || 'classic',
    nav_background_color: config.nav_background_color || '#FFFFFF',
    sidebar_shortcuts: [] as string[],
  });

  // Tous les modules de management
  const allManagementModules = useMemo(
    () => MODULES_REGISTRY.filter(m => m.isManagement === true),
    []
  );

  const grouped = useMemo(() => {
    const parents = allManagementModules.filter(m => m.isSidebarItem !== false);
    const children = allManagementModules.filter(m => m.isSidebarItem === false);

    return parents.map(parent => ({
      parent,
      children: children.filter(c => c.path.startsWith(parent.path + '/') && c.path !== parent.path),
    }));
  }, [allManagementModules]);

  useEffect(() => {
    if (config.loaded) {
      // Priorité : user_config > config globale
      const shortcuts = userConfig?.sidebar_shortcuts?.length
        ? userConfig.sidebar_shortcuts
        : (config.sidebar_shortcuts || []);

      setForm({
        header_style: config.header_style || 'classic',
        navbar_style: config.navbar_style || 'classic',
        nav_background_color: config.nav_background_color || '#FFFFFF',
        sidebar_shortcuts: shortcuts,
      });
    }
  }, [config, userConfig]);

  const toggleShortcut = (moduleId: string) => {
    setForm(prev => {
      const current = prev.sidebar_shortcuts || [];
      if (current.includes(moduleId)) {
        return { ...prev, sidebar_shortcuts: current.filter(id => id !== moduleId) };
      }
      return { ...prev, sidebar_shortcuts: [...current, moduleId] };
    });
  };

  const toggleAllChildren = (parentId: string, childrenIds: string[], select: boolean) => {
    setForm(prev => {
      const current = prev.sidebar_shortcuts || [];
      const filtered = current.filter(id => id !== parentId && !childrenIds.includes(id));
      const added = select ? [parentId, ...childrenIds] : [];
      return { ...prev, sidebar_shortcuts: [...filtered, ...added] };
    });
  };

  const handleSave = async () => {
    setLoading(true);
    try {
      // 1. Styles globaux (header/navbar) → table config (admin uniquement)
      if (isAdmin) {
        const configId = config.id || '00000000-0000-0000-0000-000000000000';
        const { error } = await supabase
          .from('config')
          .update({
            header_style: form.header_style,
            navbar_style: form.navbar_style,
            nav_background_color: form.nav_background_color,
          })
          .eq('id', configId);
        if (error) throw error;
      }

      // 2. Sidebar shortcuts → user_config (perso à chaque user)
      await updateUserConfig.mutateAsync({
        sidebar_shortcuts: form.sidebar_shortcuts,
      });

      if (isAdmin) {
        await config.refreshConfig();
      }

      success('Interface mise à jour');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const renderModuleCheckbox = (mod: ModuleDefinition, indent = 0) => {
    const isChecked = form.sidebar_shortcuts.includes(mod.id);
    const Icon = resolveLucideIcon(mod.icon);
    return (
      <label
        key={mod.id}
        className={`flex items-center gap-2 p-2 rounded-lg border cursor-pointer transition ${
          isChecked ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-[var(--color-borderColor)]'
        }`}
        style={{ marginLeft: indent * 16 }}
      >
        <input
          type="checkbox"
          checked={isChecked}
          onChange={() => toggleShortcut(mod.id)}
          className="accent-[var(--color-primary)]"
        />
        <Icon size={14} className="text-[var(--color-textPrimary)] flex-shrink-0" />
        <span className="text-sm text-[var(--color-textPrimary)] truncate">{mod.label}</span>
      </label>
    );
  };

  return (
    <SettingsSection title="Interface" icon="🧭" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Style du header {!isAdmin && <span className="text-xs text-[var(--color-textSecondary)]">(admin)</span>}
          </label>
          <select
            value={form.header_style}
            onChange={(e) => setForm({ ...form, header_style: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] disabled:opacity-60"
          >
            <option value="classic">Classique</option>
            <option value="dark">Sombre</option>
            <option value="minimal">Minimaliste</option>
            <option value="glass">Verre</option>
            <option value="gradient">Dégradé</option>
          </select>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Style de navbar {!isAdmin && <span className="text-xs text-[var(--color-textSecondary)]">(admin)</span>}
          </label>
          <select
            value={form.navbar_style}
            onChange={(e) => setForm({ ...form, navbar_style: e.target.value })}
            disabled={!isAdmin}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] disabled:opacity-60"
          >
            <option value="classic">Classique</option>
            <option value="dark">Sombre</option>
            <option value="floating">Flottant</option>
            <option value="minimal">Minimaliste</option>
            <option value="gradient">Dégradé</option>
            <option value="glass">Verre</option>
          </select>
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Couleur de fond de la nav {!isAdmin && <span className="text-xs text-[var(--color-textSecondary)]">(admin)</span>}
          </label>
          <input
            type="color"
            value={form.nav_background_color}
            onChange={(e) => setForm({ ...form, nav_background_color: e.target.value })}
            disabled={!isAdmin}
            className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)] disabled:opacity-60"
          />
        </div>
      </div>

      {/* === SIDEBAR (personnel) === */}
      <div className="mt-6">
        <div className="flex items-center justify-between mb-2">
          <div>
            <p className="text-sm font-medium text-[var(--color-textPrimary)]">Sidebar</p>
            <p className="text-xs text-[var(--color-textSecondary)]">
              {form.sidebar_shortcuts.length} module(s) sélectionné(s) sur {allManagementModules.length}
              {!isAdmin && ' — configuration personnelle'}
            </p>
          </div>
          <div className="flex gap-2">
            <button
              type="button"
              onClick={() => setForm({ ...form, sidebar_shortcuts: allManagementModules.map(m => m.id) })}
              className="text-xs px-2 py-1 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)]"
            >
              Tout cocher
            </button>
            <button
              type="button"
              onClick={() => setForm({ ...form, sidebar_shortcuts: [] })}
              className="text-xs px-2 py-1 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)]"
            >
              Tout décocher
            </button>
          </div>
        </div>

        <div className="space-y-4 max-h-[500px] overflow-y-auto p-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
          {grouped.map(({ parent, children }) => (
            <div key={parent.id} className="border-b border-[var(--color-borderColor)] last:border-0 pb-3 last:pb-0">
              <div className="flex items-center justify-between mb-2">
                <span className="text-xs font-semibold uppercase tracking-wide text-[var(--color-textSecondary)]">
                  {parent.label}
                </span>
                {children.length > 0 && (
                  <button
                    type="button"
                    onClick={() => {
                      const childrenIds = children.map(c => c.id);
                      const allSelected = childrenIds.every(id => form.sidebar_shortcuts.includes(id));
                      toggleAllChildren(parent.id, childrenIds, !allSelected);
                    }}
                    className="text-[10px] text-[var(--color-primary)] hover:underline"
                  >
                    {children.every(c => form.sidebar_shortcuts.includes(c.id)) ? 'Décocher tout' : 'Cocher tout'}
                  </button>
                )}
              </div>

              <div className="space-y-1">
                {renderModuleCheckbox(parent)}
                {children.length > 0 && (
                  <div className="ml-4 space-y-1 mt-1">
                    {children.map(c => renderModuleCheckbox(c, 1))}
                  </div>
                )}
              </div>
            </div>
          ))}
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

export default InterfaceSettings;
