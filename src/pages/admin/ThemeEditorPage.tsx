// ============================================================
// THEME EDITOR PAGE — Structure principale
// Version V3 — Compatible React 16.14
// ============================================================

import React, { useState, useEffect, useCallback } from 'react';
import { useTheme } from '../../components/theme/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { MotionBox } from '../../components/ui/MotionBox';
import { useTranslation } from 'react-i18next';
import { 
  Palette, Type, Layout, Eye, Save, RefreshCw, ArrowLeft,
  Layers, Grid
} from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../../lib/supabaseClient';
import { getManagementModules } from '../../registres/modulesRegistry';
import { useConfig } from '../../contexts/ConfigContext';

// Imports des sous-composants
import { ThemeEditorColors } from './components/ThemeEditorColors';
import { ThemeEditorTypography } from './components/ThemeEditorTypography';
import { ThemeEditorComponents } from './components/ThemeEditorComponents';
import { ThemeEditorPages } from './components/ThemeEditorPages';
import { ThemeEditorClasses } from './components/ThemeEditorClasses';
import { ThemeEditorPreview } from './components/ThemeEditorPreview';

type TabId = 'couleurs' | 'typographie' | 'composants' | 'pages' | 'classes' | 'apercu';

const TABS: { id: TabId; label: string; icon: any }[] = [
  { id: 'couleurs', label: 'Couleurs', icon: Palette },
  { id: 'typographie', label: 'Typographie', icon: Type },
  { id: 'composants', label: 'Composants', icon: Layout },
  { id: 'pages', label: 'Pages', icon: Grid },
  { id: 'classes', label: 'Classes CSS', icon: Layers },
  { id: 'apercu', label: 'Aperçu', icon: Eye },
];

const DEFAULT_COLORS = {
  primary: '#1E3A5F',
  secondary: '#F4F6F8',
  accent: '#E8A33D',
  danger: '#E03131',
  success: '#2F9E44',
  warning: '#F76707',
  info: '#1971C2',
  background: '#F8F9FA',
  cardBg: '#FFFFFF',
  textPrimary: '#1E3A5F',
  textSecondary: '#5B6672',
  borderColor: '#E2E6EA',
};

const DEFAULT_TYPOGRAPHY = {
  policeTitre: "'Sora', sans-serif",
  policeTexte: "'Inter', sans-serif",
  policeChiffres: "'IBM Plex Mono', monospace",
  echelleTaille: {
    xs: 12, sm: 14, base: 16, lg: 20, xl: 24,
    '2xl': 32, '3xl': 40, '4xl': 48,
  },
};

