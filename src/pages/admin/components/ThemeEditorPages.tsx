// ============================================================
// THEME EDITOR PAGES — Onglet Pages
// Source: MotionBoxUsage
// Version V3 — Compatible React 16.14
// ============================================================

import React from 'react';
import { MotionBox } from '../../../components/ui/MotionBox';
import { getMotionBoxUsagesByPage, getAllPages, MotionBoxUsage } from '../../../registres/motionBoxUsages';
import { Grid, X, Save } from 'lucide-react';

interface ThemeEditorPagesProps {
  selectedPageForEdit: string;
  selectedPageComponent: string;
  pageStyleProps: Record<string, string | number>;
  componentStyles: Record<string, any>;
  onPageSelect: (page: string) => void;
  onComponentSelect: (page: string, compKey: string) => void;
  onStyleChange: (key: string, value: string | number) => void;
  onSave: () => void;
  onClear: () => void;
  saving: boolean;
}

export const ThemeEditorPages: React.FC<ThemeEditorPagesProps> = ({
  selectedPageForEdit,
  selectedPageComponent,
  pageStyleProps,
  componentStyles,
  onPageSelect,
  onComponentSelect,
  onStyleChange,
  onSave,
  onClear,
  saving,
}) => {
  const pagesList = getAllPages();

  return (
    <MotionBox as="div" type="card" variant="large" className="p-4 sm:p-6">
      <div className="flex items-center justify-between mb-4">
        <div>
          <h3 className="font-semibold text-[var(--color-textPrimary)]">Composants par page</h3>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Personnalisez les composants utilisés dans chaque page
          </p>
        </div>
        <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
          {pagesList.length} pages
        </span>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="space-y-2 max-h-96 overflow-y-auto">
          {pagesList.map((page) => {
            const usages = getMotionBoxUsagesByPage(page);
            return (
              <div
                key={page}
                className={`p-3 rounded-xl border transition cursor-pointer ${
                  selectedPageForEdit === page ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]' : 'border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]'
                }`}
                onClick={() => onPageSelect(page)}
              >
                <div className="flex items-center justify-between">
                  <span className="font-medium text-[var(--color-textPrimary)]">{page}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                    {usages.length} composant{usages.length > 1 ? 's' : ''}
                  </span>
                </div>
                {selectedPageForEdit === page && usages.length > 0 && (
                  <div className="mt-2 space-y-1">
                    {usages.map((usage: MotionBoxUsage) => {
                      const compKey = `${usage.type}:${usage.variant || 'default'}`;
                      const isSelected = selectedPageComponent === compKey;
                      const compStyle = componentStyles[compKey]?.style || {};
                      return (
                        <div
                          key={usage.id}
                          className={`flex items-center justify-between p-2 rounded-lg border transition cursor-pointer ${
                            isSelected ? 'border-[var(--color-primary)] bg-[var(--color-primary)]/10' : 'border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]'
                          }`}
                          onClick={(e) => {
                            e.stopPropagation();
                            onComponentSelect(page, compKey);
                          }}
                        >
                          <div className="flex items-center gap-2">
                            <div
                              className="w-4 h-4 rounded border border-[var(--color-borderColor)]"
                              style={{ backgroundColor: compStyle.backgroundColor || '#FFFFFF' }}
                            />
                            <span className="text-sm text-[var(--color-textPrimary)]">{usage.id}</span>
                          </div>
                          <span className="text-xs text-[var(--color-textSecondary)]">
                            {usage.type}:{usage.variant || 'default'}
                          </span>
                        </div>
                      );
                    })}
                  </div>
                )}
                {selectedPageForEdit === page && usages.length === 0 && (
                  <p className="text-sm text-[var(--color-textSecondary)] mt-2">Aucun composant défini pour cette page</p>
                )}
              </div>
            );
          })}
        </div>

        <div>
          {selectedPageComponent ? (
            <div className="p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-[var(--color-textPrimary)]">
                  Style : <span className="text-[var(--color-primary)]">{selectedPageComponent}</span>
                </h4>
                <button
                  onClick={onClear}
                  className="text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
                >
                  <X size={18} />
                </button>
              </div>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Couleur de fond</label>
                  <input
                    type="color"
                    value={pageStyleProps.backgroundColor as string || '#FFFFFF'}
                    onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Couleur du texte</label>
                  <input
                    type="color"
                    value={pageStyleProps.color as string || '#1E3A5F'}
                    onChange={(e) => onStyleChange('color', e.target.value)}
                    className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Arrondi (px)</label>
                  <input
                    type="number"
                    value={pageStyleProps.borderRadius as number || 12}
                    onChange={(e) => onStyleChange('borderRadius', parseInt(e.target.value) || 0)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    min={0} max={50}
                  />
                </div>
                <div>
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Padding</label>
                  <input
                    type="text"
                    value={pageStyleProps.padding as string || '16px 20px'}
                    onChange={(e) => onStyleChange('padding', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    placeholder="16px 20px"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Bordure</label>
                  <input
                    type="text"
                    value={pageStyleProps.border as string || '1px solid #E2E6EA'}
                    onChange={(e) => onStyleChange('border', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    placeholder="1px solid #E2E6EA"
                  />
                </div>
                <div className="sm:col-span-2">
                  <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Ombre</label>
                  <input
                    type="text"
                    value={pageStyleProps.boxShadow as string || '0 2px 8px rgba(0,0,0,0.06)'}
                    onChange={(e) => onStyleChange('boxShadow', e.target.value)}
                    className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    placeholder="0 2px 8px rgba(0,0,0,0.06)"
                  />
                </div>
              </div>

              <div className="mt-3 p-3 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
                <p className="text-xs text-[var(--color-textSecondary)] mb-1">Aperçu</p>
                <MotionBox
                  as="div"
                  type={selectedPageComponent.split(':')[0] || 'box'}
                  variant={selectedPageComponent.split(':')[1] || 'default'}
                  className="p-4 rounded-lg"
                  style={{ proprietes: pageStyleProps }}
                >
                  <p className="text-sm font-medium text-[var(--color-textPrimary)]">Aperçu du composant</p>
                  <p className="text-xs text-[var(--color-textSecondary)]">{selectedPageComponent}</p>
                </MotionBox>
              </div>

              <div className="flex justify-end gap-3 mt-3 pt-3 border-t border-[var(--color-borderColor)]">
                <button
                  onClick={() => {
                    onStyleChange('backgroundColor', '#FFFFFF');
                    onStyleChange('color', '#1E3A5F');
                    onStyleChange('borderRadius', 12);
                    onStyleChange('padding', '16px 20px');
                    onStyleChange('border', '1px solid #E2E6EA');
                    onStyleChange('boxShadow', '0 2px 8px rgba(0,0,0,0.06)');
                  }}
                  className="px-3 py-1.5 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] text-sm"
                >
                  Réinitialiser
                </button>
                <button
                  onClick={onSave}
                  disabled={saving}
                  className="px-3 py-1.5 rounded bg-[var(--color-primary)] text-white text-sm flex items-center gap-1"
                >
                  {saving ? 'En cours...' : <><Save size={14} /> Appliquer</>}
                </button>
              </div>
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center h-64 text-[var(--color-textSecondary)] border-2 border-dashed border-[var(--color-borderColor)] rounded-xl p-4">
              <Grid size={48} className="opacity-30 mb-4" />
              <p className="text-lg font-medium">Sélectionnez un composant</p>
              <p className="text-sm">Choisissez une page puis un composant dans la liste de gauche.</p>
            </div>
          )}
        </div>
      </div>
    </MotionBox>
  );
};

export default ThemeEditorPages;
