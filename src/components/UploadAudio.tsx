import React, { useState, useRef } from 'react';
import { MotionBox } from './MotionBox';
import { Upload, X, Music, Plus, Eye } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../hooks/useToast';
import { PreviewModal } from './PreviewModal';

interface UploadAudioProps {
  audios: string[];
  onChange: (audios: string[]) => void;
  max?: number;
  bucket?: string;
  label?: string;
  className?: string;
}

export const UploadAudio: React.FC<UploadAudioProps> = ({
  audios = [],
  onChange,
  max = 5,
  bucket = 'audios',
  label = 'Ajouter un audio',
  className = '',
}) => {
  const { success, error: toastError } = useToast();
  const [isDragging, setIsDragging] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [progress, setProgress] = useState(0);
  const [totalFiles, setTotalFiles] = useState(0);
  const [uploadedFiles, setUploadedFiles] = useState(0);
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const isFull = audios.length >= max;

  const uploadFiles = async (files: FileList) => {
    const remaining = max - audios.length;
    const filesToUpload = Array.from(files).slice(0, remaining);
    const total = filesToUpload.length;
    let uploaded = 0;
    const newAudios: string[] = [];

    setUploading(true);
    setTotalFiles(total);
    setUploadedFiles(0);
    setProgress(0);

    try {
      for (const file of Array.from(filesToUpload)) {
        const fileExt = file.name.split('.').pop();
        const fileName = `audio_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          console.error('[UploadAudio] Erreur upload:', uploadError);
          toastError(`Erreur: ${uploadError.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        newAudios.push(urlData.publicUrl);

        uploaded++;
        setUploadedFiles(uploaded);
        setProgress(Math.round((uploaded / total) * 100));
      }

      if (newAudios.length > 0) {
        onChange([...audios, ...newAudios]);
        success(`${newAudios.length} audio${newAudios.length > 1 ? 's' : ''} uploadé${newAudios.length > 1 ? 's' : ''} ✅`);
      }
    } catch (err: any) {
      toastError(err.message || 'Erreur lors de l\'upload');
    } finally {
      setUploading(false);
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

  const removeAudio = (index: number) => {
    onChange(audios.filter((_, i) => i !== index));
  };

  const triggerFileInput = () => {
    if (!isFull && !uploading) {
      fileInputRef.current?.click();
    }
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
        accept="audio/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {audios.length === 0 && !uploading ? (
        <MotionBox
          as="div"
          className="flex flex-col items-center justify-center p-6 cursor-pointer rounded-xl border-2 border-dashed transition-all"
          style={{
            proprietes: {
              borderColor: isDragging ? 'var(--color-primary)' : 'var(--color-borderColor)',
              backgroundColor: isDragging ? 'var(--color-primary-light)' : 'var(--color-cardBg)',
              minHeight: '120px',
            } as any,
          }}
          onClick={triggerFileInput}
          onDrop={handleDrop}
          onDragOver={handleDragOver}
          onDragLeave={handleDragLeave}
          animation={{ declenchees: [{ trigger: 'hover', animation: 'liftHover' }] }}
        >
          {uploading ? renderProgressBar() : (
            <>
              <Music size={32} className="text-[var(--color-textSecondary)]" />
              <p className="mt-2 text-sm font-medium text-[var(--color-textPrimary)]">
                {isDragging ? 'Déposez les fichiers ici' : label}
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                {audios.length} / {max} audios
              </p>
            </>
          )}
        </MotionBox>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-1 gap-2">
            {audios.map((url, index) => (
              <MotionBox
                key={url}
                as="div"
                className="flex items-center justify-between p-2 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
              >
                <div className="flex items-center gap-3 flex-1 min-w-0">
                  <Music size={18} className="text-[var(--color-primary)] flex-shrink-0" />
                  <audio controls className="h-8 max-w-[200px] flex-shrink-0" src={url} />
                  <span className="text-sm text-[var(--color-textPrimary)] truncate flex-1">
                    {url.split('/').pop() || `audio-${index}`}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button
                    onClick={() => setPreviewUrl(url)}
                    className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)] transition"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => removeAudio(index)}
                    className="p-1 rounded hover:bg-[var(--color-danger)]/10 text-[var(--color-danger)] transition"
                  >
                    <X size={16} />
                  </button>
                </div>
              </MotionBox>
            ))}
            {!isFull && !uploading && (
              <MotionBox
                as="button"
                type="button"
                variant="secondary"
                onClick={triggerFileInput}
                className="flex items-center justify-center gap-2 p-2 rounded-lg border-2 border-dashed border-[var(--color-borderColor)] hover:border-[var(--color-primary)] transition"
              >
                <Plus size={18} className="text-[var(--color-textSecondary)]" />
                <span className="text-sm text-[var(--color-textSecondary)]">Ajouter un audio</span>
              </MotionBox>
            )}
            {uploading && (
              <MotionBox as="div" className="p-2 bg-[var(--color-secondary)] rounded-lg">
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
        type="audio"
      />
    </MotionBox>
  );
};

export default UploadAudio;
