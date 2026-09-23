/**
 * LoadingScreenSettings — permet de choisir l'image/GIF/vidéo affiché(e)
 * pendant l'écran de chargement initial (thème, navigation, sidebar).
 */
import React, { useState } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../contexts/ConfigContext';
import { useToast } from '../hooks/useToast';
import { useOffline } from '../contexts/OfflineContext';
import { supabase } from '../lib/supabaseClient';
import { storeImageLocally, uploadImageToSupabase } from '../lib/imageStorage';
import { Upload, X, Loader2 } from 'lucide-react';

const LOADING_SCREEN_BUCKET = 'loading-screens';

const isVideoFile = (url: string) => /\.(mp4|webm|mov)(\?.*)?$/i.test(url);

export const LoadingScreenSettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError, info } = useToast();
  const { isOnline } = useOffline();
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [previewUrl, setPreviewUrl] = useState<string>(config.loading_screen_url || '');

  const handleFile = async (file: File) => {
    if (!file.type.startsWith('image/') && !file.type.startsWith('video/')) {
      toastError('Formats acceptes : image (png, jpg, gif, webp, svg) ou video (mp4, webm).');
      return;
    }

    setUploading(true);
    try {
      const stored = await storeImageLocally(file, LOADING_SCREEN_BUCKET);

      if (!isOnline) {
        info('Fichier enregistre localement, il sera envoye une fois en ligne.');
        setPreviewUrl(URL.createObjectURL(file));
        setUploading(false);
        return;
      }

      const publicUrl = await uploadImageToSupabase(stored, LOADING_SCREEN_BUCKET);
      setPreviewUrl(publicUrl);
      success('Fichier importe - pensez a Enregistrer.');
    } catch (err: any) {
      toastError(err.message || "Erreur lors de l'import du fichier");
    } finally {
      setUploading(false);
    }
  };

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) handleFile(file);
    e.target.value = '';
  };

  const handleRemove = () => setPreviewUrl('');

  const handleSave = async () => {
    setSaving(true);
    try {
      const configId = config.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase
        .from('config')
        .update({ loading_screen_url: previewUrl })
        .eq('id', configId);
      if (error) throw error;

      await config.refreshConfig();
      success('Ecran de chargement mis a jour');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setSaving(false);
    }
  };

  return (
    <SettingsSection title="Ecran de chargement" icon="⏳" onClose={onClose}>
      <div className="space-y-4">
        <p className="text-sm text-[var(--color-textSecondary)]">
          Choisissez une image, un GIF ou une video a afficher pendant le chargement initial de
          l'application (theme, navigation, menu lateral). Sans fichier, le logo par defaut est utilise.
        </p>

        <div className="p-4 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] flex flex-col items-center gap-4">
          {previewUrl ? (
            <div className="relative">
              {isVideoFile(previewUrl) ? (
                <video
                  src={previewUrl}
                  autoPlay
                  loop
                  muted
                  playsInline
                  className="h-32 w-auto rounded-lg"
                />
              ) : (
                <img src={previewUrl} alt="Apercu ecran de chargement" className="h-32 w-auto rounded-lg" />
              )}
              <button
                type="button"
                onClick={handleRemove}
                className="absolute -top-2 -right-2 p-1 rounded-full bg-red-500 text-white"
                title="Retirer"
              >
                <X size={14} />
              </button>
            </div>
          ) : (
            <div className="h-32 w-32 flex items-center justify-center rounded-lg border-2 border-dashed border-[var(--color-borderColor)] text-[var(--color-textSecondary)] text-xs text-center px-2">
              Aucun fichier - logo par defaut utilise
            </div>
          )}

          <label className="flex items-center gap-2 px-4 py-2 rounded cursor-pointer border border-[var(--color-borderColor)] text-[var(--color-textPrimary)] hover:bg-[var(--color-secondary)]">
            {uploading ? <Loader2 size={16} className="animate-spin" /> : <Upload size={16} />}
            {uploading ? 'Import en cours...' : 'Choisir un fichier'}
            <input
              type="file"
              accept="image/*,video/mp4,video/webm"
              className="hidden"
              onChange={handleFileChange}
              disabled={uploading}
            />
          </label>
        </div>
      </div>

      <div className="flex justify-end gap-3 mt-4">
        <button
          onClick={onClose}
          className="px-4 py-2 rounded border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
        >
          Annuler
        </button>
        <button
          onClick={handleSave}
          disabled={saving || uploading}
          className="px-4 py-2 rounded bg-[var(--color-primary)] text-white"
        >
          {saving ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </SettingsSection>
  );
};

export default LoadingScreenSettings;
