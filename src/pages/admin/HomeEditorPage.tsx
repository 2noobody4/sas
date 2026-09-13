import React, { useState, useEffect } from 'react';
import { useHistory } from 'react-router-dom';
import { MotionBox } from '../../components/ui/MotionBox';
import { ImageUploader } from '../../components/ui/ImageUploader';
import { useHomeConfig, useUpdateHomeConfig, useCreateHomeBlock, useUpdateHomeBlock, useDeleteHomeBlock } from '../../hooks/useHomeConfig';
import { HomeBlock, HomeBlockFormData } from '../../types/homeConfig';
import { ArrowLeft, Plus, Edit, Trash2, GripVertical, Eye, EyeOff, X, Save } from 'lucide-react';
import { useToast } from '../../hooks/useToast';
import { Link } from 'react-router-dom';

type BlockType = HomeBlock['type'];

const BLOCK_TYPES: { value: BlockType; label: string; icon: string }[] = [
  { value: 'hero', label: 'Hero (bannière principale)', icon: '🎯' },
  { value: 'banner', label: 'Bannière publicitaire', icon: '🖼️' },
  { value: 'products', label: 'Liste de produits', icon: '📦' },
  { value: 'featured', label: 'Produits vedettes', icon: '⭐' },
  { value: 'features', label: 'Fonctionnalités', icon: '⚡' },
  { value: 'testimonials', label: 'Témoignages', icon: '💬' },
  { value: 'cta', label: 'Appel à l\'action', icon: '🚀' },
  { value: 'custom', label: 'Personnalisé', icon: '📝' },
];

const widgetConfigFields: Record<BlockType, Array<{ key: string; label: string; type: 'text' | 'textarea' | 'number' | 'image' | 'link' }>> = {
  hero: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'content', label: 'Contenu', type: 'textarea' },
    { key: 'image_url', label: 'Image', type: 'image' },
    { key: 'link_url', label: 'Lien (URL)', type: 'link' },
    { key: 'link_label', label: 'Texte du lien', type: 'text' },
  ],
  banner: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'image_url', label: 'Image', type: 'image' },
    { key: 'link_url', label: 'Lien (URL)', type: 'link' },
    { key: 'link_label', label: 'Texte du lien', type: 'text' },
  ],
  products: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'link_url', label: 'Lien "Voir tout"', type: 'link' },
    { key: 'link_label', label: 'Texte du lien', type: 'text' },
    { key: 'limit', label: 'Nombre de produits', type: 'number' },
  ],
  featured: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'link_url', label: 'Lien "Voir tout"', type: 'link' },
    { key: 'link_label', label: 'Texte du lien', type: 'text' },
    { key: 'limit', label: 'Nombre de produits', type: 'number' },
  ],
  features: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
  ],
  testimonials: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
  ],
  cta: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'link_url', label: 'Lien (URL)', type: 'link' },
    { key: 'link_label', label: 'Texte du lien', type: 'text' },
  ],
  custom: [
    { key: 'title', label: 'Titre', type: 'text' },
    { key: 'subtitle', label: 'Sous-titre', type: 'text' },
    { key: 'content', label: 'Contenu HTML', type: 'textarea' },
  ],
};

