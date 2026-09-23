// ============================================================
// ANIMATION EDITOR PAGE — Éditeur d'animations
// Version V5.0 — Utilise le composant AnimationPreview
// ============================================================

import React, { useState, useMemo, useEffect } from 'react';
import { MotionBox } from '../components/MotionBox';
import { ComponentTileList } from '../components/ComponentTileList';
import { AnimationPreview } from '../components/AnimationPreview';
import { useTheme } from '../contexts/ThemeContext';
import { useToast } from '../hooks/useToast';
import { COMPONENT_REGISTRY } from '../registres/componentRegistry';
import {
  ANIMATION_PRESET_LIST,
  animationsInitiales,
  animationsSortie,
  animationsInteraction,
} from '../registres/animationPresets';
import { LOOP_ANIMATIONS, LOOP_ANIMATION_LIST } from '../registres/animationsLoop';
import { getMotionBoxUsagesByPage, getAllPages } from '../registres/motionBoxUsages';
import {
  getComponentLabel,
  getPageLabel,
  getAnimationLabel,
} from '../utils/displayLabels';
import { Play, RefreshCw, Save, Film, Info, Repeat, Database, CheckCircle, AlertCircle } from 'lucide-react';
import { Animation } from '../types/theme-types';

type TabId = 'entree' | 'sortie' | 'interaction' | 'loop';

function getAnimationDurationMs(preset: any, fallback = 400): number {
  if (!preset || !preset.transition) return fallback;
  const t = preset.transition;
  if (typeof t.duration === 'number') return t.duration * 1000;
  if (t.type === 'spring') return 500;
  return fallback;
}

function categorizeAnimation(id: string): string {
  if (id.startsWith('stagger')) return 'Cascade';
  if (id.startsWith('inView')) return 'À l\'apparition';
  if (id.includes('Hover') || id.includes('hover')) return 'Au survol';
  if (id.includes('Tap') || id.includes('tap')) return 'Au clic';
  if (id.includes('Focus') || id.includes('focus')) return 'Au focus';
  if (id.includes('Drag') || id.includes('drag')) return 'Glissement';
  if (id.startsWith('fadeIn') || id.startsWith('slideIn') || id.startsWith('zoomIn')) return 'Apparition';
  if (id.startsWith('fadeOut') || id.startsWith('slideOut') || id.startsWith('zoomOut')) return 'Disparition';
  return 'Autres';
}

function getRefName(ref: any): string | null {
  if (!ref) return null;
  if (typeof ref === 'string') return ref;
  if (typeof ref === 'object' && ref.nom) return ref.nom;
  return null;
}

