import React, { useState, useEffect } from 'react';
import { MotionBox } from './MotionBox';
import { ColorPicker } from './ColorPicker';
import { 
  getMotionBoxUsagesByPage, 
  getAllPages, 
  MotionBoxUsage,
  searchMotionBoxUsages
} from '../registres/motionBoxUsages';
import { useTheme } from '../contexts/ThemeContext';
import { X, Save, RefreshCw, Eye, Edit, Search } from 'lucide-react';
import { useToast } from '../hooks/useToast';

interface MotionBoxUsageEditorProps {
  isOpen: boolean;
  onClose: () => void;
  onSave?: () => void;
}

export const MotionBoxUsageEditor: React.FC<MotionBoxUsageEditorProps> = ({
  isOpen,
  onClose,
  onSave,
}) => {
  const { theme, updateComponentStyle, refreshTheme } = useTheme();
  const { success, error: toastError } = useToast();
  
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedUsage, setSelectedUsage] = useState<MotionBoxUsage | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [saving, setSaving] = useState(false);
  const [previewVisible, setPreviewVisible] = useState(false);
  
  const [styleProps, setStyleProps] = useState<Record<string, string | number>>({
    backgroundColor: '#FFFFFF',
    color: '#1E3A5F',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid #E2E6EA',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  });

  const pages = getAllPages();
  const usages = selectedPage ? getMotionBoxUsagesByPage(selectedPage) : [];

  useEffect(() => {
    if (selectedUsage) {
      const comp = theme.composants.find(
        (c: any) => c.typeComponent === `${selectedUsage.type}:${selectedUsage.variant || 'default'}`
      );
      if (comp) {
        setStyleProps(comp.style?.proprietes || styleProps);
      } else {
        setStyleProps({
          backgroundColor: '#FFFFFF',
          color: '#1E3A5F',
          borderRadius: 12,
          padding: '16px 20px',
          border: '1px solid #E2E6EA',
          boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
        });
      }
    }
  }, [selectedUsage, theme]);

  const handleSave = async () => {
    if (!selectedUsage) return;
    setSaving(true);
    try {
      const typeComponent = `${selectedUsage.type}:${selectedUsage.variant || 'default'}`;
      await updateComponentStyle(typeComponent, { proprietes: styleProps });
      await refreshTheme();
      success(`Style de "${selectedUsage.id}" sauvegardé ✅`);
      onSave?.();
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const handlePropChange = (key: string, value: string | number) => {
    setStyleProps(prev => ({ ...prev, [key]: value }));
  };

  const filteredUsages = searchTerm
    ? usages.filter((u: MotionBoxUsage) => 
        u.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
        u.type.toLowerCase().includes(searchTerm.toLowerCase()) ||
        (u.variant && u.variant.toLowerCase().includes(searchTerm.toLowerCase())) ||
        (u.description && u.description.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    : usages;

  if (!isOpen) return null;

  return (
    <MotionBox
      as="div"
      className="fixed inset-0 bg-black/60 flex items-center justify-center z-[200] p-4"
      onClick={(e) => e.target === e.currentTarget && onClose()}
      animation={{ animationInitiale: 'fadeIn' }}
    >
      <MotionBox
        as="div"
        type="card"
        variant="xlarge"
        className="w-full max-w-5xl max-h-[90vh] overflow-hidden bg-[var(--color-cardBg)] rounded-2xl shadow-2xl flex flex-col"
        animation={{ animationInitiale: 'slideUp' }}
      >
        {/* En-tête */}
        <div className="flex items-center justify-between p-4 border-b border-[var(--color-borderColor)] bg-[var(--color-secondary)] flex-shrink-0">
          <div className="flex items-center gap-3">
            <Edit size={20} className="text-[var(--color-primary)]" />
            <h2 className="text-xl font-bold text-[var(--color-textPrimary)]">Éditeur de composants par page</h2>
          </div>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-[var(--color-secondary)] transition text-[var(--color-textSecondary)]"
          >
            <X size={24} />
          </button>
        </div>

        <div className="flex-1 overflow-hidden flex flex-col md:flex-row">
          {/* Panneau gauche - Sélection */}
          <div className="w-full md:w-1/3 p-4 border-r border-[var(--color-borderColor)] overflow-y-auto flex-shrink-0">
            <div className="mb-4">
              <label className="block text-sm font-medium text-[var(--color-textPrimary)] mb-1">Page</label>
              <select
                value={selectedPage}
                onChange={(e) => {
                  setSelectedPage(e.target.value);
                  setSelectedUsage(null);
                }}
                className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
              >
                <option value="">Sélectionner une page</option>
                {pages.map((page: string) => (
                  <option key={page} value={page}>{page}</option>
                ))}
              </select>
            </div>

            {selectedPage && (
              <>
                <div className="relative mb-3">
                  <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-[var(--color-textSecondary)]" />
                  <input
                    type="text"
                    placeholder="Rechercher un composant..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-full pl-9 pr-3 py-1.5 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
                  />
                </div>

                <div className="space-y-1 max-h-[50vh] overflow-y-auto">
                  {filteredUsages.length === 0 ? (
                    <p className="text-sm text-[var(--color-textSecondary)] text-center py-4">
                      {searchTerm ? 'Aucun composant trouvé' : 'Aucun composant pour cette page'}
                    </p>
                  ) : (
                    filteredUsages.map((usage: MotionBoxUsage) => {
                      const isSelected = selectedUsage?.id === usage.id;
                      return (
                        <button
                          key={usage.id}
                          onClick={() => setSelectedUsage(usage)}
                          className={`w-full text-left px-3 py-2 rounded-lg transition flex items-center justify-between ${
                            isSelected
                              ? 'bg-[var(--color-primary)]/10 border border-[var(--color-primary)]'
                              : 'hover:bg-[var(--color-secondary)] border border-transparent'
                          }`}
                        >
                          <div>
                            <p className="text-sm font-medium text-[var(--color-textPrimary)]">
                              {usage.id}
                            </p>
                            <p className="text-xs text-[var(--color-textSecondary)]">
                              {usage.type}:{usage.variant || 'default'}
                              {usage.description && ` · ${usage.description}`}
                            </p>
                          </div>
                          <span className="text-xs px-2 py-0.5 rounded bg-[var(--color-secondary)] text-[var(--color-textSecondary)]">
                            {usage.page}
                          </span>
                        </button>
                      );
                    })
                  )}
                </div>
              </>
            )}
          </div>

          {/* Panneau droit - Édition */}
          <div className="w-full md:w-2/3 p-4 overflow-y-auto flex-1">
            {selectedUsage ? (
              <>
                <div className="mb-4">
                  <h3 className="text-lg font-semibold text-[var(--color-textPrimary)]">
                    {selectedUsage.id}
                  </h3>
                  <p className="text-sm text-[var(--color-textSecondary)]">
                    {selectedUsage.type}:{selectedUsage.variant || 'default'}
                    {selectedUsage.description && ` · ${selectedUsage.description}`}
                  </p>
                  <p className="text-xs text-[var(--color-textSecondary)]">
                    Page: {selectedUsage.page} · {selectedUsage.isChildren ? 'Enfant' : 'Parent'}
                    {selectedUsage.parentLevel > 0 && ` · Niveau ${selectedUsage.parentLevel}`}
                  </p>
                </div>

                {/* Propriétés CSS */}
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Couleur de fond</label>
                    <input
                      type="color"
                      value={styleProps.backgroundColor as string || '#FFFFFF'}
                      onChange={(e) => handlePropChange('backgroundColor', e.target.value)}
                      className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Couleur du texte</label>
                    <input
                      type="color"
                      value={styleProps.color as string || '#1E3A5F'}
                      onChange={(e) => handlePropChange('color', e.target.value)}
                      className="w-full h-10 rounded border cursor-pointer border-[var(--color-borderColor)]"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Arrondi (px)</label>
                    <input
                      type="number"
                      value={styleProps.borderRadius as number || 12}
                      onChange={(e) => handlePropChange('borderRadius', parseInt(e.target.value) || 0)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                      min={0} max={50}
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Padding (px)</label>
                    <input
                      type="text"
                      value={styleProps.padding as string || '16px 20px'}
                      onChange={(e) => handlePropChange('padding', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                      placeholder="16px 20px"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Bordure</label>
                    <input
                      type="text"
                      value={styleProps.border as string || '1px solid #E2E6EA'}
                      onChange={(e) => handlePropChange('border', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                      placeholder="1px solid #E2E6EA"
                    />
                  </div>
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-medium text-[var(--color-textSecondary)]">Ombre (box-shadow)</label>
                    <input
                      type="text"
                      value={styleProps.boxShadow as string || '0 2px 8px rgba(0,0,0,0.06)'}
                      onChange={(e) => handlePropChange('boxShadow', e.target.value)}
                      className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]"
                      placeholder="0 2px 8px rgba(0,0,0,0.06)"
                    />
                  </div>
                </div>

                {/* Aperçu */}
                <div className="mt-4">
                  <button
                    onClick={() => setPreviewVisible(!previewVisible)}
                    className="flex items-center gap-2 text-sm text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]"
                  >
                    <Eye size={16} />
                    {previewVisible ? 'Cacher' : 'Afficher'} l'aperçu
                  </button>
                  {previewVisible && (
                    <MotionBox
                      as="div"
                      type={selectedUsage.type}
                      variant={selectedUsage.variant || 'default'}
                      className="mt-2 p-4 rounded-xl border border-[var(--color-borderColor)]"
                      style={{ proprietes: styleProps }}
                    >
                      <p className="font-medium text-[var(--color-textPrimary)]">Aperçu du composant</p>
                      <p className="text-sm text-[var(--color-textSecondary)]">
                        {selectedUsage.id} · {selectedUsage.type}:{selectedUsage.variant || 'default'}
                      </p>
                      <button className="mt-2 px-4 py-2 rounded-lg bg-[var(--color-primary)] text-white text-sm">
                        Bouton test
                      </button>
                    </MotionBox>
                  )}
                </div>

                {/* Actions */}
                <div className="flex justify-end gap-3 mt-4 pt-4 border-t border-[var(--color-borderColor)]">
                  <button
                    onClick={() => setSelectedUsage(null)}
                    className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)]"
                  >
                    Annuler
                  </button>
                  <button
                    onClick={handleSave}
                    disabled={saving}
                    className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
                      saving
                        ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                        : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
                    }`}
                  >
                    {saving ? 'En cours...' : <><Save size={18} /> Enregistrer</>}
                  </button>
                </div>
              </>
            ) : (
              <div className="flex flex-col items-center justify-center h-full text-[var(--color-textSecondary)]">
                <Edit size={48} className="opacity-30 mb-4" />
                <p className="text-lg font-medium">Sélectionnez un composant</p>
                <p className="text-sm">Choisissez une page puis un composant dans la liste de gauche.</p>
              </div>
            )}
          </div>
        </div>
      </MotionBox>
    </MotionBox>
  );
};

export default MotionBoxUsageEditor;
