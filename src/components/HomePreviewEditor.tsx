// ============================================================
// HOME PREVIEW EDITOR — Aperçu drag & drop des blocs de la home
// Version V3 — Compatible React 16
// ============================================================

import React, { useState, useRef } from 'react';
import { DraggableWidgetPreview } from './DraggableWidgetPreview';
import { HomeBlock } from '../types/homeConfig';
import { LayoutGrid, Info } from 'lucide-react';

interface HomePreviewEditorProps {
  blocks: HomeBlock[];
  onReorder: (newOrderIds: string[]) => Promise<void> | void;
  onEdit: (blockId: string) => void;
  onDelete: (blockId: string) => void;
  onToggle: (blockId: string) => void;
}

export const HomePreviewEditor: React.FC<HomePreviewEditorProps> = ({
  blocks,
  onReorder,
  onEdit,
  onDelete,
  onToggle,
}) => {
  const [draggedId, setDraggedId] = useState<string | null>(null);
  const [dragOverId, setDragOverId] = useState<string | null>(null);
  const dragCounter = useRef(0);

  const sortedBlocks = [...blocks].sort((a, b) => (a.order ?? 0) - (b.order ?? 0));

  const handleDragStart = (id: string) => (e: React.DragEvent) => {
    setDraggedId(id);
    e.dataTransfer.effectAllowed = 'move';
    e.dataTransfer.setData('text/plain', id);
    dragCounter.current = 0;
  };

  const handleDragOver = (id: string) => (e: React.DragEvent) => {
    e.preventDefault();
    e.dataTransfer.dropEffect = 'move';
    if (id !== dragOverId && id !== draggedId) {
      setDragOverId(id);
    }
  };

  const handleDragLeave = (id: string) => (e: React.DragEvent) => {
    dragCounter.current -= 1;
    if (dragOverId === id && dragCounter.current <= 0) {
      setDragOverId(null);
      dragCounter.current = 0;
    }
  };

  const handleDrop = (targetId: string) => async (e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();

    const sourceId = draggedId;
    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;

    if (!sourceId || sourceId === targetId) return;

    const currentIds = sortedBlocks.map((b) => b.id);
    const sourceIndex = currentIds.indexOf(sourceId);
    const targetIndex = currentIds.indexOf(targetId);
    if (sourceIndex === -1 || targetIndex === -1) return;

    const newIds = [...currentIds];
    newIds.splice(sourceIndex, 1);
    newIds.splice(targetIndex, 0, sourceId);

    await onReorder(newIds);
  };

  const handleDragEnd = () => {
    setDraggedId(null);
    setDragOverId(null);
    dragCounter.current = 0;
  };

  const moveUp = (id: string) => {
    const currentIds = sortedBlocks.map((b) => b.id);
    const index = currentIds.indexOf(id);
    if (index <= 0) return;
    const newIds = [...currentIds];
    [newIds[index - 1], newIds[index]] = [newIds[index], newIds[index - 1]];
    onReorder(newIds);
  };

  const moveDown = (id: string) => {
    const currentIds = sortedBlocks.map((b) => b.id);
    const index = currentIds.indexOf(id);
    if (index === -1 || index >= currentIds.length - 1) return;
    const newIds = [...currentIds];
    [newIds[index], newIds[index + 1]] = [newIds[index + 1], newIds[index]];
    onReorder(newIds);
  };

  if (sortedBlocks.length === 0) {
    return (
      <div className="text-center py-16 text-[var(--color-textSecondary)]">
        <LayoutGrid size={48} className="mx-auto opacity-20 mb-4" />
        <p className="text-sm">Aucun bloc à afficher</p>
        <p className="text-xs mt-2 opacity-70">
          Ajoutez un bloc depuis la liste de gauche pour voir l'aperçu.
        </p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      {/* Bandeau d'aide */}
      <div className="p-3 rounded-xl bg-[var(--color-primary-light)]/30 border border-[var(--color-primary)]/20 flex gap-2">
        <Info size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
        <p className="text-xs text-[var(--color-textPrimary)]">
          <b>Glissez-déposez</b> les blocs pour changer leur ordre. Survolez un bloc pour voir ses actions (monter, descendre, activer, modifier, supprimer). Les modifications sont enregistrées automatiquement.
        </p>
      </div>

      {/* Liste des blocs avec aperçu réel */}
      <div className="space-y-3">
        {sortedBlocks.map((block, index) => (
          <DraggableWidgetPreview
            key={block.id}
            block={block}
            index={index}
            total={sortedBlocks.length}
            isDragging={draggedId === block.id}
            isDragOver={dragOverId === block.id}
            onDragStart={handleDragStart(block.id)}
            onDragOver={handleDragOver(block.id)}
            onDragLeave={handleDragLeave(block.id)}
            onDrop={handleDrop(block.id)}
            onDragEnd={handleDragEnd}
            onEdit={() => onEdit(block.id)}
            onDelete={() => onDelete(block.id)}
            onToggle={() => onToggle(block.id)}
            onMoveUp={() => moveUp(block.id)}
            onMoveDown={() => moveDown(block.id)}
          />
        ))}
      </div>
    </div>
  );
};

export default HomePreviewEditor;
