// ============================================================
// THEME EDITOR COLORS — Onglet Couleurs
// Version V3.1 — Ajout catégorie Navigation
// ============================================================

import React from 'react';
import { MotionBox } from './MotionBox';
import { useToast } from '../hooks/useToast';

interface ThemeEditorColorsProps {
  colors: Record<string, string>;
  onColorChange: (key: string, value: string) => void;
  onReset: () => void;
}

const COLOR_LABELS: Record<string, string> = {
  // Fond général
  background: 'Fond de page',
  cardBg: 'Fond de carte',

  // Couleurs principales
  primary: 'Primaire',
  secondary: 'Secondaire',
  accent: 'Accent',

  // États
  danger: 'Danger',
  success: 'Succès',
  warning: 'Avertissement',
  info: 'Information',

  // Texte et bordures
  textPrimary: 'Texte principal',
  textSecondary: 'Texte secondaire',
  borderColor: 'Couleur de bordure',

  // Primaire étendu
  primaryLight: 'Primaire clair',
  primaryDark: 'Primaire foncé',
  successLight: 'Succès clair',
  successDark: 'Succès foncé',

  // ⭐ Navigation
  navbarBg: 'Fond de la navbar',
  headerBg: 'Fond du header',

  // Cartes
  smallCardBg: 'Fond carte S',
  mediumCardBg: 'Fond carte M',
  largeCardBg: 'Fond carte L',
  xlargeCardBg: 'Fond carte XL',
  smallCardBorder: 'Bordure carte S',
  mediumCardBorder: 'Bordure carte M',
  largeCardBorder: 'Bordure carte L',
  xlargeCardBorder: 'Bordure carte XL',
};

const COLOR_CATEGORIES: Record<string, string[]> = {
  'Principales': ['primary', 'secondary', 'accent'],
  'États': ['danger', 'success', 'warning', 'info'],
  'Fond et texte': ['background', 'cardBg', 'textPrimary', 'textSecondary', 'borderColor'],
  'Navigation': ['navbarBg', 'headerBg'],
  'Primaire étendu': ['primaryLight', 'primaryDark', 'successLight', 'successDark'],
  'Cartes': [
    'smallCardBg', 'mediumCardBg', 'largeCardBg', 'xlargeCardBg',
    'smallCardBorder', 'mediumCardBorder', 'largeCardBorder', 'xlargeCardBorder',
  ],
};

export const ThemeEditorColors: React.FC<ThemeEditorColorsProps> = ({
  colors,
  onColorChange,
  onReset,
}) => {
  const { success } = useToast();
  const entries = Object.entries(colors);

  const availableCategories = Object.entries(COLOR_CATEGORIES).filter(([_, keys]) =>
    keys.some(k => entries.some(([key]) => key === k))
  );

  return (
    <MotionBox as="div" type="card" variant="large" className="p-4 sm:p-6">
      <div className="flex justify-between items-center mb-4">
        <h3 className="font-semibold text-[var(--color-textPrimary)]">Couleurs du thème</h3>
        <span className="text-xs text-[var(--color-textSecondary)]">{entries.length} couleurs</span>
      </div>

      {availableCategories.map(([category, keys]) => (
        <div key={category} className="mb-6 last:mb-0">
          <p className="text-xs font-medium uppercase tracking-wider mb-2 text-[var(--color-textSecondary)]">
            {category}
          </p>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {keys.map((key) => {
              const value = (colors as any)[key];
              if (!value) return null;
              const labelFr = COLOR_LABELS[key] || key;
              return (
                <div
                  key={key}
                  className="flex items-center gap-3 p-2 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
                >
                  <label className="text-sm capitalize w-32 flex-shrink-0 text-[var(--color-textPrimary)]">
                    {labelFr}
                  </label>
                  <input
                    type="color"
                    value={value}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="w-10 h-10 rounded border cursor-pointer flex-shrink-0 border-[var(--color-borderColor)]"
                  />
                  <input
                    type="text"
                    value={value}
                    onChange={(e) => onColorChange(key, e.target.value)}
                    className="flex-1 min-w-0 px-2 py-1 border rounded text-sm font-mono border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  />
                </div>
              );
            })}
          </div>
        </div>
      ))}

      <div className="mt-4 pt-4 border-t border-[var(--color-borderColor)] flex justify-end">
        <button
          onClick={() => {
            onReset();
            success('Couleurs réinitialisées ✅');
          }}
          className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition"
        >
          🔄 Réinitialiser les couleurs
        </button>
      </div>
    </MotionBox>
  );
};

export default ThemeEditorColors;