export const HomeEditorPage: React.FC = () => {
  const history = useHistory();
  const { data: config, isLoading, refetch } = useHomeConfig();
  const updateConfig = useUpdateHomeConfig();
  const createBlock = useCreateHomeBlock();
  const updateBlock = useUpdateHomeBlock();
  const deleteBlock = useDeleteHomeBlock();
  const { success, error: toastError } = useToast();

  const [blocks, setBlocks] = useState<HomeBlock[]>([]);
  const [editingBlock, setEditingBlock] = useState<HomeBlock | null>(null);
  const [showBlockForm, setShowBlockForm] = useState(false);
  const [loading, setLoading] = useState(false);

  const [form, setForm] = useState<HomeBlockFormData>({
    type: 'hero',
    title: '',
    subtitle: '',
    content: '',
    image_url: '',
    link_url: '',
    link_label: '',
    order: 0,
    enabled: true,
    config: {},
  });
  const [images, setImages] = useState<string[]>([]);

  useEffect(() => {
    if (config) {
      setBlocks(config.blocks || []);
    }
  }, [config]);

  const handleBlockSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    try {
      const dataToSend = {
        ...form,
        image_url: images[0] || form.image_url,
        config: form.config || {},
        order: form.order || 0,
      };
      if (editingBlock) {
        await updateBlock.mutateAsync({ id: editingBlock.id, data: dataToSend as any });
        success('Bloc mis à jour ✅');
      } else {
        const maxOrder = blocks.reduce((max, b) => Math.max(max, b.order), -1);
        await createBlock.mutateAsync({ ...dataToSend, order: maxOrder + 1 } as any);
        success('Bloc créé ✅');
      }
      setShowBlockForm(false);
      setEditingBlock(null);
      setForm({ type: 'hero', title: '', subtitle: '', content: '', image_url: '', link_url: '', link_label: '', order: 0, enabled: true, config: {} });
      setImages([]);
      refetch();
    } catch (err: any) {
      toastError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteBlock = async (id: string) => {
    if (window.confirm('Supprimer ce bloc ?')) {
      await deleteBlock.mutateAsync(id);
      refetch();
    }
  };

  const handleEditBlock = (block: HomeBlock) => {
    setEditingBlock(block);
    setForm({
      type: block.type,
      title: block.title || '',
      subtitle: block.subtitle || '',
      content: block.content || '',
      image_url: block.image_url || '',
      link_url: block.link_url || '',
      link_label: block.link_label || '',
      order: block.order,
      enabled: block.enabled,
      config: block.config || {},
    });
    if (block.image_url) setImages([block.image_url]);
    setShowBlockForm(true);
  };

  const handleToggleBlock = async (block: HomeBlock) => {
    await updateBlock.mutateAsync({
      id: block.id,
      data: { enabled: !block.enabled },
    });
    refetch();
  };

  const getBlockTypeLabel = (type: BlockType) => {
    const found = BLOCK_TYPES.find(t => t.value === type);
    return found ? found.label : type;
  };

  if (isLoading) return <div className="p-6 text-center text-[var(--color-textSecondary)]">Chargement...</div>;

  const renderConfigFields = () => {
    const fields = widgetConfigFields[form.type as BlockType] || [];
    return fields.map((field) => {
      if (field.type === 'image') {
        return (
          <div key={field.key} className="col-span-2">
            <label className="block text-sm font-medium text-[var(--color-textPrimary)]">{field.label}</label>
            <ImageUploader
              images={images}
              onChange={setImages}
              max={1}
              bucket="home"
              label="Ajouter une image"
            />
          </div>
        );
      }
      if (field.type === 'number') {
        const value = (form.config as any)?.[field.key] || '';
        return (
          <div key={field.key} className="col-span-2">
            <label className="block text-sm font-medium text-[var(--color-textPrimary)]">{field.label}</label>
            <input
              type="number"
              value={value}
              onChange={(e) => setForm({ ...form, config: { ...(form.config || {}), [field.key]: parseInt(e.target.value) || 0 } })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          </div>
        );
      }
      if (field.type === 'link') {
        const val = form[field.key as keyof HomeBlockFormData] || '';
        return (
          <div key={field.key} className="col-span-2">
            <label className="block text-sm font-medium text-[var(--color-textPrimary)]">{field.label}</label>
            <input
              type="text"
              value={typeof val === 'string' ? val : ''}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              placeholder="https://..."
            />
          </div>
        );
      }
      const val = form[field.key as keyof HomeBlockFormData] || '';
      return (
        <div key={field.key} className="col-span-2">
          <label className="block text-sm font-medium text-[var(--color-textPrimary)]">{field.label}</label>
          {field.type === 'textarea' ? (
            <textarea
              value={typeof val === 'string' ? val : ''}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              rows={3}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          ) : (
            <input
              type="text"
              value={typeof val === 'string' ? val : ''}
              onChange={(e) => setForm({ ...form, [field.key]: e.target.value })}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
            />
          )}
        </div>
      );
    });
  };

  return (
    <div className="p-6 max-w-7xl mx-auto">
      <div className="flex items-center gap-3 mb-6">
        <button onClick={() => history.push('/gestion')} className="p-2 rounded hover:bg-[var(--color-secondary)]">
          <ArrowLeft size={24} />
        </button>
        <h1 className="text-2xl font-bold text-[var(--color-textPrimary)]">🏠 Éditeur de la page d'accueil</h1>
        <Link to="/" target="_blank" className="ml-auto px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition">
          <Eye size={18} /> Voir la page
        </Link>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        <MotionBox type="card" variant="elevated" className="p-4 lg:col-span-1">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)]">📋 Blocs</h3>
            <button
              onClick={() => {
                setEditingBlock(null);
                setForm({ type: 'hero', title: '', subtitle: '', content: '', image_url: '', link_url: '', link_label: '', order: blocks.length, enabled: true, config: {} });
                setImages([]);
                setShowBlockForm(true);
              }}
              className="px-3 py-1 rounded-lg bg-[var(--color-primary)] text-white text-sm flex items-center gap-1"
            >
              <Plus size={16} /> Ajouter
            </button>
          </div>
          <div className="space-y-2 max-h-[70vh] overflow-y-auto">
            {blocks.sort((a, b) => a.order - b.order).map((block) => (
              <div key={block.id} className="flex items-center justify-between p-2 rounded border border-[var(--color-borderColor)] hover:bg-[var(--color-secondary)]/50">
                <div className="flex items-center gap-2 flex-1 min-w-0">
                  <span className="text-sm font-medium text-[var(--color-textPrimary)] truncate">{block.title || 'Sans titre'}</span>
                  <span className="text-xs px-2 py-0.5 rounded-full bg-[var(--color-secondary)] text-[var(--color-textSecondary)] flex-shrink-0">{getBlockTypeLabel(block.type)}</span>
                  <span className={`text-xs px-2 py-0.5 rounded-full flex-shrink-0 ${block.enabled ? 'bg-[var(--color-success)]/10 text-[var(--color-success)]' : 'bg-[var(--color-danger)]/10 text-[var(--color-danger)]'}`}>
                    {block.enabled ? '✅' : '❌'}
                  </span>
                </div>
                <div className="flex gap-1 flex-shrink-0">
                  <button onClick={() => handleToggleBlock(block)} className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]" title={block.enabled ? 'Désactiver' : 'Activer'}>
                    {block.enabled ? <Eye size={14} /> : <EyeOff size={14} />}
                  </button>
                  <button onClick={() => handleEditBlock(block)} className="p-1 rounded hover:bg-[var(--color-secondary)] text-[var(--color-textSecondary)]"><Edit size={14} /></button>
                  <button onClick={() => handleDeleteBlock(block.id)} className="p-1 rounded hover:bg-red-50 text-[var(--color-danger)]"><Trash2 size={14} /></button>
                </div>
              </div>
            ))}
          </div>
        </MotionBox>

        <MotionBox type="card" variant="elevated" className="p-6 lg:col-span-3">
          {showBlockForm ? (
            <div>
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-xl font-bold text-[var(--color-textPrimary)]">{editingBlock ? 'Modifier le bloc' : 'Nouveau bloc'}</h3>
                <button onClick={() => setShowBlockForm(false)} className="text-[var(--color-textSecondary)]"><X size={20} /></button>
              </div>
              <form onSubmit={handleBlockSubmit} className="space-y-4">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Type de bloc *</label>
                    <select
                      value={form.type}
                      onChange={(e) => setForm({ ...form, type: e.target.value as BlockType })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    >
                      {BLOCK_TYPES.map((t) => (
                        <option key={t.value} value={t.value}>{t.icon} {t.label}</option>
                      ))}
                    </select>
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-[var(--color-textPrimary)]">Ordre</label>
                    <input
                      type="number"
                      value={form.order || 0}
                      onChange={(e) => setForm({ ...form, order: parseInt(e.target.value) || 0 })}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                    />
                  </div>
                  <div className="flex items-center gap-2">
                    <input
                      type="checkbox"
                      checked={form.enabled !== undefined ? form.enabled : true}
                      onChange={(e) => setForm({ ...form, enabled: e.target.checked })}
                      className="accent-[var(--color-primary)]"
                    />
                    <label className="text-sm text-[var(--color-textPrimary)]">Bloc actif</label>
                  </div>
                </div>
                {renderConfigFields()}
                <div className="flex justify-end gap-3 pt-4 border-t border-[var(--color-borderColor)]">
                  <button type="button" onClick={() => setShowBlockForm(false)} className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]">Annuler</button>
                  <button type="submit" disabled={loading} className={`px-4 py-2 rounded-xl text-white ${loading ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'}`}>
                    {loading ? 'Enregistrement...' : (editingBlock ? 'Mettre à jour' : 'Créer')}
                  </button>
                </div>
              </form>
            </div>
          ) : (
            <div className="text-center py-12 text-[var(--color-textSecondary)]">
              <p>Sélectionnez un bloc dans la liste ou cliquez sur "Ajouter" pour en créer un nouveau.</p>
            </div>
          )}
        </MotionBox>
      </div>
    </div>
  );
};

export default HomeEditorPage;
