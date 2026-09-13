// ============================================================
// ANIMATION EDITOR PAGE — Éditeur d'animations avec MotionBoxUsage
// Version V3 — Compatible React 16.14
// ============================================================

import React, { useState, useEffect, useCallback, useRef } from 'react';
import { AnimatePresence } from 'framer-motion';
import { MotionBox } from '../../components/ui/MotionBox';
import { useTheme } from '../../components/theme/ThemeContext';
import { useToast } from '../../hooks/useToast';
import { COMPONENT_REGISTRY } from '../../registres/componentRegistry';
import { ANIMATION_PRESET_LIST, animationsInitiales, animationsSortie, animationsInteraction } from '../../registres/animationPresets';
import { getMotionBoxUsagesByPage, getAllPages } from '../../registres/motionBoxUsages';
import { useHistory } from 'react-router-dom';
import { 
  Play, ArrowRight, RefreshCw, Save, Film, Info
} from 'lucide-react';
import { Animation } from '../../types/theme';

type TabId = 'entree' | 'sortie' | 'interaction';

export const AnimationEditorPage: React.FC = () => {
  const { theme, updateComponentAnimation, refreshTheme, loading } = useTheme();
  const { success, error: toastError } = useToast();
  const history = useHistory();

  // États
  const [activeTab, setActiveTab] = useState<TabId>('entree');
  const [selectedComponent, setSelectedComponent] = useState('button:primary');
  const [selectedPage, setSelectedPage] = useState<string>('');
  const [selectedEntree, setSelectedEntree] = useState('fadeIn');
  const [selectedSortie, setSelectedSortie] = useState('fadeOut');
  const [selectedInteraction, setSelectedInteraction] = useState('liftHover');
  const [saving, setSaving] = useState(false);
  const [showPreview, setShowPreview] = useState(true);
  
  // États pour forcer le re-render des animations
  const [entreeTrigger, setEntreeTrigger] = useState(0);
  const [sortieTrigger, setSortieTrigger] = useState(0);
  const [showComponent, setShowComponent] = useState(true);
  
  // Références
  const isExitingRef = useRef(false);
  const containerRef = useRef<HTMLDivElement>(null);

  // Pages disponibles
  const allPages = ['Toutes', ...getAllPages()];

  // Obtenir les composants d'une page
  const getPageComponents = () => {
    if (!selectedPage || selectedPage === 'Toutes') {
      return COMPONENT_REGISTRY;
    }
    const usages = getMotionBoxUsagesByPage(selectedPage);
    return usages.length > 0 ? usages.map(u => `${u.type}:${u.variant || 'default'}`) : COMPONENT_REGISTRY;
  };

  const pageComponents = getPageComponents();

  // Grouper les animations par catégorie
  const animationsEntree = ANIMATION_PRESET_LIST.filter(a => a.category === 'entree');
  const animationsSortieList = ANIMATION_PRESET_LIST.filter(a => a.category === 'sortie');
  const animationsInteractionList = ANIMATION_PRESET_LIST.filter(a => a.category === 'interaction');

  // ✅ Construire les props d'animation pour le MotionBox
  const getAnimationProps = () => {
    const entreePreset = animationsInitiales[selectedEntree];
    const sortiePreset = animationsSortie[selectedSortie];
    const interactionPreset = animationsInteraction[selectedInteraction];

    const props: any = {};

    if (entreePreset) {
      if (entreePreset.initial) props.initial = entreePreset.initial;
      if (entreePreset.animate) props.animate = entreePreset.animate;
      if (entreePreset.transition) props.transition = entreePreset.transition;
    }

    if (sortiePreset && sortiePreset.animate) {
      props.exit = sortiePreset.animate;
      if (sortiePreset.transition) props.exitTransition = sortiePreset.transition;
    }

    if (interactionPreset) {
      if (interactionPreset.whileHover) props.whileHover = interactionPreset.whileHover;
      if (interactionPreset.whileTap) props.whileTap = interactionPreset.whileTap;
      if (interactionPreset.whileFocus) props.whileFocus = interactionPreset.whileFocus;
      if (interactionPreset.whileInView) props.whileInView = interactionPreset.whileInView;
      if (interactionPreset.drag) props.drag = interactionPreset.drag;
      if (interactionPreset.dragElastic !== undefined) props.dragElastic = interactionPreset.dragElastic;
      if (interactionPreset.transition) props.transition = interactionPreset.transition;
    }

    return props;
  };

  // ✅ Jouer l'animation d'entrée
  const playEntreeAnimation = () => {
    setShowComponent(false);
    setTimeout(() => {
      setEntreeTrigger(prev => prev + 1);
      setShowComponent(true);
    }, 50);
  };

  // ✅ Jouer l'animation de sortie
  const playSortieAnimation = () => {
    setShowComponent(false);
    setSortieTrigger(prev => prev + 1);
    setTimeout(() => {
      setEntreeTrigger(prev => prev + 1);
      setShowComponent(true);
    }, 500);
  };

  // ✅ Jouer l'interaction
  const playInteraction = () => {
    success(`Interaction "${selectedInteraction}" déclenchée ✅`);
  };

  // ✅ Navigation avec animation de sortie
  const handleNavigate = (path: string) => {
    if (isExitingRef.current) return;
    isExitingRef.current = true;
    
    setShowComponent(false);
    setSortieTrigger(prev => prev + 1);
    
    setTimeout(() => {
      history.push(path);
      isExitingRef.current = false;
      setShowComponent(true);
    }, 500);
  };

  // ✅ Sauvegarde
  const handleSave = async () => {
    setSaving(true);
    try {
      const animation: Animation = {
        animationInitiale: { nom: selectedEntree },
        animationSortie: { nom: selectedSortie },
        declenchees: [{ trigger: 'hover', animation: { nom: selectedInteraction } }],
      };
      await updateComponentAnimation(selectedComponent, animation);
      await refreshTheme();
      success(`Animations de "${selectedComponent}" sauvegardées ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  // ✅ Réinitialisation
  const resetAll = () => {
    setSelectedEntree('fadeIn');
    setSelectedSortie('fadeOut');
    setSelectedInteraction('liftHover');
    setEntreeTrigger(0);
    setSortieTrigger(0);
    setShowComponent(true);
    success('Animations réinitialisées ✅');
  };

  // Clé pour forcer le re-render
  const previewKey = `${selectedComponent}-${entreeTrigger}-${sortieTrigger}`;

  // Props d'animation
  const animationProps = getAnimationProps();


  // Composant d'aperçu
  const PreviewComponent = () => {
    return (
      <AnimatePresence>
        {showComponent && (
          <MotionBox
            key={previewKey}
            type={selectedComponent.split(':')[0] || 'box'}
            variant={selectedComponent.split(':')[1] || 'default'}
            usageId="animation-editor-preview"
            page="AnimationEditorPage"
            initial={animationProps.initial}
            animate={animationProps.animate}
            exit={animationProps.exit}
            transition={animationProps.transition || { duration: 0.3 }}
            whileHover={animationProps.whileHover}
            whileTap={animationProps.whileTap}
            whileFocus={animationProps.whileFocus}
            drag={animationProps.drag}
            dragElastic={animationProps.dragElastic}
            className="p-6 rounded-xl shadow-lg bg-[var(--color-cardBg)] border border-[var(--color-borderColor)] text-center max-w-full"
            style={{
              backgroundColor: 'var(--color-cardBg)',
              color: 'var(--color-textPrimary)',
              borderRadius: '12px',
              padding: '24px',
              cursor: 'pointer',
            }}
          >
            <div className="text-2xl mb-2">🎬</div>
            <p className="font-medium">{selectedComponent}</p>
            <p className="text-xs text-[var(--color-textSecondary)] mt-1">
              Entrée: {selectedEntree} | Sortie: {selectedSortie}
            </p>
            <p className="text-xs text-[var(--color-textSecondary)]">
              Interaction: {selectedInteraction}
            </p>
            <div className="mt-3 text-xs text-[var(--color-textSecondary)] opacity-60">
              {selectedInteraction.includes('hover') && '👆 Survoler pour tester'}
              {selectedInteraction.includes('tap') && '👆 Cliquer pour tester'}
              {selectedInteraction.includes('drag') && '↔️ Glisser pour tester'}
            </div>
          </MotionBox>
        )}
      </AnimatePresence>
    );
  };


  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[var(--color-background)]">
      {/* En-tête */}
      <div className="flex items-center justify-between mb-6">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
            <Film size={28} className="text-[var(--color-primary)]" />
            Éditeur d'animations
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Personnalisez les animations d'entrée, de sortie et les interactions
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <RefreshCw size={16} /> Réinitialiser
          </button>
          <button
            onClick={handleSave}
            disabled={saving}
            className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 ${
              saving ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60' : 'bg-[var(--color-primary)] hover:bg-[var(--color-primary-dark)]'
            }`}
          >
            {saving ? 'En cours...' : <><Save size={16} /> Enregistrer</>}
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
        {/* Panneau gauche - Sélection */}
        <div className="lg:col-span-1 space-y-4">
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">Composant</h3>
            <select
              value={selectedComponent}
              onChange={(e) => setSelectedComponent(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
            >
              {pageComponents.map((type) => (
                <option key={type} value={type}>{type}</option>
              ))}
            </select>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">Filtrer par page</h3>
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
            >
              {allPages.map((page) => (
                <option key={page} value={page}>{page}</option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-textSecondary)] mt-2">
              {selectedPage && selectedPage !== 'Toutes'
                ? `${getMotionBoxUsagesByPage(selectedPage).length} composants dans cette page`
                : `${COMPONENT_REGISTRY.length} composants disponibles`}
            </p>
          </MotionBox>

          {selectedPage && selectedPage !== 'Toutes' && (
            <MotionBox type="card" variant="default" className="p-4">
              <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">Navigation</h3>
              <button
                onClick={() => handleNavigate(`/${selectedPage.toLowerCase()}`)}
                className="w-full px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white text-sm hover:bg-[var(--color-primary-dark)] transition flex items-center justify-center gap-2"
              >
                <ArrowRight size={16} />
                Aller à {selectedPage}
                <span className="text-xs opacity-70">(avec sortie)</span>
              </button>
              {!showComponent && (
                <p className="text-xs text-[var(--color-warning)] mt-2 text-center animate-pulse">
                  ⏳ Animation de sortie en cours...
                </p>
              )}
            </MotionBox>
          )}
        </div>

        {/* Panneau central - Sélection des animations */}
        <div className="lg:col-span-2 space-y-4">
          <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-secondary)]">
            {[
              { id: 'entree', label: 'Entrée', icon: '▶️' },
              { id: 'sortie', label: 'Sortie', icon: '⏹️' },
              { id: 'interaction', label: 'Interaction', icon: '👆' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex-1 px-4 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
                  activeTab === tab.id
                    ? 'bg-[var(--color-cardBg)] shadow-sm text-[var(--color-primary)]'
                    : 'text-[var(--color-textSecondary)] hover:text-[var(--color-textPrimary)]'
                }`}
              >
                <span>{tab.icon}</span>
                {tab.label}
              </button>
            ))}
          </div>

          <MotionBox type="card" variant="default" className="p-4 max-h-96 overflow-y-auto">
            {activeTab === 'entree' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {animationsEntree.map((anim) => {
                  const isSelected = selectedEntree === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => setSelectedEntree(anim.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                      }`}
                    >
                      <div className="font-medium">{anim.label}</div>
                      <div className="text-xs opacity-70">{anim.description}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'sortie' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {animationsSortieList.map((anim) => {
                  const isSelected = selectedSortie === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => setSelectedSortie(anim.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                      }`}
                    >
                      <div className="font-medium">{anim.label}</div>
                      <div className="text-xs opacity-70">{anim.description}</div>
                    </button>
                  );
                })}
              </div>
            )}

            {activeTab === 'interaction' && (
              <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
                {animationsInteractionList.map((anim) => {
                  const isSelected = selectedInteraction === anim.id;
                  return (
                    <button
                      key={anim.id}
                      onClick={() => setSelectedInteraction(anim.id)}
                      className={`px-3 py-2 rounded-lg text-sm transition text-left ${
                        isSelected
                          ? 'bg-[var(--color-primary)] text-white'
                          : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                      }`}
                    >
                      <div className="font-medium">{anim.label}</div>
                      <div className="text-xs opacity-70">{anim.description}</div>
                    </button>
                  );
                })}
              </div>
            )}
          </MotionBox>

          <div className="flex flex-wrap gap-2">
            <button
              onClick={playEntreeAnimation}
              className="px-4 py-2 rounded-xl bg-[var(--color-success)] text-white flex items-center gap-2 hover:bg-[var(--color-success-dark)] transition"
            >
              <Play size={16} /> Tester l'entrée
            </button>
            <button
              onClick={playSortieAnimation}
              className="px-4 py-2 rounded-xl bg-[var(--color-danger)] text-white flex items-center gap-2 hover:bg-[var(--color-danger-dark)] transition"
            >
              <Play size={16} /> Tester la sortie
            </button>
            <button
              onClick={playInteraction}
              className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:bg-[var(--color-primary-dark)] transition"
            >
              <Play size={16} /> Tester l'interaction
            </button>
          </div>
        </div>

        {/* Panneau droit - Aperçu */}
        <div className="lg:col-span-1 space-y-4">
          <MotionBox type="card" variant="elevated" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">Aperçu</h3>
            <div className="bg-[var(--color-secondary)] rounded-xl p-6 flex items-center justify-center min-h-[200px] relative overflow-hidden">
              <PreviewComponent />
            </div>
            <div className="mt-3 text-xs text-[var(--color-textSecondary)] text-center">
              {!showComponent ? (
                <span className="text-[var(--color-danger)]">⏳ Animation en cours...</span>
              ) : (
                <span>✓ Prêt — {selectedComponent}</span>
              )}
            </div>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2 text-sm">Résumé</h3>
            <div className="space-y-1 text-sm">
              <div className="flex justify-between">
                <span className="text-[var(--color-textSecondary)]">Composant</span>
                <span className="font-medium text-[var(--color-textPrimary)]">{selectedComponent}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-textSecondary)]">Entrée</span>
                <span className="font-medium text-[var(--color-success)]">{selectedEntree}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-textSecondary)]">Sortie</span>
                <span className="font-medium text-[var(--color-danger)]">{selectedSortie}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-[var(--color-textSecondary)]">Interaction</span>
                <span className="font-medium text-[var(--color-primary)]">{selectedInteraction}</span>
              </div>
              {selectedPage && selectedPage !== 'Toutes' && (
                <div className="flex justify-between pt-2 border-t border-[var(--color-borderColor)]">
                  <span className="text-[var(--color-textSecondary)]">Page</span>
                  <span className="font-medium text-[var(--color-primary)]">{selectedPage}</span>
                </div>
              )}
            </div>
          </MotionBox>
        </div>
      </div>

      <div className="mt-6 p-4 rounded-xl bg-[var(--color-secondary)] text-sm text-[var(--color-textSecondary)] flex flex-wrap gap-4 justify-center">
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--color-success)]" /> Entrée</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--color-danger)]" /> Sortie</span>
        <span className="flex items-center gap-1"><span className="w-3 h-3 rounded-full bg-[var(--color-primary)]" /> Interaction</span>
        <span className="flex items-center gap-1"><Info size={14} /> Les animations de sortie sont jouées avant le changement de page</span>
      </div>
    </div>
  );
};

export default AnimationEditorPage;
