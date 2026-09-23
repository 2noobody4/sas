// ============================================================
// COLOR PICKER — Sélecteur de couleurs avec grille (66 couleurs)
// Version V3 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { MotionBox } from './MotionBox';
import { Check } from 'lucide-react';

// 66 couleurs (neutres, primaires, secondaires, pastel, vives)
const COLORS = [
  // Neutres
  '#FFFFFF', '#F8F9FA', '#F1F3F5', '#E9ECEF', '#DEE2E6', '#CED4DA', '#ADB5BD', '#868E96', '#6C757D', '#495057', '#343A40', '#212529',
  // Rouges
  '#FFF5F5', '#FFE3E3', '#FFC9C9', '#FFA8A8', '#FF8787', '#FF6B6B', '#FA5252', '#F03E3E', '#E03131', '#C92A2A',
  // Roses
  '#FFF0F6', '#FFDEEB', '#FCC2D7', '#FAA2C1', '#F783AC', '#F06595', '#E64980', '#D6336C', '#C2255C',
  // Oranges
  '#FFF4E6', '#FFE8CC', '#FFD8A8', '#FFC078', '#FFA94D', '#FF922B', '#FD7E14', '#F76707', '#E8590C',
  // Jaunes
  '#FFF9DB', '#FFF3BF', '#FFEC99', '#FFE066', '#FCC419', '#FAB005', '#F59F00', '#F08C00', '#E67700',
  // Verts
  '#EBFBEE', '#D3F9D8', '#B2F2BB', '#8CE99A', '#69DB7C', '#51CF66', '#40C057', '#37B24D', '#2B8A3E', '#1C7E2C',
  // Teal / Cyan
  '#E6FCF5', '#C3FAE8', '#96F2D7', '#63E6BE', '#38D9A9', '#20C997', '#12B886', '#0CA678', '#087F5B',
  // Bleus
  '#E7F5FF', '#D0EBFF', '#A5D8FF', '#74C0FC', '#4DABF7', '#339AF0', '#228BE6', '#1C7ED6', '#1971C2', '#1864AB',
  // Violets
  '#F3F0FF', '#E5DBFF', '#D0BFFF', '#B197FC', '#9775FA', '#845EF7', '#7950F2', '#6741D9', '#5F3DC4',
  // Couleurs supplémentaires (pastel, saumon, lavande, etc.)
  '#FDE2E2', '#FCCCD9', '#FFE5D9', '#FFF3BF', '#E6F2D9', '#D9F2E6', '#D9E6F2', '#E6D9F2', '#F2D9E6',
];

interface ColorPickerProps {
  value: string;
  onChange: (color: string) => void;
  className?: string;
}

export const ColorPicker: React.FC<ColorPickerProps> = ({
  value,
  onChange,
  className = '',
}) => {
  const [isOpen, setIsOpen] = useState(false);

  const isLightColor = (hex: string) => {
    const c = hex.replace('#', '');
    const r = parseInt(c.substring(0, 2), 16);
    const g = parseInt(c.substring(2, 4), 16);
    const b = parseInt(c.substring(4, 6), 16);
    const luminance = (0.299 * r + 0.587 * g + 0.114 * b) / 255;
    return luminance > 0.7;
  };

  return (
    <div className={`relative ${className}`}>
      {/* Aperçu + bouton d'ouverture */}
      <div
        className="flex items-center gap-3 p-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer hover:border-[var(--color-primary)] transition"
        onClick={() => setIsOpen(!isOpen)}
      >
        <div
          className="w-8 h-8 rounded-full border border-[var(--color-borderColor)] flex-shrink-0"
          style={{ backgroundColor: value || '#1E3A5F' }}
        />
        <span className="text-sm text-[var(--color-textPrimary)]">
          {value || 'Choisir une couleur'}
        </span>
      </div>

      {/* Grille déroulante */}
      {isOpen && (
        <MotionBox
          as="div"
          className="absolute top-full left-0 mt-2 p-3 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] shadow-lg z-50 w-72 max-h-80 overflow-y-auto"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          <div className="grid grid-cols-6 gap-2">
            {COLORS.map((color) => {
              const isSelected = value === color;
              return (
                <button
                  key={color}
                  className="relative w-8 h-8 rounded-full border border-[var(--color-borderColor)] hover:scale-110 transition-transform focus:outline-none focus:ring-2 focus:ring-[var(--color-primary)]"
                  style={{ backgroundColor: color }}
                  onClick={() => {
                    onChange(color);
                    setIsOpen(false);
                  }}
                >
                  {isSelected && (
                    <Check
                      size={14}
                      className="absolute inset-0 m-auto drop-shadow-sm"
                      style={{
                        color: isLightColor(color)
                          ? 'var(--color-textPrimary)'
                          : '#FFFFFF',
                      }}
                    />
                  )}
                </button>
              );
            })}
          </div>
        </MotionBox>
      )}
    </div>
  );
};

export default ColorPicker;
