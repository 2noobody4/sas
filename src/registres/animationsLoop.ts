// ============================================================
// ANIMATIONS LOOP — Animations continues (boucle infinie)
// Version V3 — Compatible React 16
// ============================================================

import type { Transition } from 'framer-motion';

export interface LoopAnimationDef {
  id: string;
  label: string;
  description: string;
  animate: Record<string, any>;
  transition: Transition;
}

export const LOOP_ANIMATIONS: Record<string, LoopAnimationDef> = {
  pulse: {
    id: 'pulse',
    label: 'Pulsation',
    description: 'Opacité qui varie doucement',
    animate: { opacity: [1, 0.5, 1] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
  heartBeat: {
    id: 'heartBeat',
    label: 'Battement',
    description: 'Bat comme un cœur',
    animate: { scale: [1, 1.15, 1, 1.1, 1] },
    transition: { duration: 1.4, repeat: Infinity, ease: 'easeInOut' },
  },
  ping: {
    id: 'ping',
    label: 'Ping',
    description: 'Effet halo qui pulse',
    animate: { scale: [1, 1.1, 1], opacity: [1, 0.7, 1] },
    transition: { duration: 1.6, repeat: Infinity, ease: 'easeInOut' },
  },
  glow: {
    id: 'glow',
    label: 'Lueur',
    description: 'Ombre lumineuse pulsée',
    animate: {
      boxShadow: [
        '0 0 0 rgba(30,58,95,0)',
        '0 0 20px rgba(30,58,95,0.6)',
        '0 0 0 rgba(30,58,95,0)',
      ],
    },
    transition: { duration: 2, repeat: Infinity, ease: 'easeInOut' },
  },
  shake: {
    id: 'shake',
    label: 'Secousse',
    description: 'Va-et-vient horizontal rapide',
    animate: { x: [-3, 3, -3] },
    transition: { duration: 0.5, repeat: Infinity, ease: 'easeInOut' },
  },
  bounce: {
    id: 'bounce',
    label: 'Rebond',
    description: 'Monte et descend',
    animate: { y: [-4, 0, -4] },
    transition: { duration: 1, repeat: Infinity, ease: 'easeInOut' },
  },
  float: {
    id: 'float',
    label: 'Flottement',
    description: 'Lévite doucement',
    animate: { y: [-6, 0, -6] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  rotate: {
    id: 'rotate',
    label: 'Rotation',
    description: 'Tourne en continu',
    animate: { rotate: [0, 360] },
    transition: { duration: 2, repeat: Infinity, ease: 'linear' },
  },
  wobble: {
    id: 'wobble',
    label: 'Oscillation',
    description: 'Balance à gauche/droite',
    animate: { rotate: [-5, 5, -5] },
    transition: { duration: 1.5, repeat: Infinity, ease: 'easeInOut' },
  },
  swing: {
    id: 'swing',
    label: 'Balancier',
    description: 'Se balance comme un pendule',
    animate: { rotate: [0, 8, -8, 5, -5, 0] },
    transition: { duration: 1.8, repeat: Infinity, ease: 'easeInOut' },
  },
  blink: {
    id: 'blink',
    label: 'Clignotement',
    description: 'Opacité qui clignote',
    animate: { opacity: [1, 0, 1] },
    transition: { duration: 1, repeat: Infinity, ease: 'linear' },
  },
  breathe: {
    id: 'breathe',
    label: 'Respiration',
    description: 'Grandit et rétrécit doucement',
    animate: { scale: [1, 1.05, 1] },
    transition: { duration: 3, repeat: Infinity, ease: 'easeInOut' },
  },
  rainbow: {
    id: 'rainbow',
    label: 'Arc-en-ciel',
    description: 'Change de couleur',
    animate: {
      backgroundColor: ['#1E3A5F', '#E8A33D', '#2F9E44', '#E03131', '#1E3A5F'],
    },
    transition: { duration: 6, repeat: Infinity, ease: 'linear' },
  },
  attention: {
    id: 'attention',
    label: 'Attention',
    description: 'Combine secousse et pulsation',
    animate: {
      scale: [1, 1.08, 1],
      rotate: [0, -2, 2, -2, 0],
    },
    transition: { duration: 1.2, repeat: Infinity, ease: 'easeInOut' },
  },
};

export const LOOP_ANIMATION_LIST = Object.values(LOOP_ANIMATIONS).map((a) => ({
  id: a.id,
  label: a.label,
  description: a.description,
  category: 'loop' as const,
}));

export function getLoopAnimation(id: string): LoopAnimationDef | undefined {
  return LOOP_ANIMATIONS[id];
}

export default LOOP_ANIMATIONS;
