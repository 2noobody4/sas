// ============================================================
// THEME EDITOR TYPOGRAPHY — Onglet Typographie
// Version V3 — Compatible React 16.14
// ============================================================

import React from 'react';
import { MotionBox } from './MotionBox';
import { AVAILABLE_FONTS } from '../types/theme-types';
import { useToast } from '../hooks/useToast';

interface ThemeEditorTypographyProps {
  typography: {
    policeTitre: string;
    policeTexte: string;
    policeChiffres: string;
    echelleTaille: Record<string, number>;
  };
  onTypographyChange: (key: string, value: any) => void;
  onReset: () => void;
}

export const ThemeEditorTypography: React.FC<ThemeEditorTypographyProps> = ({
  typography,
  onTypographyChange,
  onReset,
}) => {
  const { success } = useToast();
  const fontsByCategory = AVAILABLE_FONTS.reduce((acc, font) => {
    const category = font.category || 'Autres';
    if (!acc[category]) acc[category] = [];
    acc[category].push(font);
    return acc;
  }, {} as Record<string, typeof AVAILABLE_FONTS>);

  return (
    <MotionBox as="div" type="card" variant="large" className="p-4 sm:p-6">
      <h3 className="font-semibold mb-4 text-[var(--color-textPrimary)]">Typographie</h3>
      <div className="space-y-6">
        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--color-textPrimary)]">
            Police de titre <span className="text-xs text-[var(--color-textSecondary)]">(21 polices disponibles)</span>
          </label>
          <select
            value={typography.policeTitre || ''}
            onChange={(e) => onTypographyChange('policeTitre', e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <optgroup key={category} label={category}>
                {fonts.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--color-textPrimary)]">
            Police de texte <span className="text-xs text-[var(--color-textSecondary)]">(21 polices disponibles)</span>
          </label>
          <select
            value={typography.policeTexte || ''}
            onChange={(e) => onTypographyChange('policeTexte', e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            {Object.entries(fontsByCategory).map(([category, fonts]) => (
              <optgroup key={category} label={category}>
                {fonts.map((font) => (
                  <option key={font.value} value={font.value}>{font.label}</option>
                ))}
              </optgroup>
            ))}
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--color-textPrimary)]">Police de chiffres</label>
          <select
            value={typography.policeChiffres || ''}
            onChange={(e) => onTypographyChange('policeChiffres', e.target.value)}
            className="w-full px-3 py-2 border rounded text-sm border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          >
            <option value="'IBM Plex Mono', monospace">IBM Plex Mono</option>
            <option value="'Courier New', monospace">Courier New</option>
            <option value="'Fira Code', monospace">Fira Code</option>
            <option value="'JetBrains Mono', monospace">JetBrains Mono</option>
            <option value="'Source Code Pro', monospace">Source Code Pro</option>
            <option value="'Menlo', monospace">Menlo</option>
            <option value="'Consolas', monospace">Consolas</option>
            <option value="monospace">Monospace par défaut</option>
          </select>
        </div>

        <div>
          <label className="block text-sm font-medium mb-1 text-[var(--color-textPrimary)]">Échelle des tailles (px)</label>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {Object.entries(typography.echelleTaille || {}).map(([key, val]) => (
              <div key={key} className="flex items-center gap-1">
                <span className="text-xs w-8 text-[var(--color-textSecondary)]">{key}</span>
                <input
                  type="number"
                  value={val as number || 0}
                  onChange={(e) => {
                    const newEchelle = { ...(typography.echelleTaille || {}), [key]: Number(e.target.value) };
                    onTypographyChange('echelleTaille', newEchelle);
                  }}
                  className="flex-1 min-w-0 px-2 py-1 border rounded text-sm border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                  min={8} max={80}
                />
              </div>
            ))}
          </div>
        </div>

        <div className="flex justify-end pt-2 border-t border-[var(--color-borderColor)]">
          <button
            onClick={() => {
              onReset();
              success('Typographie réinitialisée ✅');
            }}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition"
          >
            🔄 Réinitialiser la typographie
          </button>
        </div>
      </div>
    </MotionBox>
  );
};

export default ThemeEditorTypography;
