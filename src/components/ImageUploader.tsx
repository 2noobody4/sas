import React, { useState, useRef, useEffect } from 'react';
import { MotionBox } from './MotionBox';
import { Upload, X, Plus, Eye, Cloud, CloudOff, RefreshCw, AlertTriangle } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../hooks/useToast';
import { useOffline } from '../contexts/OfflineContext';
import { storeImageLocally, getStoredImage, uploadImageToSupabase, syncAllImages, deleteStoredImage } from '../lib/imageStorage';
import { PreviewModal } from './PreviewModal';

interface ImageUploaderProps {
  images: string[];
  onChange: (images: string[]) => void;
  max?: number;
  bucket?: string;
  label?: string;
  className?: string;
  onUploadingChange?: (uploading: boolean) => void;
}

export const ImageUploader: React.FC<ImageUploaderProps> = ({
  images = [],
  onChange,
  max = 5,
  bucket = 'logos',
  label = 'Ajouter une image',
  className = '',
  onUploadingChange,
}) => {
  const { success, error: toastError, info } = useToast();
  const { isOnline } = useOffline();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [uploadingIds, setUploadingIds] = useState<Set<string>>(new Set());
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [localImages, setLocalImages] = useState<Map<string, { blob: Blob; url: string }>>(new Map());
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFull = images.length >= max;

  const setUploadingState = (state: boolean) => {
    setUploading(state);
    onUploadingChange?.(state);
  };

  // ⭐ FIX : Recharger les blobs des images encore "local://" au montage
  // (ex: on rouvre le formulaire d'édition alors qu'une image n'a jamais
  // pu être envoyée). Sans ça, l'aperçu affichait une image cassée et on
  // ne pouvait pas relancer l'envoi tant qu'on ne supprimait pas l'image.
  useEffect(() => {
    const loadLocalImages = async () => {
      const localOnes = images.filter((img) => img.startsWith('local://'));
      if (localOnes.length === 0) return;
      const entries = await Promise.all(
        localOnes.map(async (img) => {
          const id = img.replace('local://', '');
          const stored = await getStoredImage(id);
          if (stored?.blob) {
            return [id, { blob: stored.blob, url: URL.createObjectURL(stored.blob) }] as const;
          }
          return null;
        })
      );
      const valid = entries.filter((e): e is [string, { blob: Blob; url: string }] => e !== null);
      if (valid.length > 0) {
        setLocalImages((prev) => {
          const next = new Map(prev);
          valid.forEach(([id, v]) => next.set(id, v));
          return next;
        });
      }
    };
    loadLocalImages();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Images qui n'ont jamais pu être envoyées vers Supabase (upload différé)
  const pendingCount = images.filter((img) => img.startsWith('local://')).length;

  // ⭐ Réessayer l'envoi de toutes les images en attente pour CE champ (ce bucket)
  const retryPendingUploads = async () => {
    if (!isOnline) {
      toastError('Pas de connexion internet pour réessayer l\'envoi');
      return;
    }
    setUploadingState(true);
    try {
      let resolvedCount = 0;
      const resolved = await Promise.all(
        images.map(async (img) => {
          if (!img.startsWith('local://')) return img;
          const id = img.replace('local://', '');
          const stored = await getStoredImage(id);
          if (!stored?.blob) return img;
          try {
            const publicUrl = await uploadImageToSupabase(stored, bucket);
            resolvedCount++;
            return publicUrl;
          } catch {
            return img;
          }
        })
      );
      if (resolvedCount > 0) {
        onChange(resolved);
        success(`${resolvedCount} image(s) envoyée(s) ✅`);
      } else {
        toastError('Aucune image n\'a pu être envoyée, réessayez plus tard');
      }
    } finally {
      setUploadingState(false);
    }
  };

  const uploadFiles = async (files: FileList) => {
    const remaining = max - images.length;
    const filesToUpload = Array.from(files).slice(0, remaining);
    const total = filesToUpload.length;
    let uploaded = 0;
    const newImages: string[] = [];

    setUploadingState(true);
    setTotalFiles(total);
    setUploadedFiles(0);
    setProgress(0);

    try {
      for (const file of filesToUpload) {
        // 1. Stocker localement (toujours) — ⭐ FIX : on mémorise le bucket
        // de destination avec l'image, pour que la resynchro automatique
        // (hors ligne -> en ligne) sache où la renvoyer.
        const stored = await storeImageLocally(file, bucket);
        const localUrl = URL.createObjectURL(file);
        setLocalImages(prev => new Map(prev).set(stored.id, { blob: file, url: localUrl }));

        // 2. Si en ligne, uploader vers Supabase
        let publicUrl = '';
        if (isOnline) {
          try {
            publicUrl = await uploadImageToSupabase(stored, bucket);
          } catch (err) {
            info(`Image "${file.name}" stockée localement (upload différé)`);
          }
        } else {
          info(`Image "${file.name}" stockée localement (hors ligne)`);
        }

        // 3. Ajouter l'URL à la liste (publique si disponible, sinon URL locale temporaire)
        if (publicUrl) {
          newImages.push(publicUrl);
        } else {
          // En mode hors ligne ou échec upload, on garde l'URL locale
          // mais onChange ne doit recevoir que des URLs publiques
          // On va utiliser un ID local et le résoudre plus tard
          // Pour l'instant, on ajoute une URL factice qui sera remplacée après synchro
          newImages.push(`local://${stored.id}`);
        }

        uploaded++;
        setUploadedFiles(uploaded);
        setProgress(Math.round((uploaded / total) * 100));
      }

      if (newImages.length > 0) {
        onChange([...images, ...newImages]);
        success(`${newImages.length} image${newImages.length > 1 ? 's' : ''} uploadée${newImages.length > 1 ? 's' : ''} ✅`);
      }
    } catch (err: any) {
      toastError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploadingState(false);
      setProgress(0);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files.length > 0) {
      uploadFiles(e.target.files);
      e.target.value = '';
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      uploadFiles(e.dataTransfer.files);
    }
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(true);
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setIsDragging(false);
  };

  const removeImage = async (index: number) => {
    const url = images[index];
    // Si c'est une URL locale, supprimer le stockage local
    if (url.startsWith('local://')) {
      const id = url.replace('local://', '');
      await deleteStoredImage(id);
      setLocalImages(prev => {
        const next = new Map(prev);
        next.delete(id);
        return next;
      });
    }
    onChange(images.filter((_, i) => i !== index));
  };

  const openPreview = (url: string, e: React.MouseEvent) => {
    e.stopPropagation();
    // Si c'est une URL locale, on utilise le blob stocké
    if (url.startsWith('local://')) {
      const id = url.replace('local://', '');
      const local = localImages.get(id);
      if (local) {
        setPreviewUrl(local.url);
        return;
      }
    }
    setPreviewUrl(url);
  };

  const renderProgressBar = () => (
    <div className="w-full">
      <div className="flex justify-between text-sm text-[var(--color-textSecondary)] mb-1">
        <span>Upload en cours...</span>
        <span>{uploadedFiles} / {totalFiles}</span>
      </div>
      <div className="w-full h-2 bg-[var(--color-borderColor)] rounded-full overflow-hidden">
        <div className="h-full rounded-full transition-all duration-300" style={{ width: `${progress}%`, backgroundColor: 'var(--color-primary)' }} />
      </div>
      <p className="text-xs text-[var(--color-textSecondary)] mt-1">{progress}%</p>
    </div>
  );

  const renderEmptyState = () => (
    <MotionBox
      as="div"
      className="flex flex-col items-center justify-center p-6 cursor-pointer rounded-xl border-2 border-dashed transition-all hover:border-[var(--color-primary)]"
      style={{
        proprietes: {
          borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-borderColor)',
          backgroundColor: isDragging ? 'var(--color-primary-light)' : 'var(--color-cardBg)',
          minHeight: '120px',
          transition: 'all 0.2s ease',
        } as any,
      }}
      onClick={() => fileInputRef.current?.click()}
      onDrop={handleDrop}
      onDragOver={handleDragOver}
      onDragLeave={handleDragLeave}
      animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
    >
      {uploading ? (
        renderProgressBar()
      ) : (
        <>
          <div className="flex items-center gap-2 mb-2">
            {isOnline ? (
              <Cloud size={20} className="text-[var(--color-success)]" />
            ) : (
              <CloudOff size={20} className="text-[var(--color-warning)]" />
            )}
            <span className="text-xs text-[var(--color-textSecondary)]">
              {isOnline ? 'En ligne' : 'Hors ligne'}
            </span>
          </div>
          <Upload size={32} className="text-[var(--color-textSecondary)]" />
          <p className="mt-2 text-sm font-medium text-[var(--color-textPrimary)]">
            {isDragging ? 'Déposez les fichiers ici' : label}
          </p>
          <p className="text-xs text-[var(--color-textSecondary)]">
            {images.length} / {max} images · Glissez-déposez ou cliquez
          </p>
        </>
      )}
    </MotionBox>
  );

  return (
    <MotionBox
      as="div"
      type="card"
      variant="default"
      className={`overflow-hidden w-full ${className}`}
      style={{ proprietes: { boxSizing: 'border-box' } as any }}
    >
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {images.length === 0 && !uploading && renderEmptyState()}

      {uploading && images.length === 0 && (
        <MotionBox
          as="div"
          className="flex flex-col items-center justify-center p-6 min-h-[120px]"
          animation={{ animationInitiale: 'fadeIn' }}
        >
          {renderProgressBar()}
        </MotionBox>
      )}

      {images.length > 0 && (
        <div className="p-4">
          {pendingCount > 0 && (
            <div className="mb-3 p-3 rounded-xl bg-yellow-500/10 border border-yellow-500/30 flex items-center gap-2 flex-wrap">
              <AlertTriangle size={16} className="text-yellow-600 flex-shrink-0" />
              <span className="text-sm text-[var(--color-textPrimary)] flex-1">
                {pendingCount} image{pendingCount > 1 ? 's' : ''} pas encore envoyée{pendingCount > 1 ? 's' : ''}
                {' '}(elle{pendingCount > 1 ? 's' : ''} ne s'affichera{pendingCount > 1 ? 'ont' : ''} pas tant que l'envoi n'est pas terminé).
              </span>
              <button
                type="button"
                onClick={retryPendingUploads}
                disabled={uploading || !isOnline}
                className="px-3 py-1.5 rounded-lg bg-yellow-600 text-white text-sm flex items-center gap-1.5 disabled:opacity-50"
              >
                <RefreshCw size={14} /> Réessayer
              </button>
            </div>
          )}
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
            {images.map((img, index) => {
              const isLocal = img.startsWith('local://');
              const displayUrl = isLocal && localImages.has(img.replace('local://', ''))
                ? localImages.get(img.replace('local://', ''))?.url || img
                : img;

              return (
                <MotionBox
                  key={`${img}-${index}`}
                  as="div"
                  className="relative group aspect-square rounded-lg overflow-hidden border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] cursor-pointer"
                  onClick={(e) => openPreview(img, e)}
                  animation={{ animationInitiale: { nom: 'fadeUp' } }}
                >
                  {isLocal && (
                    <div className="absolute top-1 left-1 z-10 bg-yellow-500 text-white text-[10px] px-1.5 py-0.5 rounded flex items-center gap-1">
                      <CloudOff size={10} /> Local
                    </div>
                  )}
                  <img
                    src={displayUrl}
                    alt={`Image ${index + 1}`}
                    className="w-full h-full object-cover"
                    onError={(e) => { (e.target as HTMLImageElement).src = 'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100"%3E%3Crect fill="%23f0f0f0" width="100" height="100"/%3E%3Ctext x="50" y="50" text-anchor="middle" dy=".3em" fill="%23999" font-size="12"%3ENo image%3C/text%3E%3C/svg%3E'; }}
                  />
                  <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        openPreview(img, e);
                      }}
                      className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition text-white"
                    >
                      <Eye size={16} />
                    </button>
                    <button
                      onClick={(e) => removeImage(index)}
                      className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-600 transition text-white"
                    >
                      <X size={14} />
                    </button>
                  </div>
                </MotionBox>
              );
            })}
            {!isFull && !uploading && (
              <MotionBox
                as="div"
                className="aspect-square rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                style={{ proprietes: { borderColor: 'var(--color-borderColor)' } as any }}
                onClick={() => fileInputRef.current?.click()}
                onDrop={handleDrop}
                onDragOver={handleDragOver}
                onDragLeave={handleDragLeave}
              >
                <Plus size={24} className="text-[var(--color-textSecondary)]" />
                <span className="text-xs text-[var(--color-textSecondary)] mt-1">Ajouter</span>
              </MotionBox>
            )}
            {uploading && (
              <MotionBox
                as="div"
                className="aspect-square rounded-lg flex flex-col items-center justify-center bg-[var(--color-secondary)] p-2"
              >
                {renderProgressBar()}
              </MotionBox>
            )}
          </div>
        </div>
      )}

      <PreviewModal
        isOpen={!!previewUrl}
        onClose={() => setPreviewUrl(null)}
        url={previewUrl || ''}
        type="image"
      />
    </MotionBox>
  );
};

export default ImageUploader;
