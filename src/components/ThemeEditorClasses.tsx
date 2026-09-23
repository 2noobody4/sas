// ============================================================
// THEME EDITOR CLASSES — Onglet Classes CSS
// Version V3 — Compatible React 16.14
// ============================================================

import React from 'react';
import { MotionBox } from './MotionBox';

interface ThemeEditorClassesProps {
  classStyles: Record<string, string>;
  managementModules: any[];
  onClassChange: (componentId: string, classes: string) => void;
}

export const ThemeEditorClasses: React.FC<ThemeEditorClassesProps> = ({
  classStyles,
  managementModules,
  onClassChange,
}) => {
  return (
    <MotionBox as="div" type="card" variant="large" className="p-4 sm:p-6">
      <h3 className="font-semibold mb-4 text-[var(--color-textPrimary)]">Classes CSS personnalisées</h3>
      <p className="text-sm text-[var(--color-textSecondary)] mb-4">
        Ajoutez des classes Tailwind personnalisées pour chaque composant ou module.
      </p>
      <div className="space-y-3">
        {managementModules.map((mod) => (
          <div key={mod.id} className="flex items-center gap-3 p-2 border rounded border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
            <span className="text-sm font-medium w-32 text-[var(--color-textPrimary)]">{mod.label}</span>
            <input
              type="text"
              value={classStyles[mod.id] || ''}
              onChange={(e) => onClassChange(mod.id, e.target.value)}
              placeholder="ex: bg-blue-50 hover:shadow-lg"
              className="flex-1 px-3 py-1 border rounded text-sm border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          </div>
        ))}
      </div>
    </MotionBox>
  );
};

export default ThemeEditorClasses;
