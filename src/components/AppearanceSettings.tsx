import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { supabase } from '../lib/supabaseClient';
import { Link } from 'react-router-dom';
import { Palette, Film } from 'lucide-react';

const AVAILABLE_FONTS = [
  { value: 'Inter', label: 'Inter', category: 'Moderne' },
  { value: 'Manrope', label: 'Manrope', category: 'Moderne' },
  { value: 'Sora', label: 'Sora', category: 'Moderne' },
  { value: 'Poppins', label: 'Poppins', category: 'Moderne' },
  { value: 'Montserrat', label: 'Montserrat', category: 'Moderne' },
  { value: 'Work Sans', label: 'Work Sans', category: 'Moderne' },
  { value: 'Raleway', label: 'Raleway', category: 'Moderne' },

  { value: 'Roboto', label: 'Roboto', category: 'Neutre' },
  { value: 'Open Sans', label: 'Open Sans', category: 'Neutre' },
  { value: 'Lato', label: 'Lato', category: 'Neutre' },
  { value: 'Nunito', label: 'Nunito', category: 'Neutre' },

  { value: 'Quicksand', label: 'Quicksand', category: 'Arrondie' },
  { value: 'Oswald', label: 'Oswald', category: 'Condensée' },

  { value: 'Merriweather', label: 'Merriweather', category: 'Serif' },
  { value: 'Playfair Display', label: 'Playfair Display', category: 'Serif' },
];

export const AppearanceSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { refreshTheme } = useTheme();
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

  const applyFontPreview = (font: string) => {
    document.body.style.fontFamily = `'${font}', sans-serif`;
  };

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
      await refreshTheme();

      success('Apparence mise a jour');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  // Groupes par catégorie
  const groupedFonts = AVAILABLE_FONTS.reduce((acc, font) => {
    const cat = font.category || 'Autres';
    if (!acc[cat]) acc[cat] = [];
    acc[cat].push(font);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_FONTS>);

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
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">
            Police globale <span className="text-xs text-[var(--color-textSecondary)]">(15 polices)</span>
          </label>
          <select
            value={form.font_family}
            onChange={(e) => {
              setForm({ ...form, font_family: e.target.value });
              applyFontPreview(e.target.value);
            }}
            className="w-full px-3 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            {Object.entries(groupedFonts).map(([category, fonts]) => (
              <optgroup key={category} label={category}>
                {fonts.map((f) => (
                  <option key={f.value} value={f.value}>{f.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
          <p className="text-xs mt-1 text-[var(--color-textSecondary)]">
            L'apercu s'applique immediatement. Sauvegardez pour persister.
          </p>
        </div>

        <div className="md:col-span-2">
          <label className="flex items-center gap-3 text-sm font-medium text-[var(--color-textPrimary)]">
            <input
              type="checkbox"
              checked={form.animations_enabled}
              onChange={(e) => setForm({ ...form, animations_enabled: e.target.checked })}
              className="accent-[var(--color-primary)]"
            />
            Animations activees
          </label>
        </div>

        {/* Aperçu */}
        <div className="md:col-span-2 p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
          <p className="text-sm font-medium text-[var(--color-textPrimary)] mb-3">
            Apercu : <b>{form.font_family}</b>
          </p>
          <div style={{ fontFamily: `'${form.font_family}', sans-serif` }}>
            <p className="text-2xl font-bold text-[var(--color-textPrimary)]">
              Titre principal
            </p>
            <p className="text-lg text-[var(--color-textPrimary)] mt-2">
              Sous-titre en {form.font_family}
            </p>
            <p className="text-sm text-[var(--color-textSecondary)] mt-2">
              Ceci est un paragraphe de texte pour visualiser le rendu de la police choisie.
              L'objectif est de voir comment les lettres, les accents (é à ù ç ê) et les chiffres
              s'affichent dans un contexte réel d'utilisation.
            </p>
            <p className="text-xs text-[var(--color-textSecondary)] mt-2">
              Chiffres : 1 234 567,89 FCFA · 01/01/2025 · 12:30
            </p>
          </div>
        </div>

        {/* Grille de toutes les polices */}
        <div className="md:col-span-2 p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
          <p className="text-sm font-medium text-[var(--color-textPrimary)] mb-3">
            Toutes les polices disponibles
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2 max-h-96 overflow-y-auto">
            {AVAILABLE_FONTS.map((f) => (
              <button
                key={f.value}
                type="button"
                onClick={() => {
                  setForm({ ...form, font_family: f.value });
                  applyFontPreview(f.value);
                }}
                className={`p-3 rounded-lg border text-left transition ${
                  form.font_family === f.value
                    ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                    : 'border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]'
                }`}
              >
                <p
                  className="text-base font-medium text-[var(--color-textPrimary)]"
                  style={{ fontFamily: `'${f.value}', sans-serif` }}
                >
                  {f.label}
                </p>
                <p className="text-xs text-[var(--color-textSecondary)] mt-1">
                  {f.category}
                </p>
              </button>
            ))}
          </div>
        </div>
      </div>

      <div className="flex flex-wrap gap-4 mt-4">
        <Link
          to="/gestion/theme"
          className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textPrimary)]"
        >
          <Palette size={16} /> Editeur de theme
        </Link>
        <Link
          to="/gestion/animations"
          className="flex items-center gap-2 px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textPrimary)]"
        >
          <Film size={16} /> Editeur d'animations
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

export default AppearanceSettings;