export const AnimationEditorPage: React.FC = () => {
  const { theme, updateComponentAnimation, refreshTheme } = useTheme();
  const { success, error: toastError, info } = useToast();

  const [activeTab, setActiveTab] = useState<TabId>('entree');
  const [selectedComponent, setSelectedComponent] = useState('button:primary');
  const [selectedPage, setSelectedPage] = useState<string>('Toutes');
  const [selectedEntree, setSelectedEntree] = useState('fadeIn');
  const [selectedSortie, setSelectedSortie] = useState('fadeOut');
  const [selectedInteraction, setSelectedInteraction] = useState('liftHover');
  const [selectedLoop, setSelectedLoop] = useState('none');
  const [saving, setSaving] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [pageSearch, setPageSearch] = useState('');
  const [entreeTrigger, setEntreeTrigger] = useState(0);

  // ⭐ Animations sauvegardées en BDD
  const savedAnimation = useMemo<Animation | undefined>(() => {
    if (!theme?.composants) return undefined;
    const found = theme.composants.find((c) => c.typeComponent === selectedComponent);
    return found?.animation;
  }, [theme?.composants, selectedComponent]);

  const savedAnimationNames = useMemo(() => {
    if (!savedAnimation) return null;
    const entree = getRefName(savedAnimation.animationInitiale);
    const sortie = getRefName(savedAnimation.animationSortie);
    const loop = getRefName(savedAnimation.animationLoop);
    const hover = savedAnimation.declenchees?.find((d) => d.trigger === 'hover');
    const interaction = hover ? getRefName(hover.animation) : null;
    return { entree, sortie, loop, interaction };
  }, [savedAnimation]);

  const componentsWithAnimations = useMemo<Set<string>>(() => {
    if (!theme?.composants) return new Set();
    return new Set(
      theme.composants
        .filter((c) => c.animation && (
          c.animation.animationInitiale ||
          c.animation.animationSortie ||
          c.animation.animationLoop ||
          (c.animation.declenchees && c.animation.declenchees.length > 0)
        ))
        .map((c) => c.typeComponent)
    );
  }, [theme?.composants]);

  // ⭐ Chargement auto des animations du composant sélectionné
  useEffect(() => {
    if (!savedAnimationNames) return;
    if (savedAnimationNames.entree) setSelectedEntree(savedAnimationNames.entree);
    if (savedAnimationNames.sortie) setSelectedSortie(savedAnimationNames.sortie);
    if (savedAnimationNames.interaction) setSelectedInteraction(savedAnimationNames.interaction);
    if (savedAnimationNames.loop) setSelectedLoop(savedAnimationNames.loop);
    else setSelectedLoop('none');
    setEntreeTrigger((prev) => prev + 1);
  }, [selectedComponent, savedAnimationNames]);

  const allPages = useMemo(() => ['Toutes', ...getAllPages()], []);
  const filteredPages = useMemo(() => {
    if (!pageSearch.trim()) return allPages;
    const q = pageSearch.toLowerCase();
    return allPages.filter(
      (p) => p.toLowerCase().includes(q) || getPageLabel(p).toLowerCase().includes(q)
    );
  }, [allPages, pageSearch]);

  const pageComponents = useMemo(() => {
    if (!selectedPage || selectedPage === 'Toutes') return COMPONENT_REGISTRY;
    const usages = getMotionBoxUsagesByPage(selectedPage);
    if (usages.length > 0) {
      const unique = new Set(
        usages.map((u) => `${u.type}:${u.variant || 'default'}`)
          .filter((key) => COMPONENT_REGISTRY.includes(key))
      );
      return Array.from(unique);
    }
    return COMPONENT_REGISTRY;
  }, [selectedPage]);

  const filteredComponents = useMemo(() => {
    if (!searchTerm.trim()) return pageComponents;
    const q = searchTerm.toLowerCase();
    return pageComponents.filter(
      (c) => c.toLowerCase().includes(q) || getComponentLabel(c).toLowerCase().includes(q)
    );
  }, [pageComponents, searchTerm]);

  useEffect(() => {
    if (filteredComponents.length === 0) return;
    if (!filteredComponents.includes(selectedComponent)) {
      setSelectedComponent(filteredComponents[0]);
    }
  }, [filteredComponents, selectedComponent]);

  const animationsEntree = useMemo(() => ANIMATION_PRESET_LIST.filter((a) => a.category === 'entree'), []);
  const animationsSortieList = useMemo(() => ANIMATION_PRESET_LIST.filter((a) => a.category === 'sortie'), []);
  const animationsInteractionList = useMemo(() => ANIMATION_PRESET_LIST.filter((a) => a.category === 'interaction'), []);
  const animationsLoopList = useMemo(() => LOOP_ANIMATION_LIST, []);

  const entreeDuration = useMemo(() => getAnimationDurationMs(animationsInitiales[selectedEntree]), [selectedEntree]);
  const sortieDuration = useMemo(() => getAnimationDurationMs(animationsSortie[selectedSortie]), [selectedSortie]);
  const loopDuration = useMemo(() => getAnimationDurationMs(LOOP_ANIMATIONS[selectedLoop], 1800), [selectedLoop]);

  const playEntreeAnimation = () => {
    setEntreeTrigger((prev) => prev + 1);
  };

  const playSortieAnimation = () => {
    setEntreeTrigger((prev) => prev + 1);
  };

  const playInteraction = () => {
    info(`Interaction « ${getAnimationLabel(selectedInteraction)} » à tester en survolant / cliquant`);
  };

  const playLoop = () => {
    setEntreeTrigger((prev) => prev + 1);
    info(`Animation continue « ${LOOP_ANIMATIONS[selectedLoop]?.label || selectedLoop} » active`);
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const animation: Animation = {
        animationInitiale: { nom: selectedEntree },
        animationSortie: { nom: selectedSortie },
        declenchees: [{ trigger: 'hover', animation: { nom: selectedInteraction } }],
        ...(selectedLoop !== 'none' ? { animationLoop: { nom: selectedLoop } } : {}),
      };
      await updateComponentAnimation(selectedComponent, animation);
      await refreshTheme();
      success(`Animations de « ${getComponentLabel(selectedComponent)} » sauvegardées ✅`);
    } catch (err: any) {
      toastError(err.message || 'Erreur');
    } finally {
      setSaving(false);
    }
  };

  const resetAll = () => {
    setSelectedEntree('fadeIn');
    setSelectedSortie('fadeOut');
    setSelectedInteraction('liftHover');
    setSelectedLoop('none');
    setEntreeTrigger((prev) => prev + 1);
    success('Animations réinitialisées ✅');
  };

  const copyFromComponent = () => {
    if (!savedAnimation) {
      info('Aucune animation sauvegardée pour ce composant');
      return;
    }
    if (savedAnimationNames) {
      if (savedAnimationNames.entree) setSelectedEntree(savedAnimationNames.entree);
      if (savedAnimationNames.sortie) setSelectedSortie(savedAnimationNames.sortie);
      if (savedAnimationNames.interaction) setSelectedInteraction(savedAnimationNames.interaction);
      if (savedAnimationNames.loop) setSelectedLoop(savedAnimationNames.loop);
      setEntreeTrigger((prev) => prev + 1);
      success('Animations chargées depuis le thème');
    }
  };

  const renderAnimationItem = (anim: any, isSelected: boolean, onSelect: () => void) => {
    const category = categorizeAnimation(anim.id);
    return (
      <button
        key={anim.id}
        onClick={onSelect}
        className={`w-full px-3 py-2 rounded-lg text-sm transition text-left flex flex-col gap-0.5 ${
          isSelected
            ? 'bg-[var(--color-primary)] text-white'
            : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
        }`}
      >
        <span className="font-medium truncate">{getAnimationLabel(anim.id)}</span>
        <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[var(--color-textSecondary)]'}`}>
          {category}
        </span>
      </button>
    );
  };

  return (
    <div className="p-6 max-w-7xl mx-auto min-h-screen bg-[var(--color-background)]">

      {/* En-tête */}
      <div className="flex items-center justify-between mb-6 flex-wrap gap-3">
        <div>
          <h1 className="text-2xl font-bold text-[var(--color-textPrimary)] flex items-center gap-3">
            <Film size={28} className="text-[var(--color-primary)]" />
            Éditeur d'animations
          </h1>
          <p className="text-sm text-[var(--color-textSecondary)]">
            Personnalisez les animations d'entrée, de sortie, d'interaction et en boucle
          </p>
        </div>
        <div className="flex gap-2 flex-wrap">
          <button
            onClick={resetAll}
            className="px-4 py-2 rounded-xl border border-[var(--color-borderColor)] text-[var(--color-textSecondary)] hover:bg-[var(--color-secondary)] transition flex items-center gap-2"
          >
            <RefreshCw size={16} /> Réinitialiser
          </button>
          <button
            onClick={copyFromComponent}
            disabled={!savedAnimation}
            className={`px-4 py-2 rounded-xl border transition flex items-center gap-2 ${
              savedAnimation
                ? 'border-[var(--color-primary)] text-[var(--color-primary)] hover:bg-[var(--color-primary-light)]'
                : 'border-[var(--color-borderColor)] text-[var(--color-textSecondary)] opacity-50 cursor-not-allowed'
            }`}
          >
            <Database size={16} /> Charger depuis BDD
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
        {/* ============================================================ */}
        {/* PANNEAU GAUCHE */}
        {/* ============================================================ */}
        <div className="lg:col-span-1 space-y-4">
          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">Page</h3>
            <input
              type="text"
              value={pageSearch}
              onChange={(e) => setPageSearch(e.target.value)}
              placeholder="Rechercher une page..."
              className="w-full px-3 py-1.5 mb-2 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-xs"
            />
            <select
              value={selectedPage}
              onChange={(e) => setSelectedPage(e.target.value)}
              className="w-full px-3 py-2 rounded-xl border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-sm"
            >
              {filteredPages.map((page) => (
                <option key={page} value={page}>
                  {page === 'Toutes' ? 'Toutes les pages' : getPageLabel(page)}
                </option>
              ))}
            </select>
            <p className="text-xs text-[var(--color-textSecondary)] mt-2">
              {selectedPage !== 'Toutes'
                ? `${getMotionBoxUsagesByPage(selectedPage).length} composants dans cette page`
                : `${COMPONENT_REGISTRY.length} composants disponibles`}
            </p>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">
              Composant sélectionné
            </h3>
            <div className="px-3 py-2 mb-2 rounded-lg bg-[var(--color-primary-light)] text-[var(--color-primary)] text-sm font-medium truncate flex items-center justify-between gap-2">
              <span className="truncate">{getComponentLabel(selectedComponent)}</span>
              {savedAnimation && (
                <span title="Animations sauvegardées en BDD" className="flex-shrink-0">
                  <CheckCircle size={14} />
                </span>
              )}
            </div>

            <input
              type="text"
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Rechercher..."
              className="w-full px-3 py-1.5 mb-2 rounded-lg border border-[var(--color-borderColor)] bg-[var(--color-cardBg)] text-[var(--color-textPrimary)] text-xs"
            />

            <ComponentTileList
              components={filteredComponents}
              selected={selectedComponent}
              onSelect={setSelectedComponent}
              maxHeight="400px"
            />

            <p className="text-xs text-[var(--color-textSecondary)] mt-2">
              {filteredComponents.length} composant{filteredComponents.length > 1 ? 's' : ''}
              {componentsWithAnimations.size > 0 && (
                <span className="ml-1 text-[var(--color-primary)]">
                  · {componentsWithAnimations.size} personnalisé{componentsWithAnimations.size > 1 ? 's' : ''}
                </span>
              )}
            </p>
          </MotionBox>
        </div>

        {/* ============================================================ */}
        {/* PANNEAU CENTRAL */}
        {/* ============================================================ */}
        <div className="lg:col-span-2 space-y-4">
          {savedAnimation && savedAnimationNames && (
            <div className="p-3 rounded-xl bg-[var(--color-success)]/10 border border-[var(--color-success)]/30 flex gap-2">
              <Database size={16} className="text-[var(--color-success)] flex-shrink-0 mt-0.5" />
              <div className="text-xs text-[var(--color-textPrimary)]">
                <b>Animations chargées depuis la base de données</b>
                <div className="mt-1 flex flex-wrap gap-2">
                  {savedAnimationNames.entree && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-primary)]/10 text-[var(--color-primary)]">
                      Entrée : {getAnimationLabel(savedAnimationNames.entree)}
                    </span>
                  )}
                  {savedAnimationNames.sortie && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-danger)]/10 text-[var(--color-danger)]">
                      Sortie : {getAnimationLabel(savedAnimationNames.sortie)}
                    </span>
                  )}
                  {savedAnimationNames.interaction && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-info)]/10 text-[var(--color-info)]">
                      Interaction : {getAnimationLabel(savedAnimationNames.interaction)}
                    </span>
                  )}
                  {savedAnimationNames.loop && (
                    <span className="px-2 py-0.5 rounded-full bg-[var(--color-accent)]/10 text-[var(--color-accent)]">
                      🔁 Boucle : {LOOP_ANIMATIONS[savedAnimationNames.loop]?.label || savedAnimationNames.loop}
                    </span>
                  )}
                </div>
              </div>
            </div>
          )}

          <div className="flex gap-1 p-1 rounded-lg bg-[var(--color-secondary)] flex-wrap">
            {[
              { id: 'entree', label: 'Entrée', icon: '▶️' },
              { id: 'sortie', label: 'Sortie', icon: '⏹️' },
              { id: 'interaction', label: 'Interaction', icon: '👆' },
              { id: 'loop', label: 'En continu', icon: '🔁' },
            ].map((tab) => (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as TabId)}
                className={`flex-1 min-w-[100px] px-3 py-2 rounded-lg text-sm font-medium transition flex items-center justify-center gap-2 ${
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

          <MotionBox type="card" variant="default" className="p-4">
            <div
              className="grid grid-cols-2 sm:grid-cols-3 gap-2"
              style={{ maxHeight: '300px', overflowY: 'auto', paddingRight: '4px' }}
            >
              {activeTab === 'entree' &&
                animationsEntree.map((anim) =>
                  renderAnimationItem(anim, selectedEntree === anim.id, () => setSelectedEntree(anim.id))
                )}
              {activeTab === 'sortie' &&
                animationsSortieList.map((anim) =>
                  renderAnimationItem(anim, selectedSortie === anim.id, () => setSelectedSortie(anim.id))
                )}
              {activeTab === 'interaction' &&
                animationsInteractionList.map((anim) =>
                  renderAnimationItem(anim, selectedInteraction === anim.id, () => setSelectedInteraction(anim.id))
                )}
              {activeTab === 'loop' && (
                <>
                  <button
                    onClick={() => setSelectedLoop('none')}
                    className={`w-full px-3 py-2 rounded-lg text-sm transition text-left flex flex-col gap-0.5 ${
                      selectedLoop === 'none'
                        ? 'bg-[var(--color-primary)] text-white'
                        : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                    }`}
                  >
                    <span className="font-medium truncate">Aucune</span>
                    <span className={`text-[10px] ${selectedLoop === 'none' ? 'text-white/70' : 'text-[var(--color-textSecondary)]'}`}>
                      Désactiver la boucle
                    </span>
                  </button>
                  {animationsLoopList.map((anim) => {
                    const isSelected = selectedLoop === anim.id;
                    return (
                      <button
                        key={anim.id}
                        onClick={() => setSelectedLoop(anim.id)}
                        className={`w-full px-3 py-2 rounded-lg text-sm transition text-left flex flex-col gap-0.5 ${
                          isSelected
                            ? 'bg-[var(--color-primary)] text-white'
                            : 'hover:bg-[var(--color-secondary)] text-[var(--color-textPrimary)]'
                        }`}
                      >
                        <span className="font-medium truncate flex items-center gap-1">
                          🔁 {anim.label}
                        </span>
                        <span className={`text-[10px] ${isSelected ? 'text-white/70' : 'text-[var(--color-textSecondary)]'}`}>
                          {anim.description}
                        </span>
                      </button>
                    );
                  })}
                </>
              )}
            </div>

            <div className="mt-3 pt-3 border-t border-[var(--color-borderColor)] text-xs text-[var(--color-textSecondary)] flex justify-between">
              <span>
                {activeTab === 'entree' && `${animationsEntree.length} animations d'entrée`}
                {activeTab === 'sortie' && `${animationsSortieList.length} animations de sortie`}
                {activeTab === 'interaction' && `${animationsInteractionList.length} animations d'interaction`}
                {activeTab === 'loop' && `${animationsLoopList.length} animations en boucle`}
              </span>
              <span>Scroll pour voir plus ↓</span>
            </div>
          </MotionBox>

          <div className="flex flex-wrap gap-2">
            {activeTab !== 'loop' && (
              <>
                <button
                  onClick={playEntreeAnimation}
                  className="px-4 py-2 rounded-xl bg-[var(--color-success)] text-white flex items-center gap-2 hover:opacity-90 transition"
                >
                  <Play size={16} /> Tester l'entrée ({entreeDuration}ms)
                </button>
                <button
                  onClick={playSortieAnimation}
                  className="px-4 py-2 rounded-xl bg-[var(--color-danger)] text-white flex items-center gap-2 hover:opacity-90 transition"
                >
                  <Play size={16} /> Tester la sortie ({sortieDuration}ms)
                </button>
                <button
                  onClick={playInteraction}
                  className="px-4 py-2 rounded-xl bg-[var(--color-primary)] text-white flex items-center gap-2 hover:opacity-90 transition"
                >
                  <Play size={16} /> Tester l'interaction
                </button>
              </>
            )}
            {activeTab === 'loop' && (
              <button
                onClick={playLoop}
                disabled={selectedLoop === 'none'}
                className={`px-4 py-2 rounded-xl text-white flex items-center gap-2 transition ${
                  selectedLoop === 'none'
                    ? 'bg-[var(--color-borderColor)] cursor-not-allowed opacity-60'
                    : 'bg-[var(--color-primary)] hover:opacity-90'
                }`}
              >
                <Repeat size={16} /> Tester la boucle
                {selectedLoop !== 'none' && ` (${loopDuration}ms)`}
              </button>
            )}
          </div>

          <div className="p-3 rounded-xl bg-[var(--color-primary-light)]/30 border border-[var(--color-primary)]/20 flex gap-2">
            <Info size={16} className="text-[var(--color-primary)] flex-shrink-0 mt-0.5" />
            <p className="text-xs text-[var(--color-textPrimary)]">
              {activeTab === 'interaction' && (
                <>
                  <b>Interactions</b> : ces animations (au survol, au clic, à l'apparition) ne se jouent qu'avec une action. Survolez ou cliquez sur l'aperçu pour les tester.
                </>
              )}
              {activeTab === 'loop' && (
                <>
                  <b>Animations en boucle</b> : elles se répètent en continu tant que le composant est affiché. Idéal pour attirer l'attention (bouton "Acheter", alerte, badge...).
                </>
              )}
              {activeTab !== 'interaction' && activeTab !== 'loop' && (
                <>
                  Ces animations se jouent <b>automatiquement</b> au montage ou au démontage du composant.
                </>
              )}
            </p>
          </div>
        </div>

        {/* ============================================================ */}
        {/* PANNEAU DROIT */}
        {/* ============================================================ */}
        <div className="lg:col-span-1 space-y-4">
          <MotionBox type="card" variant="elevated" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-3 text-sm">Aperçu</h3>
            <div
              className="bg-[var(--color-secondary)] rounded-xl relative overflow-hidden"
              style={{ minHeight: 320, height: 320 }}
            >
              <AnimationPreview
                entree={selectedEntree}
                sortie={selectedSortie}
                interaction={selectedInteraction}
                loop={selectedLoop}
                trigger={entreeTrigger}
                title={getComponentLabel(selectedComponent)}
                scale={0.75}
              >
                <div className="text-2xl mb-2">🎬</div>
                <p className="font-medium text-sm">{getComponentLabel(selectedComponent)}</p>
                <p className="text-[10px] text-[var(--color-textSecondary)] mt-1">
                  Entrée : {getAnimationLabel(selectedEntree)}
                </p>
                <p className="text-[10px] text-[var(--color-textSecondary)]">
                  Sortie : {getAnimationLabel(selectedSortie)}
                </p>
                <p className="text-[10px] text-[var(--color-textSecondary)]">
                  Interaction : {getAnimationLabel(selectedInteraction)}
                </p>
                {selectedLoop !== 'none' && (
                  <p className="text-[10px] text-[var(--color-primary)] mt-1">
                    🔁 {LOOP_ANIMATIONS[selectedLoop]?.label || selectedLoop}
                  </p>
                )}
              </AnimationPreview>
            </div>
            <div className="mt-3 text-xs text-[var(--color-textSecondary)] text-center">
              ✓ {getComponentLabel(selectedComponent)}
            </div>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2 text-sm">Résumé</h3>
            <div className="space-y-2 text-xs">
              <div>
                <span className="text-[var(--color-textSecondary)] block">Composant</span>
                <span className="font-medium text-[var(--color-textPrimary)]">{getComponentLabel(selectedComponent)}</span>
              </div>
              <div>
                <span className="text-[var(--color-textSecondary)] block">Entrée</span>
                <span className="font-medium text-[var(--color-success)]">{getAnimationLabel(selectedEntree)}</span>
              </div>
              <div>
                <span className="text-[var(--color-textSecondary)] block">Sortie</span>
                <span className="font-medium text-[var(--color-danger)]">{getAnimationLabel(selectedSortie)}</span>
              </div>
              <div>
                <span className="text-[var(--color-textSecondary)] block">Interaction</span>
                <span className="font-medium text-[var(--color-primary)]">{getAnimationLabel(selectedInteraction)}</span>
              </div>
              {selectedLoop !== 'none' && (
                <div className="pt-2 border-t border-[var(--color-borderColor)]">
                  <span className="text-[var(--color-textSecondary)] block">🔁 En continu</span>
                  <span className="font-medium text-[var(--color-accent)]">
                    {LOOP_ANIMATIONS[selectedLoop]?.label || selectedLoop}
                  </span>
                </div>
              )}
            </div>
          </MotionBox>

          <MotionBox type="card" variant="default" className="p-4">
            <h3 className="font-semibold text-[var(--color-textPrimary)] mb-2 text-sm flex items-center gap-2">
              <Database size={14} /> En base de données
            </h3>
            {savedAnimation && savedAnimationNames ? (
              <div className="space-y-1 text-xs">
                {savedAnimationNames.entree && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-textSecondary)]">Entrée :</span>
                    <span className="font-medium text-[var(--color-textPrimary)] truncate ml-2">
                      {savedAnimationNames.entree}
                    </span>
                  </div>
                )}
                {savedAnimationNames.sortie && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-textSecondary)]">Sortie :</span>
                    <span className="font-medium text-[var(--color-textPrimary)] truncate ml-2">
                      {savedAnimationNames.sortie}
                    </span>
                  </div>
                )}
                {savedAnimationNames.interaction && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-textSecondary)]">Interaction :</span>
                    <span className="font-medium text-[var(--color-textPrimary)] truncate ml-2">
                      {savedAnimationNames.interaction}
                    </span>
                  </div>
                )}
                {savedAnimationNames.loop && (
                  <div className="flex justify-between">
                    <span className="text-[var(--color-textSecondary)]">Boucle :</span>
                    <span className="font-medium text-[var(--color-textPrimary)] truncate ml-2">
                      {savedAnimationNames.loop}
                    </span>
                  </div>
                )}
                {!savedAnimationNames.entree &&
                  !savedAnimationNames.sortie &&
                  !savedAnimationNames.interaction &&
                  !savedAnimationNames.loop && (
                    <div className="flex items-center gap-2 text-[var(--color-warning)]">
                      <AlertCircle size={14} />
                      <span>Animation vide</span>
                    </div>
                  )}
              </div>
            ) : (
              <div className="flex items-center gap-2 text-xs text-[var(--color-textSecondary)]">
                <AlertCircle size={14} />
                <span>Aucune animation sauvegardée</span>
              </div>
            )}
          </MotionBox>
        </div>
      </div>
    </div>
  );
};

export default AnimationEditorPage;