export const ThemeEditorPage: React.FC = () => {
  const { t } = useTranslation();
  const { theme, updateTheme, updateComponentStyle, refreshTheme, loading } = useTheme();
  const config = useConfig();
  const { success, error: toastError } = useToast();
  const [activeTab, setActiveTab] = useState<TabId>('couleurs');
  const [saving, setSaving] = useState(false);
  const [selectedComponent, setSelectedComponent] = useState('button:primary');
  const [selectedPageForEdit, setSelectedPageForEdit] = useState<string>('');
  const [selectedPageComponent, setSelectedPageComponent] = useState<string>('');
  const [pageStyleProps, setPageStyleProps] = useState<Record<string, string | number>>({
    backgroundColor: '#FFFFFF',
    color: '#1E3A5F',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid #E2E6EA',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  });

  const managementModules = getManagementModules();

  const [colors, setColors] = useState(DEFAULT_COLORS);
  const [typography, setTypography] = useState(DEFAULT_TYPOGRAPHY);
  const [componentStyles, setComponentStyles] = useState<Record<string, any>>({});
  const [classStyles, setClassStyles] = useState<Record<string, string>>({});
  const [showPreviewModal, setShowPreviewModal] = useState(false);
  const [styleProps, setStyleProps] = useState<Record<string, string | number>>({
    backgroundColor: '#FFFFFF',
    color: '#1E3A5F',
    borderRadius: 12,
    padding: '16px 20px',
    border: '1px solid #E2E6EA',
    boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
  });

  useEffect(() => {
    if (!theme) return;

    const couleurs = theme.couleurs ?? {};
    if (Object.keys(couleurs).length > 0) {
      setColors(prev => {
        const merged = { ...prev };
        Object.keys(couleurs).forEach(key => {
          if (key in DEFAULT_COLORS) {
            const value = (couleurs as any)[key];
            if (value !== undefined) (merged as any)[key] = value;
          }
        });
        return merged;
      });
    }

    if (theme.typographie && Object.keys(theme.typographie).length > 0) {
      setTypography(prev => {
        const merged = { ...prev };
        const typo = theme.typographie as any;
        if (typo.policeTitre) merged.policeTitre = typo.policeTitre;
        if (typo.policeTexte) merged.policeTexte = typo.policeTexte;
        if (typo.policeChiffres) merged.policeChiffres = typo.policeChiffres;
        if (typo.echelleTaille) {
          merged.echelleTaille = { ...merged.echelleTaille, ...typo.echelleTaille };
        }
        return merged;
      });
    }

    if (theme.composants && theme.composants.length > 0) {
      const newMap: Record<string, any> = {};
      theme.composants.forEach((c: any) => {
        newMap[c.typeComponent] = {
          style: c.style?.proprietes || {},
          animation: c.animation || undefined,
        };
      });
      setComponentStyles(prev => ({ ...prev, ...newMap }));
    }
  }, [theme]);

  const handleColorChange = (key: string, value: string) => {
    setColors(prev => ({ ...prev, [key]: value }));
  };

  const handleTypographyChange = (key: string, value: any) => {
    setTypography(prev => ({ ...prev, [key]: value }));
  };

  const handleStyleChange = (key: string, value: string | number) => {
    setStyleProps(prev => ({ ...prev, [key]: value }));
  };

  const handlePageStyleChange = (key: string, value: string | number) => {
    setPageStyleProps(prev => ({ ...prev, [key]: value }));
  };

  const handleClassChange = (componentId: string, classes: string) => {
    setClassStyles(prev => ({ ...prev, [componentId]: classes }));
  };

  const handlePageComponentSelect = (page: string, compKey: string) => {
    setSelectedPageForEdit(page);
    setSelectedPageComponent(compKey);
    const comp = componentStyles[compKey];
    setPageStyleProps(comp?.style || {
      backgroundColor: '#FFFFFF',
      color: '#1E3A5F',
      borderRadius: 12,
      padding: '16px 20px',
      border: '1px solid #E2E6EA',
      boxShadow: '0 2px 8px rgba(0,0,0,0.06)',
    });
  };

  const handleClearPageComponent = () => {
    setSelectedPageComponent('');
    setSelectedPageForEdit('');
  };

  const handleSave = useCallback(async () => {
    setSaving(true);
    try {
      const updatedTheme = {
        ...theme,
        couleurs: { ...colors },
        typographie: { ...typography },
      };
      await updateTheme(updatedTheme);

      if (Object.keys(styleProps).length > 0) {
        await updateComponentStyle(selectedComponent, { proprietes: styleProps });
      }

      if (Object.keys(classStyles).length > 0) {
        for (const [componentId, classes] of Object.entries(classStyles)) {
          await supabase
            .from('component_styles')
            .upsert({
              type_component: componentId,
              css_class: classes,
            }, { onConflict: 'type_component' });
        }
      }

      await refreshTheme();
      success('Thème sauvegardé et appliqué ✅');
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  }, [theme, colors, typography, styleProps, classStyles, selectedComponent, updateTheme, updateComponentStyle, refreshTheme, success, toastError]);

  const handlePageStyleSave = async () => {
    if (!selectedPageComponent) return;
    setSaving(true);
    try {
      await updateComponentStyle(selectedPageComponent, { proprietes: pageStyleProps });
      await refreshTheme();
      success(`Style de "${selectedPageComponent}" sauvegardé ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  return (
    <MotionBox as="div" type="card" variant="xlarge" className="min-h-screen p-4 sm:p-6 max-w-6xl mx-auto bg-[var(--color-background)]">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-6">
        <div>
          <div className="flex items-center gap-2">
            <Link to="/gestion" className="p-2 rounded-lg flex items-center gap-1" style={{ backgroundColor: 'var(--color-primary)', color: 'white' }}>
              <ArrowLeft size={18} /> Retour
            </Link>
          </div>
          <h1 className="text-2xl font-bold flex items-center gap-2 mt-2 text-[var(--color-textPrimary)]">
            🎨 Éditeur de thème
          </h1>
          <p className="text-sm mt-1 text-[var(--color-textSecondary)]">
            Personnalisez la palette de couleurs, la typographie et les styles des composants.
          </p>
        </div>
        <div className="flex gap-2 w-full sm:w-auto">
          <button onClick={() => refreshTheme()} className="p-2 rounded-lg transition bg-[var(--color-cardBg)] text-[var(--color-textPrimary)]">
            <RefreshCw size={18} />
          </button>
          <MotionBox
            as="button"
            type="button"
            variant="primary"
            onClick={handleSave}
            disabled={saving || loading}
            className="px-4 py-2 rounded-lg flex items-center gap-2 justify-center flex-1 sm:flex-none"
          >
            {saving ? '⏳ Sauvegarde...' : <><Save size={16} /> Enregistrer</>}
          </MotionBox>
        </div>
      </div>

      <div className="flex flex-wrap gap-1 mb-6 p-1 rounded-lg bg-[var(--color-secondary)]">
        {TABS.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-medium transition flex-1 sm:flex-none justify-center ${
              activeTab === tab.id ? 'shadow-sm' : 'hover:bg-opacity-20'
            }`}
            style={{
              backgroundColor: activeTab === tab.id ? 'var(--color-cardBg)' : 'transparent',
              color: activeTab === tab.id ? 'var(--color-primary)' : 'var(--color-textSecondary)',
              boxShadow: activeTab === tab.id ? '0 1px 3px rgba(0,0,0,0.1)' : 'none',
            }}
          >
            <tab.icon size={16} /> <span className="hidden sm:inline">{tab.label}</span>
          </button>
        ))}
      </div>

      <div className="mt-4">
        {activeTab === 'couleurs' && <ThemeEditorColors colors={colors} onColorChange={handleColorChange} onReset={() => setColors(DEFAULT_COLORS)} />}
        {activeTab === 'typographie' && <ThemeEditorTypography typography={typography} onTypographyChange={handleTypographyChange} onReset={() => setTypography(DEFAULT_TYPOGRAPHY)} />}
        {activeTab === 'composants' && (
          <ThemeEditorComponents
            selectedComponent={selectedComponent}
            componentStyles={componentStyles}
            styleProps={styleProps}
            onComponentSelect={setSelectedComponent}
            onStyleChange={handleStyleChange}
            onSave={handleSave}
            saving={saving}
          />
        )}
        {activeTab === 'pages' && (
          <ThemeEditorPages
            selectedPageForEdit={selectedPageForEdit}
            selectedPageComponent={selectedPageComponent}
            pageStyleProps={pageStyleProps}
            componentStyles={componentStyles}
            onPageSelect={setSelectedPageForEdit}
            onComponentSelect={handlePageComponentSelect}
            onStyleChange={handlePageStyleChange}
            onSave={handlePageStyleSave}
            onClear={handleClearPageComponent}
            saving={saving}
          />
        )}
        {activeTab === 'classes' && <ThemeEditorClasses classStyles={classStyles} managementModules={managementModules} onClassChange={handleClassChange} />}
        {activeTab === 'apercu' && <ThemeEditorPreview colors={colors} selectedComponent={selectedComponent} styleProps={styleProps} />}
      </div>
    </MotionBox>
  );
};

export default ThemeEditorPage;
