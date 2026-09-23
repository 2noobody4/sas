import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabaseClient';
import { ShoppingBag, Briefcase, LayoutGrid, List } from 'lucide-react';

export const BoutiqueServicesSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    show_boutique: config.show_boutique ?? true,
    show_services: config.show_services ?? true,
    boutique_display_mode: config.boutique_display_mode || 'grid',
    service_display_mode: config.service_display_mode || 'full',
    products_per_page: config.products_per_page ?? 12,
    services_per_page: config.services_per_page ?? 12,
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        show_boutique: config.show_boutique ?? true,
        show_services: config.show_services ?? true,
        boutique_display_mode: config.boutique_display_mode || 'grid',
        service_display_mode: config.service_display_mode || 'full',
        products_per_page: config.products_per_page ?? 12,
        services_per_page: config.services_per_page ?? 12,
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
          show_boutique: form.show_boutique,
          show_services: form.show_services,
          boutique_display_mode: form.boutique_display_mode,
          service_display_mode: form.service_display_mode,
          products_per_page: form.products_per_page,
          services_per_page: form.services_per_page,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Boutique & Services mis à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <SettingsSection title="Boutique & Services" icon="🛍️" onClose={onClose}>
      {/* Activation des modules */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <label className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200">
          <div className="flex items-center gap-3">
            <ShoppingBag size={20} className="text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">Activer la boutique</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Affiche le catalogue produits</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.show_boutique}
            onChange={(e) => setForm({ ...form, show_boutique: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
          />
        </label>

        <label className="flex items-center justify-between w-full p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer transition-all duration-200">
          <div className="flex items-center gap-3">
            <Briefcase size={20} className="text-[var(--color-primary)]" />
            <div>
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">Activer les services</p>
              <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Affiche la page des services</p>
            </div>
          </div>
          <input
            type="checkbox"
            checked={form.show_services}
            onChange={(e) => setForm({ ...form, show_services: e.target.checked })}
            className="w-5 h-5 rounded cursor-pointer accent-[var(--color-primary)]"
          />
        </label>
      </div>

      {/* Mode d'affichage boutique */}
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--color-textPrimary)] mb-2">Affichage des produits</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, boutique_display_mode: 'grid' })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
              form.boutique_display_mode === 'grid'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)]'
            }`}
          >
            <LayoutGrid size={16} /> Grille
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, boutique_display_mode: 'list' })}
            className={`flex-1 flex items-center justify-center gap-2 px-4 py-2 rounded-lg border transition ${
              form.boutique_display_mode === 'list'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)]'
            }`}
          >
            <List size={16} /> Liste
          </button>
        </div>
      </div>

      {/* Mode d'affichage services */}
      <div className="mt-4">
        <p className="text-sm font-medium text-[var(--color-textPrimary)] mb-2">Affichage des services</p>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => setForm({ ...form, service_display_mode: 'full' })}
            className={`flex-1 px-4 py-2 rounded-lg border transition ${
              form.service_display_mode === 'full'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)]'
            }`}
          >
            Complet
          </button>
          <button
            type="button"
            onClick={() => setForm({ ...form, service_display_mode: 'compact' })}
            className={`flex-1 px-4 py-2 rounded-lg border transition ${
              form.service_display_mode === 'compact'
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)] text-[var(--color-primary)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)]'
            }`}
          >
            Compact
          </button>
        </div>
      </div>

      {/* Pagination */}
      <div className="mt-4 grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Produits par page
          </label>
          <input
            type="number"
            value={form.products_per_page}
            onChange={(e) => setForm({ ...form, products_per_page: parseInt(e.target.value) || 12 })}
            min={4}
            max={48}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
          <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Entre 4 et 48</p>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Services par page
          </label>
          <input
            type="number"
            value={form.services_per_page}
            onChange={(e) => setForm({ ...form, services_per_page: parseInt(e.target.value) || 12 })}
            min={4}
            max={48}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
          <p className="text-xs mt-1 text-[var(--color-textSecondary)]">Entre 4 et 48</p>
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

export default BoutiqueServicesSettings;
