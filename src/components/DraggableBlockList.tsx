// ============================================================
// DRAGGABLE BLOCK LIST — Liste réordonnable par drag & drop
// Version V3 — Compatible React 16
// ============================================================

import React, { useState } from 'react';
import { GripVertical, Edit, Trash2, Eye, EyeOff, ChevronUp, ChevronDown } from 'lucide-react';

export interface DraggableBlock {
  id: string;
  label: string;
  type: string;
  enabled: boolean;
}

interface DraggableBlockListProps {
  blocks: DraggableBlock[];
  onReorder: (newOrder: string[]) => void;
  onEdit: (id: string) => void;
  onDelete: (id: string) => void;
  onToggle: (id: string) => void;
}

export const DraggableBlockList: React.FC<DraggableBlockListProps> = ({
  blocks,
  onReorder,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverId) setDragOverId(id);
  };

  const handleDragLeave = () => {
    setDragOverId(null);
  };

  const handleDrop = (targetId: string) => (e: React.DragEvent) => {
    e.preventDefault();
    if (!draggedId || draggedId === targetId) {
      setDraggedId(null);
      setDragOverId(null);
      return;
    }

    const currentIds = blocks.map((b) => b.id);
    const draggedIndex = currentIds.indexOf(draggedId);
    const targetIndex = currentIds.indexOf(targetId);
    if (draggedIndex === -1 || targetIndex === -1) return;

    const newIds = [...currentIds];
    newIds.splice(draggedIndex, 1);
    newIds.splice(targetIndex, 0, draggedId);

    onReorder(newIds);
    setDraggedId(null);
    setDragOverId(null);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
  };

  // Boutons de déplacement (fallback mobile)
  const moveUp = (id: string) => {
    const currentIds = blocks.map((b) => b.id);
    const index = currentIds.indexOf(id);
    if (index <= 0) return;
    const newIds = [...currentIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    onReorder(newIds);
  };

  const moveDown = (id: string) => {
    const currentIds = blocks.map((b) => b.id);
    const index = currentIds.indexOf(id);
    if (index === -1 || index >= currentIds.length - 1) return;
    const newIds = [...currentIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    onReorder(newIds);
  };

  return (
    <div className="space-y-2">
      {blocks.map((block, index) => {
        const isDragging = draggedId === block.id;
        const isDragOver = dragOverId === block.id && draggedId !== block.id;

        return (
          <div
            key={block.id}
            draggable
            onDragStart={handleDragStart(block.id)}
            onDragOver={handleDragOver(block.id)}
            onDragLeave={handleDragLeave}
            onDrop={handleDrop(block.id)}
            onDragEnd={handleDragEnd}
            className={`
              flex items-center gap-2 p-2 rounded-lg border transition-all cursor-move
              ${isDragging ? 'opacity-40 border-dashed border-[var(--color-primary)]' : ''}
              ${isDragOver ? 'border-[var(--color-primary)] border-2 bg-[var(--color-primary-light)]' : ''}
              ${!isDragging && !isDragOver ? 'border-[var(--color-borderColor)] bg-[var(--color-cardBg)] hover:border-[var(--color-primary)]' : ''}
            `}
          >
            {/* Poignée de drag */}
            <div className="flex-shrink-0 text-[var(--color-textSecondary)] hover:text-[var(--color-primary)]">
              <GripVertical size={16} />
            </div>

            {/* Numéro + Label */}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <span className="text-xs font-mono text-[var(--color-textSecondary)] w-5">
                  #{index + 1}
                </span>
                <span className="text-sm font-medium text-[var(--color-textPrimary)] truncate">
                  {block.label}
                </span>
                <span className="text-xs px-1.5 py-0.5 rounded bg-[var(--color-secondary)] text-[var(--color-textSecondary)] flex-shrink-0">
                  {block.type}
                </span>
              </div>
            </div>

            {/* Boutons mobile */}
            <div className="flex flex-col gap-0.5 md:hidden">
              <button
                type="button"
                onClick={() => moveUp(block.id)}
                disabled={index === 0}
                className="p-0.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)] disabled:opacity-30"
              >
                <ChevronUp size={12} />
              </button>
              <button
                type="button"
                onClick={() => moveDown(block.id)}
                disabled={index === blocks.length - 1}
                className="p-0.5 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)] disabled:opacity-30"
              >
                <ChevronDown size={12} />
              </button>
            </div>

            {/* Actions */}
            <div className="flex gap-0.5 flex-shrink-0">
              <button
                type="button"
                onClick={() => onToggle(block.id)}
                className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                title={block.enabled ? 'Désactiver' : 'Activer'}
              >
                {block.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
              </button>
              <button
                type="button"
                onClick={() => onEdit(block.id)}
                className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"
                title="Modifier"
              >
                <Edit size={14} />
              </button>
              <button
                type="button"
                onClick={() => onDelete(block.id)}
                className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)]"
                title="Supprimer"
              >
                <Trash2 size={14} />
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

export default DraggableBlockList;
