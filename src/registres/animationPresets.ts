import type { Transition } from 'framer-motion';
import { AnimationParams } from '../types/theme';

type PresetEntree = { initial?: object; animate?: object; transition?: Transition };
type PresetSortie = { initial?: object; animate?: object; transition?: Transition };
type PresetInteraction = {
  whileHover?: object; whileTap?: object; whileFocus?: object; whileInView?: object;
  drag?: any; dragElastic?: any; initial?: object; transition?: Transition;
};

// ============================================================
// ANIMATIONS D'ENTRÉE (35+)
// ============================================================
export const animationsInitiales: Record<string, PresetEntree> = {
  none: {},
  fadeIn: { initial: { opacity: 0 }, animate: { opacity: 1 }, transition: { duration: 0.25 } },
  fadeInUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } },
  fadeInDown: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3 } },
  fadeInLeft: { initial: { opacity: 0, x: -20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } },
  fadeInRight: { initial: { opacity: 0, x: 20 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.3 } },
  slideInUp: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  slideInDown: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  slideInLeft: { initial: { opacity: 0, x: -30 }, animate: { opacity: 1, x: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  slideInRight: { initial: { opacity: 0, x: 30 }, animate: { opacity: 1, x: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  zoomIn: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } },
  zoomInUp: { initial: { opacity: 0, scale: 0.5, y: 30 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.3 } },
  zoomInDown: { initial: { opacity: 0, scale: 0.5, y: -30 }, animate: { opacity: 1, scale: 1, y: 0 }, transition: { duration: 0.3 } },
  zoomInLeft: { initial: { opacity: 0, scale: 0.5, x: -30 }, animate: { opacity: 1, scale: 1, x: 0 }, transition: { duration: 0.3 } },
  zoomInRight: { initial: { opacity: 0, scale: 0.5, x: 30 }, animate: { opacity: 1, scale: 1, x: 0 }, transition: { duration: 0.3 } },
  flipInX: { initial: { opacity: 0, rotateX: -90 }, animate: { opacity: 1, rotateX: 0 }, transition: { duration: 0.4 } },
  flipInY: { initial: { opacity: 0, rotateY: -90 }, animate: { opacity: 1, rotateY: 0 }, transition: { duration: 0.4 } },
  rotateIn: { initial: { opacity: 0, rotate: -180 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.4 } },
  bounceIn: { initial: { opacity: 0, scale: 0.3 }, animate: { opacity: 1, scale: 1 }, transition: { type: 'spring', stiffness: 500, damping: 15 } },
  elasticIn: { initial: { opacity: 0, scale: 0.5 }, animate: { opacity: 1, scale: 1 }, transition: { type: 'spring', stiffness: 400, damping: 10 } },
  popIn: { initial: { opacity: 0, scale: 0.9 }, animate: { opacity: 1, scale: 1 }, transition: { type: 'spring', stiffness: 400, damping: 22 } },
  fadeScaleIn: { initial: { opacity: 0, scale: 0.95 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3 } },

  // Animations STAGGER pour GROUPES, LISTES, GRILLES
  staggerFadeIn: { initial: { opacity: 0, y: 10 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.2, delayChildren: 0.05, staggerChildren: 0.05 } },
  staggerFadeUp: { initial: { opacity: 0, y: 20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delayChildren: 0.06, staggerChildren: 0.06 } },
  staggerFadeDown: { initial: { opacity: 0, y: -20 }, animate: { opacity: 1, y: 0 }, transition: { duration: 0.3, delayChildren: 0.06, staggerChildren: 0.06 } },
  staggerSlideUp: { initial: { opacity: 0, y: 30 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28, delayChildren: 0.06, staggerChildren: 0.06 } },
  staggerSlideDown: { initial: { opacity: 0, y: -30 }, animate: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28, delayChildren: 0.06, staggerChildren: 0.06 } },
  staggerScale: { initial: { opacity: 0, scale: 0.8 }, animate: { opacity: 1, scale: 1 }, transition: { duration: 0.3, delayChildren: 0.05, staggerChildren: 0.05 } },
  staggerFlip: { initial: { opacity: 0, rotateX: -90 }, animate: { opacity: 1, rotateX: 0 }, transition: { duration: 0.4, delayChildren: 0.06, staggerChildren: 0.06 } },
  staggerRotate: { initial: { opacity: 0, rotate: -180 }, animate: { opacity: 1, rotate: 0 }, transition: { duration: 0.4, delayChildren: 0.06, staggerChildren: 0.06 } },
  staggerFadeRight: { initial: { opacity: 0, x: -16 }, animate: { opacity: 1, x: 0 }, transition: { duration: 0.25, delayChildren: 0.04, staggerChildren: 0.04 } },
};

