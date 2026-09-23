// ============================================================
// COMPONENT TILE LIST — Tuiles avec preview des composants
// Version V3 — Compatible React 16
// ============================================================

import React from 'react';
import { useTheme } from '../contexts/ThemeContext';
import { getComponentLabel } from '../utils/displayLabels';

interface ComponentTileListProps {
  components: string[];
  selected: string;
  onSelect: (key: string) => void;
  maxHeight?: string;
}

export const ComponentTileList: React.FC<ComponentTileListProps> = ({
  components,
  selected,
  onSelect,
  maxHeight = '400px',
}) => {
  const { theme } = useTheme();

  // Map des styles personnalisés par composant
  const styleMap = React.useMemo(() => {
    const map: Record<string, Record<string, any>> = {};
    (theme.composants || []).forEach((c) => {
      if (c.typeComponent) {
        map[c.typeComponent] = c.style?.proprietes || {};
      }
    });
    return map;
  }, [theme.composants]);

  return (
    <div
      className="grid grid-cols-2 gap-2 overflow-y-auto pr-1"
      style={{ maxHeight }}
    >
      {components.map((key) => {
        const isSelected = selected === key;
        const styleProps = styleMap[key] || {};

        return (
          <button
            key={key}
            onClick={() => onSelect(key)}
            className={`p-2 rounded-xl border-2 transition text-left flex flex-col gap-1 ${
              isSelected
                ? 'border-[var(--color-primary)] bg-[var(--color-primary-light)]'
                : 'border-[var(--color-borderColor)] hover:border-[var(--color-primary)] hover:bg-[var(--color-secondary)]'
            }`}
            title={key}
          >
            {/* Preview */}
            <div className="h-12 rounded-lg bg-[var(--color-background)] flex items-center justify-center overflow-hidden">
              <div
                style={{
                  backgroundColor: styleProps.backgroundColor || 'var(--color-cardBg)',
                  color: styleProps.color || 'var(--color-textPrimary)',
                  borderRadius: Math.min(
                    typeof styleProps.borderRadius === 'number' ? styleProps.borderRadius : 6,
                    8
                  ),
                  padding: '4px 8px',
                  fontSize: 10,
                  border: styleProps.border || '1px solid var(--color-borderColor)',
                  maxWidth: '100%',
                  textOverflow: 'ellipsis',
                  overflow: 'hidden',
                  whiteSpace: 'nowrap',
                }}
              >
                {key.split(':')[1] || 'default'}
              </div>
            </div>

            {/* Label */}
            <div className="min-w-0">
              <p className="text-[10px] font-medium text-[var(--color-textPrimary)] truncate">
                {getComponentLabel(key)}
              </p>
              <p className="text-[9px] text-[var(--color-textSecondary)] font-mono truncate">
                {key}
              </p>
            </div>
          </button>
        );
      })}
    </div>
  );
};

export default ComponentTileList;
