// ============================================================
// PREVIEW MODAL — Popup pour prévisualiser un fichier
// Utilise le composant Modal réutilisable
// ============================================================

import React from 'react';
import { Modal } from './Modal';
import { Eye, FileText, Image, Video, Music } from 'lucide-react';

interface PreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  url: string;
  type: 'image' | 'video' | 'audio' | 'document';
  fileName?: string;
}

export const PreviewModal: React.FC<PreviewModalProps> = ({
  isOpen,
  onClose,
  url,
  type,
  fileName = '',
}) => {
  if (!isOpen) return null;

  const getIcon = () => {
    switch (type) {
      case 'image': return <Image size={24} />;
      case 'video': return <Video size={24} />;
      case 'audio': return <Music size={24} />;
      default: return <FileText size={24} />;
    }
  };

  const getTitle = () => {
    switch (type) {
      case 'image': return 'Aperçu de l\'image';
      case 'video': return 'Aperçu de la vidéo';
      case 'audio': return 'Aperçu de l\'audio';
      default: return 'Aperçu du document';
    }
  };

  const renderContent = () => {
    switch (type) {
      case 'image':
        return (
          <img
            src={url}
            alt={fileName || 'Image'}
            className="max-w-full max-h-[70vh] object-contain rounded-lg mx-auto"
          />
        );
      case 'video':
        return (
          <video
            controls
            className="max-w-full max-h-[70vh] rounded-lg mx-auto"
            src={url}
          />
        );
      case 'audio':
        return (
          <div className="flex flex-col items-center gap-4 p-8">
            <audio controls className="w-full max-w-md" src={url} />
            <p className="text-sm text-gray-500">{fileName || 'Fichier audio'}</p>
          </div>
        );
      case 'document':
        return (
          <div className="flex flex-col items-center gap-4 p-4">
            <iframe
              src={url}
              className="w-full max-w-4xl h-[70vh] rounded-lg border border-gray-200"
              title={fileName || 'Document'}
            />
            <a
              href={url}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--color-primary)] hover:underline text-sm"
            >
              Ouvrir dans un nouvel onglet
            </a>
          </div>
        );
      default:
        return <p className="text-gray-500">Aperçu non disponible</p>;
    }
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title={getTitle()}
      subtitle={fileName || 'Fichier'}
      icon={getIcon()}
      maxWidth="5xl"
      maxHeight="85vh"
      showHeader={true}
      showFooter={false}
    >
      <div className="flex items-center justify-center w-full min-h-[200px]">
        {renderContent()}
      </div>
    </Modal>
  );
};

export default PreviewModal;
