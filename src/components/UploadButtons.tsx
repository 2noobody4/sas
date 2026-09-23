// ============================================================
// UPLOAD BUTTONS — Boutons d'upload personnalisables
// ============================================================
// Ces boutons sont utilisés comme déclencheurs pour les inputs file.
// Chaque bouton a son propre type/variant pour être personnalisé
// dans l'éditeur de thème.
// ============================================================

import React, { forwardRef } from 'react';
import { MotionBox } from './MotionBox';
import { Upload, Image, Video, Music, FileText } from 'lucide-react';

interface UploadButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children?: React.ReactNode;
  className?: string;
}

// ============================================================
// UploadButtonGeneral
// ============================================================
export const UploadButtonGeneral = forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ children, className, style, ...props }, ref) => (
    <MotionBox
      as="button"
      type="upload"
      variant="general"
      className={className}
      ref={ref as any}
      {...(props as any)}
    >
      <Upload size={18} />
      {children || 'Télécharger'}
    </MotionBox>
  )
);
UploadButtonGeneral.displayName = 'UploadButtonGeneral';

// ============================================================
// UploadButtonImage
// ============================================================
export const UploadButtonImage = forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ children, className, style, ...props }, ref) => (
    <MotionBox
      as="button"
      type="upload"
      variant="image"
      className={className}
      ref={ref as any}
      {...(props as any)}
    >
      <Image size={18} />
      {children || 'Ajouter une image'}
    </MotionBox>
  )
);
UploadButtonImage.displayName = 'UploadButtonImage';

// ============================================================
// UploadButtonVideo
// ============================================================
export const UploadButtonVideo = forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ children, className, style, ...props }, ref) => (
    <MotionBox
      as="button"
      type="upload"
      variant="video"
      className={className}
      ref={ref as any}
      {...(props as any)}
    >
      <Video size={18} />
      {children || 'Ajouter une vidéo'}
    </MotionBox>
  )
);
UploadButtonVideo.displayName = 'UploadButtonVideo';

// ============================================================
// UploadButtonAudio
// ============================================================
export const UploadButtonAudio = forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ children, className, style, ...props }, ref) => (
    <MotionBox
      as="button"
      type="upload"
      variant="audio"
      className={className}
      ref={ref as any}
      {...(props as any)}
    >
      <Music size={18} />
      {children || 'Ajouter un audio'}
    </MotionBox>
  )
);
UploadButtonAudio.displayName = 'UploadButtonAudio';

// ============================================================
// UploadButtonDocument
// ============================================================
export const UploadButtonDocument = forwardRef<HTMLButtonElement, UploadButtonProps>(
  ({ children, className, style, ...props }, ref) => (
    <MotionBox
      as="button"
      type="upload"
      variant="document"
      className={className}
      ref={ref as any}
      {...(props as any)}
    >
      <FileText size={18} />
      {children || 'Ajouter un document'}
    </MotionBox>
  )
);
UploadButtonDocument.displayName = 'UploadButtonDocument';

// ============================================================
// Exports groupés
// ============================================================
const UploadButtons = {
  General: UploadButtonGeneral,
  Image: UploadButtonImage,
  Video: UploadButtonVideo,
  Audio: UploadButtonAudio,
  Document: UploadButtonDocument,
};

export default UploadButtons;
