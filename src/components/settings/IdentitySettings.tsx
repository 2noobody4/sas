import React, { useState, useEffect } from 'react';
import { SettingsSection } from './SettingsSection';
import { useConfig } from '../../contexts/ConfigContext';
import { useToast } from '../../hooks/useToast';
import { supabase } from '../../lib/supabaseClient';
import { Upload, Facebook, Twitter, Instagram, Linkedin, Youtube } from 'lucide-react';

export const IdentitySettings: React.FC<{ onClose: () => void }> = ({ onClose }) => {
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [loading, setLoading] = useState(false);
  const [uploading, setUploading] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [form, setForm] = useState({
    store_name: config.storeName || '',
    logo_url: config.logo_url || '',
    email: config.storeEmail || '',
    phone: config.storePhone || '',
    address: config.storeAddress || '',
    facebook: config.facebook_url || '',
    twitter: config.twitter_url || '',
    instagram: config.instagram_url || '',
    linkedin: config.linkedin_url || '',
    youtube: config.youtube_url || '',
    tiktok: config.tiktok_url || '',
  });

  useEffect(() => {
    if (config.loaded) {
      setForm({
        store_name: config.storeName || '',
        logo_url: config.logo_url || '',
        email: config.storeEmail || '',
        phone: config.storePhone || '',
        address: config.storeAddress || '',
        facebook: config.facebook_url || '',
        twitter: config.twitter_url || '',
        instagram: config.instagram_url || '',
        linkedin: config.linkedin_url || '',
        youtube: config.youtube_url || '',
        tiktok: config.tiktok_url || '',
      });
    }
  }, [config]);

  const validate = (): boolean => {
    const newErrors: Record<string, string> = {};
    if (form.email && !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(form.email)) {
      newErrors.email = 'Email invalide';
    }
    ['facebook', 'twitter', 'instagram', 'linkedin', 'youtube', 'tiktok'].forEach(key => {
      const val = form[key as keyof typeof form] as string;
      if (val && !/^https?:\/\//.test(val)) {
        newErrors[key] = 'URL invalide (doit commencer par http:// ou https://)';
      }
    });
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setUploading(true);
    try {
      const fileExt = file.name.split('.').pop();
      const fileName = `logo_${Date.now()}.${fileExt}`;
      const { error } = await supabase.storage
        .from('logos')
        .upload(fileName, file, { cacheControl: '3600', upsert: true });
      if (error) throw error;
      const { data: urlData } = supabase.storage.from('logos').getPublicUrl(fileName);
      const publicUrl = urlData.publicUrl;
      setForm(prev => ({ ...prev, logo_url: publicUrl }));
      success('Logo uploadé ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setUploading(false);
    }
  };

  const handleSave = async () => {
    if (!validate()) {
      toastError('Veuillez corriger les erreurs');
      return;
    }
    setLoading(true);
    try {
      const configId = config.id || '00000000-0000-0000-0000-000000000000';
      const { error } = await supabase
        .from('config')
        .update({
          store_name: form.store_name,
          logo_url: form.logo_url,
          store_email: form.email,
          store_phone: form.phone,
          store_address: form.address,
          facebook_url: form.facebook,
          twitter_url: form.twitter,
          instagram_url: form.instagram,
          linkedin_url: form.linkedin,
          youtube_url: form.youtube,
          tiktok_url: form.tiktok,
        })
        .eq('id', configId);
      if (error) throw error;
      await config.refreshConfig();
      success('Identité mise à jour ✅');
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const socialFields = [
    { key: 'facebook', label: 'Facebook', icon: Facebook, placeholder: 'https://facebook.com/votrepage' },
    { key: 'twitter', label: 'Twitter', icon: Twitter, placeholder: 'https://twitter.com/votrecompte' },
    { key: 'instagram', label: 'Instagram', icon: Instagram, placeholder: 'https://instagram.com/votrecompte' },
    { key: 'linkedin', label: 'LinkedIn', icon: Linkedin, placeholder: 'https://linkedin.com/company/votrepage' },
    { key: 'youtube', label: 'YouTube', icon: Youtube, placeholder: 'https://youtube.com/@votrechaine' },
    { key: 'tiktok', label: 'TikTok', icon: Youtube, placeholder: 'https://tiktok.com/@votrecompte' },
  ];

  return (
    <SettingsSection title="Identité" icon="🏪" onClose={onClose}>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Nom de l'application</label>
          <input
            type="text"
            value={form.store_name}
            onChange={(e) => setForm({ ...form, store_name: e.target.value })}
            className="w-full px-3 py-2 border rounded border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Logo</label>
          <div className="flex items-center gap-4">
            <div className="relative">
              <input
                type="file"
                accept="image/*"
                onChange={handleFileUpload}
                disabled={uploading}
                className="absolute inset-0 opacity-0 cursor-pointer"
              />
              <button
                className="px-4 py-2 rounded border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] flex items-center gap-2"
                disabled={uploading}
              >
                <Upload size={16} /> {uploading ? 'Upload...' : 'Choisir un fichier'}
              </button>
            </div>
            {form.logo_url && (
              <img src={form.logo_url} alt="Logo" className="h-12 w-auto object-contain" />
            )}
          </div>
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Email de contact</label>
          <input
            type="email"
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
            className="w-full px-3 py-2 border rounded border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
          {errors.email && <p className="text-xs mt-1 text-[var(--color-danger)]">{errors.email}</p>}
        </div>
        <div>
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Téléphone</label>
          <input
            type="text"
            value={form.phone}
            onChange={(e) => setForm({ ...form, phone: e.target.value })}
            className="w-full px-3 py-2 border rounded border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <div className="md:col-span-2">
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Adresse</label>
          <input
            type="text"
            value={form.address}
            onChange={(e) => setForm({ ...form, address: e.target.value })}
            className="w-full px-3 py-2 border rounded border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
          />
        </div>
        <div className="md:col-span-2">
          <p className="text-sm font-medium text-[var(--color-textPrimary)]">Réseaux sociaux</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-2">
            {socialFields.map(({ key, label, icon: Icon, placeholder }) => (
              <div key={key}>
                <label className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)]">
                  <Icon size={16} /> {label}
                </label>
                <input
                  type="text"
                  value={form[key as keyof typeof form] as string}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                  placeholder={placeholder}
                  className="w-full px-3 py-2 border rounded text-sm border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                />
                {errors[key] && <p className="text-xs mt-1 text-[var(--color-danger)]">{errors[key]}</p>}
              </div>
            ))}
          </div>
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
          disabled={loading}
          className="px-4 py-2 rounded bg-[var(--color-primary)] text-white"
        >
          {loading ? 'Sauvegarde...' : 'Enregistrer'}
        </button>
      </div>
    </SettingsSection>
  );
};
