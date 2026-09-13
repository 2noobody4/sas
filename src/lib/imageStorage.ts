import localforage from 'localforage';
import { supabase } from './supabaseClient';

// Instance dédiée pour les images
const imageStore = localforage.createInstance({
  name: 'AppPME',
  storeName: 'images',
});

export interface StoredImage {
  id: string;
  url: string; // URL publique (si uploadée)
  blob?: Blob; // Données binaires (pour stockage local)
  fileName: string;
  mimeType: string;
  size: number;
  uploaded: boolean;
  createdAt: string;
}

// ============================================================
// STOCKER UNE IMAGE LOCALEMENT (depuis un File)
// ============================================================
export async function storeImageLocally(file: File): Promise<StoredImage> {
  try {
    const id = `img_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const blob = file;
    const storedImage: StoredImage = {
      id,
      url: '', // sera rempli après upload
      blob,
      fileName: file.name,
      mimeType: file.type,
      size: file.size,
      uploaded: false,
      createdAt: new Date().toISOString(),
    };
    await imageStore.setItem(id, storedImage);
    return storedImage;
  } catch (error) {
    console.error('[ImageStorage] Erreur stockage local:', error);
    throw error;
  }
}

// ============================================================
// RÉCUPÉRER UNE IMAGE STOCKÉE LOCALEMENT
// ============================================================
export async function getStoredImage(id: string): Promise<StoredImage | null> {
  try {
    return await imageStore.getItem<StoredImage>(id);
  } catch (error) {
    console.error('[ImageStorage] Erreur récupération:', error);
    return null;
  }
}

// ============================================================
// RÉCUPÉRER TOUTES LES IMAGES STOCKÉES LOCALEMENT
// ============================================================
export async function getAllStoredImages(): Promise<StoredImage[]> {
  try {
    const keys = await imageStore.keys();
    const images: StoredImage[] = [];
    for (const key of keys) {
      const img = await imageStore.getItem<StoredImage>(key);
      if (img) images.push(img);
    }
    return images;
  } catch (error) {
    console.error('[ImageStorage] Erreur récupération toutes:', error);
    return [];
  }
}

// ============================================================
// SUPPRIMER UNE IMAGE STOCKÉE LOCALEMENT
// ============================================================
export async function deleteStoredImage(id: string): Promise<void> {
  try {
    await imageStore.removeItem(id);
  } catch (error) {
    console.error('[ImageStorage] Erreur suppression:', error);
    throw error;
  }
}

// ============================================================
// UPLOADER UNE IMAGE VERS SUPABASE (après connexion)
// ============================================================
export async function uploadImageToSupabase(
  image: StoredImage,
  bucket: string = 'logos'
): Promise<string> {
  try {
    if (!image.blob) throw new Error('Aucun blob disponible');
    const file = new File([image.blob], image.fileName, { type: image.mimeType });
    const fileName = `upload_${Date.now()}_${image.id}.${image.fileName.split('.').pop()}`;

    const { error: uploadError } = await supabase.storage
      .from(bucket)
      .upload(fileName, file, { cacheControl: '3600', upsert: true });

    if (uploadError) throw uploadError;

    const { data: urlData } = supabase.storage.from(bucket).getPublicUrl(fileName);
    const publicUrl = urlData.publicUrl;

    // Mettre à jour l'image en local
    const updatedImage = { ...image, url: publicUrl, uploaded: true, blob: undefined };
    await imageStore.setItem(image.id, updatedImage);

    return publicUrl;
  } catch (error) {
    console.error('[ImageStorage] Erreur upload Supabase:', error);
    throw error;
  }
}

// ============================================================
// SYNCHRONISER TOUTES LES IMAGES NON UPLOADÉES
// ============================================================
export async function syncAllImages(bucket: string = 'logos'): Promise<{ success: number; failed: number }> {
  const images = await getAllStoredImages();
  const pending = images.filter(img => !img.uploaded && img.blob);

  let success = 0;
  let failed = 0;

  for (const image of pending) {
    try {
      await uploadImageToSupabase(image, bucket);
      success++;
    } catch (error) {
      console.error('[ImageStorage] Échec upload:', image.fileName, error);
      failed++;
    }
  }

  return { success, failed };
}
