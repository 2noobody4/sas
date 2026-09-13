// ============================================================
// THEME EDITOR COMPONENTS — Onglet Composants (avec select)
// Source: COMPONENT_REGISTRY
// Version V3 — Compatible React 16.14
// ============================================================

import React, { useState } from 'react';
import { MotionBox } from '../../../components/ui/MotionBox';
import { COMPONENT_REGISTRY } from '../../../registres/componentRegistry';
import { Save, Search, Grid, LayoutGrid, List, ChevronDown } from 'lucide-react';

interface ThemeEditorComponentsProps {
  selectedComponent: string;
  componentStyles: Record<string, any>;
  styleProps: Record<string, string | number>;
  onComponentSelect: (component: string) => void;
  onStyleChange: (key: string, value: string | number) => void;
  onSave: () => void;
  saving: boolean;
}

export const ThemeEditorComponents: React.FC<ThemeEditorComponentsProps> = ({
  selectedComponent,
  componentStyles,
  styleProps,
  onComponentSelect,
  onStyleChange,
  onSave,
  saving,
}) => {
  const allComponents = COMPONENT_REGISTRY;
  const [searchTerm, setSearchTerm] = useState('');
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);

  // Filtrer les composants
  const filteredComponents = allComponents.filter((comp) =>
    comp.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Grouper les composants par type
  const groupedComponents = filteredComponents.reduce((acc, comp) => {
    const type = comp.split(':')[0] || 'autre';
    if (!acc[type]) acc[type] = [];
    acc[type].push(comp);
    return acc;
  }, {} as Record<string, string[]>);

  // Obtenir l'icône ou le style d'aperçu pour un composant
  const getComponentPreview = (compKey: string) => {
    const type = compKey.split(':')[0] || 'box';
    const variant = compKey.split(':')[1] || 'default';
    const style = componentStyles[compKey]?.style || {};

    const previewStyles = {
      backgroundColor: style.backgroundColor || '#FFFFFF',
      color: style.color || '#1E3A5F',
      borderRadius: style.borderRadius || 8,
      padding: style.padding || '12px 16px',
      border: style.border || '1px solid #E2E6EA',
      boxShadow: style.boxShadow || '0 2px 8px rgba(0,0,0,0.06)',
    };

    // Icônes par type
    const icons: Record<string, string> = {
      button: '🔘',
      card: '📇',
      text: '📝',
      input: '📥',
      select: '📋',
      badge: '🏷️',
      box: '📦',
      layout: '📐',
      nav: '🧭',
      modal: '🪟',
      list: '📃',
      form: '📄',
      stat: '📊',
      loading: '⏳',
      image: '🖼️',
      media: '🎬',
      upload: '📤',
      settings: '⚙️',
      notification: '🔔',
      client: '👤',
      commande: '📦',
      chip: '🔲',
      tooltip: '💬',
      popover: '🗨️',
      dropdown: '📌',
      tab: '📑',
      accordion: '📖',
      stepper: '🔢',
      pagination: '📃',
      tag: '🏷️',
      divider: '➖',
    };

    return {
      icon: icons[type] || '📌',
      styles: previewStyles,
      type: type,
      variant: variant,
    };
  };

  // Obtenir le preview du composant sélectionné
  const selectedPreview = selectedComponent ? getComponentPreview(selectedComponent) : null;

  // Obtenir le nom affiché dans le select
  const getDisplayName = (compKey: string) => {
    const parts = compKey.split(':');
    const type = parts[0] || 'box';
    const variant = parts[1] || 'default';
    return `${type} : ${variant}`;
  };

  return (
    <MotionBox as="div" type="card" variant="large" className="p-4 sm:p-6">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-4 flex-wrap gap-2">
        <div>
          <h3 className="font-semibold text-[var(--color-textPrimary)]">Éditeur de composants</h3>
          <p className="text-sm text-[var(--color-textSecondary)]">
            {filteredComponents.length} composants disponibles
          </p>
        </div>
        <button
          onClick={() => {
            onStyleChange('backgroundColor', '#FFFFFF');
            onStyleChange('color', '#1E3A5F');
            onStyleChange('borderRadius', 12);
            onStyleChange('padding', '16px 20px');
            onStyleChange('border', '1px solid #E2E6EA');
            onStyleChange('boxShadow', '0 2px 8px rgba(0,0,0,0.06)');
          }}
          className="px-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] text-sm hover:bg-[var(--color-secondary)] transition"
        >
          Réinitialiser
        </button>
      </div>

      {/* Selecteur de composant avec recherche */}
      <div className="mb-4">
        <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">
          Sélectionner un composant
        </label>
        <div className="relative">
          {/* Bouton du select */}
          <button
            onClick={() => setIsDropdownOpen(!isDropdownOpen)}
            className="w-full px-4 py-2.5 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] flex items-center justify-between hover:border-[var(--color-primary)] transition"
          >
            <span className="flex items-center gap-2">
              {selectedPreview && (
                <span className="text-lg">{selectedPreview.icon}</span>
              )}
              <span>{selectedComponent ? getDisplayName(selectedComponent) : 'Choisir un composant'}</span>
            </span>
            <ChevronDown size={18} className={`text-[var(--color-textSecondary)] transition-transform ${isDropdownOpen ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown */}
          {isDropdownOpen && (
            <div className="absolute top-full left-0 right-0 mt-1 z-50 max-h-80 overflow-hidden rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-lg">
              {/* Recherche dans le dropdown */}
              <div className="p-2 border-b border-[var(--color-borderColor)]">
                <div className="relative">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                  <input
                    type="text"
                    placeholder="Rechercher un composant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm placeholder:text-[var(--color-textSecondary)] focus:ring-2 focus:ring-[var(--color-primary)] outline-none transition"
                    autoFocus
                  />
                </div>
              </div>

              {/* Liste des composants */}
              <div className="overflow-y-auto max-h-60 p-1">
                {Object.entries(groupedComponents).map(([type, comps]) => (
                  <div key={type}>
                    <div className="px-2 py-1 text-xs font-medium text-[var(--color-textSecondary)] uppercase tracking-wider">
                      {type}
                    </div>
                    {comps.map((compKey) => {
                      const preview = getComponentPreview(compKey);
                      const isSelected = selectedComponent === compKey;
                      return (
                        <div
                          key={compKey}
                          className={`flex items-center gap-3 px-3 py-2 rounded-lg cursor-pointer transition ${
                            isSelected
                              ? 'bg-[var(--color-primary-light)] border border-[var(--color-primary)]'
                              : 'hover:bg-[var(--color-secondary)]'
                          }`}
                          onClick={() => {
                            onComponentSelect(compKey);
                            const existingStyle = componentStyles[compKey]?.style;
                            if (existingStyle) {
                              Object.entries(existingStyle).forEach(([key, value]) => {
                                onStyleChange(key, value as string | number);
                              });
                            } else {
                              onStyleChange('backgroundColor', '#FFFFFF');
                              onStyleChange('color', '#1E3A5F');
                              onStyleChange('borderRadius', 12);
                              onStyleChange('padding', '16px 20px');
                              onStyleChange('border', '1px solid #E2E6EA');
                              onStyleChange('boxShadow', '0 2px 8px rgba(0,0,0,0.06)');
                            }
                            setIsDropdownOpen(false);
                            setSearchTerm('');
                          }}
                        >
                          <div
                            className="w-8 h-8 rounded flex items-center justify-center text-sm flex-shrink-0"
                            style={{
                              backgroundColor: preview.styles.backgroundColor,
                              color: preview.styles.color,
                              borderRadius: `${Math.min(preview.styles.borderRadius as number || 8, 8)}px`,
                              border: preview.styles.border,
                            }}
                          >
                            {preview.icon}
                          </div>
                          <div className="flex-1 min-w-0">
                            <p className="text-sm font-medium text-[var(--color-textPrimary)] truncate">
                              {compKey}
                            </p>
                            <p className="text-xs text-[var(--color-textSecondary)]">
                              {preview.type}:{preview.variant}
                            </p>
                          </div>
                          {isSelected && (
                            <span className="text-xs text-[var(--color-primary)]">✓</span>
                          )}
                        </div>
                      );
                    })}
                  </div>
                ))}
                {filteredComponents.length === 0 && (
                  <div className="text-center py-4 text-[var(--color-textSecondary)]">
                    Aucun composant trouvé
                  </div>
                )}
              </div>
            </div>
          )}
        </div>

        {/* Aperçu du composant sélectionné en tuile */}
        {selectedComponent && selectedPreview && (
          <div className="mt-3 p-3 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
            <div className="flex items-center gap-4">
              <div
                className="w-16 h-16 rounded-lg flex items-center justify-center text-2xl flex-shrink-0"
                style={{
                  backgroundColor: selectedPreview.styles.backgroundColor,
                  color: selectedPreview.styles.color,
                  borderRadius: `${selectedPreview.styles.borderRadius}px`,
                  border: selectedPreview.styles.border,
                  boxShadow: selectedPreview.styles.boxShadow,
                }}
              >
                {selectedPreview.icon}
              </div>
              <div>
                <p className="font-medium text-[var(--color-textPrimary)]">{selectedComponent}</p>
                <p className="text-sm text-[var(--color-textSecondary)]">
                  {selectedPreview.type}:{selectedPreview.variant}
                </p>
                <p className="text-xs text-[var(--color-textSecondary)]">
                  {Object.keys(styleProps).filter(k => styleProps[k]).length} propriétés définies
                </p>
              </div>
            </div>
          </div>
        )}
      </div>

      {/* Éditeur de style */}
      {selectedComponent && (
        <div className="p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]">
          <div className="flex items-center justify-between mb-3">
            <h4 className="font-medium text-[var(--color-textPrimary)]">
              Style : <span className="text-[var(--color-primary)]">{selectedComponent}</span>
            </h4>
            <button
              onClick={onSave}
              disabled={saving}
              className="px-3 py-1.5 rounded bg-[var(--color-primary)] text-white text-sm flex items-center gap-1 hover:bg-[var(--color-primary-dark)] transition disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {saving ? 'En cours...' : <><Save size={14} /> Appliquer</>}
            </button>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <div>
              <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Couleur de fond</label>
              <input
                type="color"
                value={styleProps.backgroundColor as string || '#FFFFFF'}
                onChange={(e) => onStyleChange('backgroundColor', e.target.value)}
                className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Couleur du texte</label>
              <input
                type="color"
                value={styleProps.color as string || '#1E3A5F'}
                onChange={(e) => onStyleChange('color', e.target.value)}
                className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Arrondi (px)</label>
              <input
                type="number"
                value={styleProps.borderRadius as number || 12}
                onChange={(e) => onStyleChange('borderRadius', parseInt(e.target.value) || 0)}
                className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                min={0} max={50}
              />
            </div>
            <div>
              <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Padding</label>
              <input
                type="text"
                value={styleProps.padding as string || '16px 20px'}
                onChange={(e) => onStyleChange('padding', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                placeholder="16px 20px"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Bordure</label>
              <input
                type="text"
                value={styleProps.border as string || '1px solid #E2E6EA'}
                onChange={(e) => onStyleChange('border', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                placeholder="1px solid #E2E6EA"
              />
            </div>
            <div className="sm:col-span-2">
              <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Ombre</label>
              <input
                type="text"
                value={styleProps.boxShadow as string || '0 2px 8px rgba(0,0,0,0.06)'}
                onChange={(e) => onStyleChange('boxShadow', e.target.value)}
                className="w-full px-3 py-1.5 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                placeholder="0 2px 8px rgba(0,0,0,0.06)"
              />
            </div>
          </div>

          {/* Aperçu en direct */}
          <div className="mt-3 p-3 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-secondary)]">
            <p className="text-xs text-[var(--color-textSecondary)] mb-1">Aperçu en direct</p>
            <MotionBox
              as="div"
              type={selectedComponent.split(':')[0] || 'box'}
              variant={selectedComponent.split(':')[1] || 'default'}
              className="p-4 rounded-lg"
              style={{ proprietes: styleProps }}
            >
              <p className="text-sm font-medium text-[var(--color-textPrimary)]">Aperçu du composant</p>
              <p className="text-xs text-[var(--color-textSecondary)]">{selectedComponent}</p>
            </MotionBox>
          </div>
        </div>
      )}
    </MotionBox>
  );
};

export default ThemeEditorComponents;
