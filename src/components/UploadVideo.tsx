import React, { useState, useRef } from 'react';
import { MotionBox } from './MotionBox';
import { Upload, X, Video, Plus, Eye } from 'lucide-react';
import { supabase } from '../lib/supabaseClient';
import { useToast } from '../hooks/useToast';
import { PreviewModal } from './PreviewModal';

interface UploadVideoProps {
  videos: string[];
  onChange: (videos: string[]) => void;
  max?: number;
  bucket?: string;
  label?: string;
  className?: string;
}

export const UploadVideo: React.FC<UploadVideoProps> = ({
  videos = [],
  onChange,
  max = 3,
  bucket = 'videos',
  label = 'Ajouter une vidéo',
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
  const isFull = videos.length >= max;

  const uploadFiles = async (fileList: FileList) => {
    const remaining = max - videos.length;
    const filesToUpload = Array.from(fileList).slice(0, remaining);
    const total = filesToUpload.length;
    let uploaded = 0;
    const newVideos: string[] = [];

    setUploading(true);
    setTotalFiles(total);
    setUploadedFiles(0);
    setProgress(0);

    try {
      for (const file of filesToUpload) {
        const fileExt = file.name.split('.').pop();
        const fileName = `video_${Date.now()}_${Math.random().toString(36).slice(2, 7)}.${fileExt}`;

        const { error: uploadError } = await supabase.storage
          .from(bucket)
          .upload(fileName, file, { cacheControl: '3600', upsert: true });

        if (uploadError) {
          console.error('[UploadVideo] Erreur upload:', uploadError);
          toastError(`Erreur: ${uploadError.message}`);
          continue;
        }

        const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
        newVideos.push(urlData.publicUrl);

        uploaded++;
        setUploadedFiles(uploaded);
        setProgress(Math.round((uploaded / total) * 100));
      }

      if (newVideos.length > 0) {
        onChange([...videos, ...newVideos]);
        success(`${newVideos.length} vidéo${newVideos.length > 1 ? 's' : ''} uploadée${newVideos.length > 1 ? 's' : ''} ✅`);
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

  const removeVideo = (index: number) => {
    onChange(videos.filter((_, i) => i !== index));
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
        accept="video/*"
        multiple
        onChange={handleFileChange}
        className="hidden"
        disabled={uploading}
      />

      {videos.length === 0 && !uploading ? (
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
              <Video size={32} className="text-[var(--color-textSecondary)]" />
              <p className="mt-2 text-sm font-medium text-[var(--color-textPrimary)]">
                {isDragging ? 'Déposez les fichiers ici' : label}
              </p>
              <p className="text-xs text-[var(--color-textSecondary)]">
                {videos.length} / {max} vidéos
              </p>
            </>
          )}
        </MotionBox>
      ) : (
        <div className="p-4">
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-3">
            {videos.map((url, index) => (
              <MotionBox
                key={url}
                as="div"
                className="relative group aspect-video rounded-lg overflow-hidden border border-[var(--color-borderColor)] bg-[var(--color-cardBg)]"
              >
                <video src={url} className="w-full h-full object-cover" controls={false} />
                <div className="absolute inset-0 flex items-center justify-center gap-2 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity">
                  <button
                    onClick={() => setPreviewUrl(url)}
                    className="p-1.5 bg-white/20 rounded-full hover:bg-white/40 transition text-white"
                  >
                    <Eye size={16} />
                  </button>
                  <button
                    onClick={() => removeVideo(index)}
                    className="p-1.5 bg-red-500/80 rounded-full hover:bg-red-600 transition text-white"
                  >
                    <X size={14} />
                  </button>
                </div>
              </MotionBox>
            ))}
            {!isFull && !uploading && (
              <MotionBox
                as="div"
                className="aspect-video rounded-lg border-2 border-dashed flex flex-col items-center justify-center cursor-pointer hover:border-[var(--color-primary)] transition-colors"
                style={{ proprietes: { borderColor: 'var(--color-borderColor)' } as any }}
                onClick={triggerFileInput}
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
                className="aspect-video rounded-lg bg-[var(--color-secondary)] flex items-center justify-center p-2"
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
        type="video"
      />
    </MotionBox>
  );
};

export default UploadVideo;