// ============================================================
// ANIMATIONS DE SORTIE (20+)
// ============================================================
export const animationsSortie: Record<string, PresetSortie> = {
  none: {},
  fadeOut: { initial: { opacity: 1 }, animate: { opacity: 0 }, transition: { duration: 0.2 } },
  fadeOutUp: { initial: { opacity: 1, y: 0 }, animate: { opacity: 0, y: -20 }, transition: { duration: 0.2 } },
  fadeOutDown: { initial: { opacity: 1, y: 0 }, animate: { opacity: 0, y: 20 }, transition: { duration: 0.2 } },
  fadeOutLeft: { initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: -20 }, transition: { duration: 0.2 } },
  fadeOutRight: { initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: 20 }, transition: { duration: 0.2 } },
  slideOutUp: { initial: { opacity: 1, y: 0 }, animate: { opacity: 0, y: -30 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  slideOutDown: { initial: { opacity: 1, y: 0 }, animate: { opacity: 0, y: 30 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  slideOutLeft: { initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: -30 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  slideOutRight: { initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: 30 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  zoomOut: { initial: { opacity: 1, scale: 1 }, animate: { opacity: 0, scale: 0.5 }, transition: { duration: 0.25 } },
  flipOutX: { initial: { opacity: 1, rotateX: 0 }, animate: { opacity: 0, rotateX: -90 }, transition: { duration: 0.3 } },
  flipOutY: { initial: { opacity: 1, rotateY: 0 }, animate: { opacity: 0, rotateY: -90 }, transition: { duration: 0.3 } },
  rotateOut: { initial: { opacity: 1, rotate: 0 }, animate: { opacity: 0, rotate: 180 }, transition: { duration: 0.3 } },
  bounceOut: { initial: { opacity: 1, scale: 1 }, animate: { opacity: 0, scale: 0.3 }, transition: { type: 'spring', stiffness: 500, damping: 15 } },
  popOut: { initial: { opacity: 1, scale: 1 }, animate: { opacity: 0, scale: 0.9 }, transition: { duration: 0.2 } },
  scaleOut: { initial: { scale: 1 }, animate: { scale: 0.8 }, transition: { duration: 0.2 } },
  blurOut: { initial: { opacity: 1, filter: 'blur(0px)' }, animate: { opacity: 0, filter: 'blur(4px)' }, transition: { duration: 0.3 } },
  fadeLeftExit: { initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: -20 }, transition: { duration: 0.2 } },
  fadeRightExit: { initial: { opacity: 1, x: 0 }, animate: { opacity: 0, x: 20 }, transition: { duration: 0.2 } },
  slideDownExit: { initial: { opacity: 1, y: 0 }, animate: { opacity: 0, y: 20 }, transition: { duration: 0.2 } },
  slideUpExit: { initial: { opacity: 1, y: 0 }, animate: { opacity: 0, y: -20 }, transition: { duration: 0.2 } },
};

// ============================================================
// INTERACTIONS (40+)
// Inclut des effets spéciaux pour listes, grilles et cartes
// ============================================================
export const animationsInteraction: Record<string, PresetInteraction> = {
  none: {},
  // Tap
  scaleTap: { whileTap: { scale: 0.96 } },
  tapScale: { whileTap: { scale: 0.96 } },
  tapBounce: { whileTap: { scale: 0.92 } },
  // Hover génériques
  liftHover: { whileHover: { y: -3 }, whileTap: { scale: 0.98 } },
  hoverLift: { whileHover: { y: -3 }, whileTap: { scale: 0.98 } },
  hoverElevate: { whileHover: { y: -4, boxShadow: '0 12px 32px rgba(18,24,31,0.14)' }, whileTap: { scale: 0.98 } },
  hoverScale: { whileHover: { scale: 1.05 } },
  hoverPulse: { whileHover: { scale: 1.05 } },
  hoverRotate: { whileHover: { rotate: 3 }, whileTap: { scale: 0.98 } },
  hoverBgGlow: { whileHover: { backgroundColor: 'rgba(0,0,0,0.04)' } },
  hoverBorderGlow: { whileHover: { boxShadow: '0 0 0 2px #1E3A5F' } },
  glowHover: { whileHover: { boxShadow: '0 0 20px rgba(30,58,95,0.25)', y: -2 }, whileTap: { scale: 0.98 } },
  // Focus
  focusRing: { whileFocus: { boxShadow: '0 0 0 3px rgba(30,58,95,0.2)', outline: 'none' } },
  focusScale: { whileFocus: { scale: 1.02 } },
  focusGlow: { whileFocus: { boxShadow: '0 0 0 3px rgba(30,58,95,0.3)', outline: 'none', backgroundColor: 'rgba(30,58,95,0.02)' } },
  // Drag
  dragElastic: { drag: true, dragElastic: 0.2 },
  // InView
  inViewScale: { whileInView: { scale: 1.05 }, transition: { type: 'spring', stiffness: 300 } },
  inViewSlideUp: { initial: { opacity: 0, y: 20 }, whileInView: { opacity: 1, y: 0 }, transition: { type: 'spring', stiffness: 300, damping: 28 } },
  inViewFadeIn: { initial: { opacity: 0 }, whileInView: { opacity: 1 }, transition: { duration: 0.4 } },
  // Effets pour LISTES, GRILLES, CARTES
  listItemHover: { whileHover: { y: -2, boxShadow: '0 4px 12px rgba(0,0,0,0.08)' }, whileTap: { scale: 0.98 } },
  listItemScale: { whileHover: { scale: 1.02 }, whileTap: { scale: 0.98 } },
  gridItemHover: { whileHover: { y: -4, boxShadow: '0 8px 24px rgba(0,0,0,0.12)' }, whileTap: { scale: 0.97 } },
  cardHover: { whileHover: { y: -6, boxShadow: '0 12px 40px rgba(0,0,0,0.15)' }, whileTap: { scale: 0.97 } },
  cardGlow: { whileHover: { boxShadow: '0 0 30px rgba(30,58,95,0.15)', y: -3 }, whileTap: { scale: 0.98 } },
  // Animations à boucle (pour attirer l'attention)
  pulse: { whileHover: { scale: 1.05 }, transition: { type: 'spring', stiffness: 300, repeat: Infinity, repeatType: 'reverse' } },
  shake: { whileHover: { x: [-10, 10, -10, 10, 0] }, transition: { duration: 0.6 } },
  wobble: { whileHover: { rotate: [0, 5, -5, 3, -3, 0] }, transition: { duration: 0.6 } },
  jello: { whileHover: { scale: [1, 1.1, 0.9, 1.05, 1] }, transition: { duration: 0.6 } },
  flash: { whileHover: { opacity: [1, 0.5, 1, 0.5, 1] }, transition: { duration: 0.5 } },
  rubberBand: { whileHover: { scale: [1, 1.15, 0.9, 1.05, 1] }, transition: { duration: 0.5 } },
  swing: { whileHover: { rotate: [0, 15, -15, 5, -5, 0] }, transition: { duration: 0.6 } },
  tada: { whileHover: { scale: [1, 0.9, 1.1, 0.9, 1] }, transition: { duration: 0.6 } },
  bounce: { whileHover: { y: [0, -10, 5, -5, 0] }, transition: { duration: 0.5 } },
  heartBeat: { whileHover: { scale: [1, 1.2, 1, 1.15, 1] }, transition: { duration: 0.6 } },
};

// ============================================================
// HELPERS
// ============================================================
function applyParams(transition: Transition | undefined, params?: AnimationParams): Transition {
  if (!params) return transition || {};
  const t: Record<string, any> = { ...(transition || {}) };
  if (params.repeat !== undefined) t.repeat = params.repeat;
  if (params.repeatType) t.repeatType = params.repeatType;
  if (params.spring) {
    t.type = 'spring';
    if (params.spring.stiffness !== undefined) t.stiffness = params.spring.stiffness;
    if (params.spring.damping !== undefined) t.damping = params.spring.damping;
    if (params.spring.mass !== undefined) t.mass = params.spring.mass;
  } else {
    if (params.duration !== undefined) t.duration = params.duration;
    if (params.ease) t.ease = params.ease;
    if (params.delay !== undefined) t.delay = params.delay;
  }
  if (params.delay !== undefined && !t.delay) t.delay = params.delay;
  return t as Transition;
}

function parseAnimationRef(ref: string | { nom: string } | undefined): { nom: string; params?: AnimationParams } {
  if (!ref) return { nom: '' };
  if (typeof ref === 'string') return { nom: ref };
  return { nom: ref.nom, params: (ref as any).params };
}

export function resolveAnimation(animation?: {
  animationInitiale?: string | { nom: string };
  animationSortie?: string | { nom: string };
  declenchees?: Array<{ trigger: string; animation: string | { nom: string } }>;
}): Record<string, any> {
  const props: Record<string, any> = {};
  const initiale = animation?.animationInitiale ? parseAnimationRef(animation.animationInitiale) : null;
  const sortie = animation?.animationSortie ? parseAnimationRef(animation.animationSortie) : null;

  if (initiale && initiale.nom) {
    const preset = animationsInitiales[initiale.nom];
    if (preset) {
      if (preset.initial) props.initial = preset.initial;
      if (preset.animate) props.animate = preset.animate;
      if (preset.transition) props.transition = applyParams(preset.transition, initiale.params);
    }
  }

  if (sortie && sortie.nom) {
    const preset = animationsSortie[sortie.nom] || animationsInitiales[sortie.nom];
    if (preset && preset.animate) {
      props.exit = { ...(props.exit || {}), ...preset.animate };
      if (preset.transition) props.exitTransition = applyParams(preset.transition, sortie.params);
    }
  }

  animation?.declenchees?.forEach((d) => {
    const parsed = parseAnimationRef(d.animation);
    if (!parsed.nom) return;
    const preset = animationsInteraction[parsed.nom];
    if (!preset) return;
    const mergedParams = { ...(initiale?.params || {}), ...(parsed.params || {}) };
    let transition = preset.transition;
    if (transition || Object.keys(mergedParams).length > 0) {
      transition = applyParams(transition || {}, mergedParams);
    }
    switch (d.trigger) {
      case 'hover':
        if (preset.whileHover) props.whileHover = preset.whileHover;
        if (transition) props.transition = transition;
        break;
      case 'tap':
        if (preset.whileTap) props.whileTap = preset.whileTap;
        break;
      case 'focus':
        if (preset.whileFocus) props.whileFocus = preset.whileFocus;
        break;
      case 'inView':
        if (preset.whileInView) props.whileInView = preset.whileInView;
        if (preset.initial) props.initial = { ...props.initial, ...preset.initial };
        if (transition) props.transition = transition;
        break;
      case 'drag':
        if (preset.drag) props.drag = preset.drag;
        if (preset.dragElastic !== undefined) props.dragElastic = preset.dragElastic;
        break;
      default: break;
    }
  });

  return props;
}

// ============================================================
// LISTE POUR L'ÉDITEUR
// ============================================================
export const ANIMATION_PRESET_LIST = [
  ...Object.keys(animationsInitiales).map((id) => ({ id, label: id, category: 'entree' as const, description: 'Animation d\'entrée' })),
  ...Object.keys(animationsSortie).map((id) => ({ id, label: id, category: 'sortie' as const, description: 'Animation de sortie' })),
  ...Object.keys(animationsInteraction).map((id) => ({ id, label: id, category: 'interaction' as const, description: 'Interaction' })),
];

// ============================================================
// PRESET SPIN POUR L'ÉDITEUR
// ============================================================
export const ANIMATION_PRESETS = {
  spin: {
    id: 'spin',
    label: 'Rotation',
    category: 'interaction' as const,
    css: { animation: 'spin 0.8s linear infinite' },
    framer: { animate: { rotate: 360 }, transition: { duration: 0.8, repeat: Infinity, ease: 'linear' } },
  },
};
