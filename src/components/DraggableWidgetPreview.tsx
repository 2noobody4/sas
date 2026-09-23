// ============================================================
// DRAGGABLE WIDGET PREVIEW — Bloc aperçu draggable
// Version V3 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { GripVertical, Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';
import { HomeBlock } from '../types/homeConfig';
import {
  WidgetHero,
  WidgetBanner,
  WidgetProducts,
  WidgetFeaturedProducts,
  WidgetFeatures,
  WidgetTestimonials,
  WidgetCta,
} from './homeWidgets';

const WIDGET_MAP: Record<string, React.FC<{ block: HomeBlock }>> = {
  hero: WidgetHero,
  banner: WidgetBanner,
  products: WidgetProducts,
  featured: WidgetFeaturedProducts,
  features: WidgetFeatures,
  testimonials: WidgetTestimonials,
  cta: WidgetCta,
};

interface DraggableWidgetPreviewProps {
  block: HomeBlock;
  index: number;
  total: number;
  isDragging: boolean;
  isDragOver: boolean;
  onDragStart: (e: React.DragEvent) => void;
  onDragOver: (e: React.DragEvent) => void;
  onDragLeave: (e: React.DragEvent) => void;
  onDrop: (e: React.DragEvent) => void;
  onDragEnd: (e: React.DragEvent) => void;
  onEdit: () => void;
  onDelete: () => void;
  onToggle: () => void;
  onMoveUp: () => void;
  onMoveDown: () => void;
}

export const DraggableWidgetPreview: React.FC<DraggableWidgetPreviewProps> = ({
  block,
  index,
  total,
  isDragging,
  isDragOver,
  onDragStart,
  onDragOver,
  onDragLeave,
  onDrop,
  onDragEnd,
  onEdit,
  onDelete,
  onToggle,
  onMoveUp,
  onMoveDown,
}) => {
  const [hovered, setHovered] = useState(false);
  const Widget = WIDGET_MAP[block.type];

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDragLeave={onDragLeave}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      onMouseEnter={() => setHovered(true)}
      onMouseLeave={() => setHovered(false)}
      className={`
        relative group transition-all duration-200 rounded-xl
        ${isDragging ? 'opacity-30 scale-95' : ''}
        ${isDragOver ? 'ring-4 ring-[var(--color-primary)] ring-offset-2' : ''}
        ${!block.enabled ? 'opacity-50' : ''}
      `}
    >
      {/* Barre d'outils (visible au hover ou pendant drag) */}
      <div
        className={`
          absolute top-0 left-0 right-0 z-20 flex items-center justify-between
          px-3 py-1.5 rounded-t-xl
          bg-[var(--color-primary)] text-white
          transition-opacity duration-200
          ${hovered || isDragging || isDragOver ? 'opacity-100' : 'opacity-0 pointer-events-none'}
        `}
      >
        <div className="flex items-center gap-2 min-w-0">
          <div className="cursor-move flex items-center gap-1 flex-shrink-0">
            <GripVertical size={16} />
            <span className="text-xs font-mono">#{index + 1}</span>
          </div>
          <span className="text-xs font-medium truncate">
            {block.title || 'Sans titre'}
          </span>
          <span className="text-[10px] px-1.5 py-0.5 rounded bg-white/20 flex-shrink-0">
            {block.type}
          </span>
          {!block.enabled && (
            <span className="text-[10px] px-1.5 py-0.5 rounded bg-red-500 flex-shrink-0">
              Désactivé
            </span>
          )}
        </div>

        <div className="flex gap-0.5 flex-shrink-0">
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveUp(); }}
            disabled={index === 0}
            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Monter"
          >
            <ChevronUp size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onMoveDown(); }}
            disabled={index === total - 1}
            className="p-1 rounded hover:bg-white/20 disabled:opacity-30 disabled:cursor-not-allowed"
            title="Descendre"
          >
            <ChevronDown size={14} />
          </button>
          <div className="w-px bg-white/30 mx-0.5" />
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onToggle(); }}
            className="p-1 rounded hover:bg-white/20"
            title={block.enabled ? 'Désactiver' : 'Activer'}
          >
            {block.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onEdit(); }}
            className="p-1 rounded hover:bg-white/20"
            title="Modifier"
          >
            <Edit size={14} />
          </button>
          <button
            type="button"
            onClick={(e) => { e.stopPropagation(); onDelete(); }}
            className="p-1 rounded hover:bg-red-500"
            title="Supprimer"
          >
            <Trash2 size={14} />
          </button>
        </div>
      </div>

      {/* Indicateur de drop */}
      {isDragOver && (
        <div className="absolute -top-1 left-4 right-4 h-1 bg-[var(--color-primary)] rounded-full z-30" />
      )}

      {/* Rendu du widget */}
      <div className={`pt-8 ${!block.enabled ? 'grayscale' : ''}`}>
        {Widget ? (
          <Widget block={block} />
        ) : (
          <div className="p-4 text-center text-[var(--color-textSecondary)] border-2 border-dashed border-[var(--color-borderColor)] rounded-xl">
            Type de bloc non reconnu : <b>{block.type}</b>
          </div>
        )}
      </div>

      {/* Overlay quand désactivé */}
      {!block.enabled && (
        <div className="absolute inset-0 rounded-xl pointer-events-none flex items-center justify-center bg-black/5">
          <span className="px-3 py-1 rounded-full bg-black/60 text-white text-xs font-medium">
            Bloc désactivé
          </span>
        </div>
      )}
    </div>
  );
};

export default DraggableWidgetPreview;
