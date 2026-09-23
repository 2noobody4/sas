// ============================================================
// THEME EDITOR PREVIEW — Onglet Aperçu
// Version V3 — Compatible React 16.14
// ============================================================

import React from 'react';
import { MotionBox } from './MotionBox';

interface ThemeEditorPreviewProps {
  colors: Record<string, string>;
  selectedComponent: string;
  styleProps: Record<string, string | number>;
}

export const ThemeEditorPreview: React.FC<ThemeEditorPreviewProps> = ({
  colors,
  selectedComponent,
  styleProps,
}) => {
  // ✅ Extraire les valeurs avec des valeurs par défaut pour éviter les erreurs de typage
  const borderRadius = typeof styleProps.borderRadius === 'number' ? styleProps.borderRadius : 8;
  const padding = typeof styleProps.padding === 'string' ? styleProps.padding : '8px 16px';
  const border = typeof styleProps.border === 'string' ? styleProps.border : 'none';
  const boxShadow = typeof styleProps.boxShadow === 'string' ? styleProps.boxShadow : 'none';

  return (
    <MotionBox as="div" type="card" variant="large" className="p-4 sm:p-6">
      <h3 className="font-semibold mb-4 text-[var(--color-textPrimary)]">Aperçu du thème</h3>
      <p className="text-sm text-[var(--color-textSecondary)] mb-4">
        Aperçu en direct des modifications appliquées au thème.
      </p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-background)' }}>
          <p style={{ color: 'var(--color-textPrimary)' }}>Texte principal</p>
          <p style={{ color: 'var(--color-textSecondary)' }}>Texte secondaire</p>
          <div className="mt-2 flex gap-2">
            <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: 'var(--color-primary)' }}>Primaire</span>
            <span className="px-2 py-1 rounded-full text-white text-xs" style={{ backgroundColor: 'var(--color-secondary)' }}>Secondaire</span>
          </div>
        </div>
        <div className="p-4 rounded-lg" style={{ backgroundColor: 'var(--color-cardBg)', border: '1px solid var(--color-borderColor)' }}>
          <h4 className="font-semibold" style={{ color: 'var(--color-textPrimary)' }}>Carte</h4>
          <p className="text-sm" style={{ color: 'var(--color-textSecondary)' }}>Contenu de la carte</p>
          <button 
            className="mt-2 px-4 py-1 rounded text-white text-sm" 
            style={{ 
              backgroundColor: 'var(--color-primary)',
              borderRadius: `${borderRadius}px`,
              padding: padding,
              border: border,
              boxShadow: boxShadow,
            }}
          >
            Bouton
          </button>
          <div className="mt-3 text-xs text-[var(--color-textSecondary)]">
            Composant sélectionné : <span className="font-medium">{selectedComponent}</span>
          </div>
        </div>
      </div>
      <div className="mt-4 p-3 rounded-lg bg-[var(--color-secondary)]">
        <p className="text-xs text-[var(--color-textSecondary)]">Couleurs appliquées :</p>
        <div className="flex flex-wrap gap-2 mt-2">
          {Object.entries(colors).map(([key, value]) => (
            <div key={key} className="flex items-center gap-1 text-xs">
              <div className="w-4 h-4 rounded border border-[var(--color-borderColor)]" style={{ backgroundColor: value }} />
              <span className="text-[var(--color-textSecondary)]">{key}</span>
            </div>
          ))}
        </div>
      </div>
    </MotionBox>
  );
};

export default ThemeEditorPreview;
