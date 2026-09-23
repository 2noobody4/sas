// ============================================================
// ANIMATION PREVIEW — Aperçu isolé d'une animation
// Version V1.1 — Utilise les registres pour résoudre les presets
// ------------------------------------------------------------
// Composant autonome qui prend les IDs d'animations en props
// et affiche le rendu réel. Utilisé par l'éditeur d'animations.
// ============================================================

import React, { useMemo, useState, useEffect } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  animationsInitiales,
  animationsSortie,
  animationsInteraction,
} from '../registres/animationPresets';
import { LOOP_ANIMATIONS } from '../registres/animationsLoop';

export interface AnimationPreviewProps {
  /** ID de l'animation d'entrée (ex: 'fadeInUp') */
  entree?: string;
  /** ID de l'animation de sortie (ex: 'fadeOut') */
  sortie?: string;
  /** ID de l'animation d'interaction (ex: 'liftHover') */
  interaction?: string;
  /** ID de l'animation en boucle (ex: 'bounce') */
  loop?: string;
  /** Trigger de re-render pour relancer l'animation d'entrée */
  trigger?: number;
  /** Contenu à afficher dans la preview */
  children?: React.ReactNode;
  /** Titre affiché */
  title?: string;
  /** Scale appliqué au composant (défaut: 0.75) */
  scale?: number;
}

export const AnimationPreview: React.FC<AnimationPreviewProps> = ({
  entree,
  sortie,
  interaction,
  loop,
  trigger = 0,
  children,
  title,
  scale = 0.75,
}) => {
  const [showComponent, setShowComponent] = useState(true);
  const [loopActive, setLoopActive] = useState(false);

  // ⭐ Résolution directe depuis les registres
  const entreePreset = entree ? animationsInitiales[entree] : null;
  const sortiePreset = sortie ? animationsSortie[sortie] : null;
  const interactionPreset = interaction ? animationsInteraction[interaction] : null;
  const loopPreset = loop && loop !== 'none' ? LOOP_ANIMATIONS[loop] : null;

  // ⭐ Construire les props d'animation avec les registres
  const entreeProps = useMemo(() => {
    const props: any = {};
    if (entreePreset) {
      const preset = entreePreset as any;
      if (preset.initial) props.initial = preset.initial;
      if (preset.animate) props.animate = preset.animate;
      if (preset.transition) props.transition = preset.transition;
      if (preset.whileInView && !preset.initial) {
        props.initial = { opacity: 0, y: 20 };
        props.animate = preset.whileInView;
        if (preset.transition) props.transition = preset.transition;
      }
    }
    if (!props.initial) props.initial = { opacity: 0 };
    if (!props.animate) props.animate = { opacity: 1 };
    if (!props.transition) props.transition = { duration: 0.4 };

    if (sortiePreset) {
      const preset = sortiePreset as any;
      if (preset.animate) {
        props.exit = {
          ...preset.animate,
          transition: preset.transition || { duration: 0.3 },
        };
      }
    }
    if (!props.exit) {
      props.exit = { opacity: 0, transition: { duration: 0.3 } };
    }

    if (interactionPreset) {
      const preset = interactionPreset as any;
      if (preset.whileHover) props.whileHover = preset.whileHover;
      if (preset.whileTap) props.whileTap = preset.whileTap;
      if (preset.whileFocus) props.whileFocus = preset.whileFocus;
      if (preset.whileInView) props.whileInView = preset.whileInView;
      if (preset.drag) props.drag = preset.drag;
      if (preset.dragElastic !== undefined) props.dragElastic = preset.dragElastic;
    }

    return props;
  }, [entreePreset, sortiePreset, interactionPreset]);

  // ⭐ Animation de la boucle (indépendante)
  const loopProps = useMemo(() => {
    if (!loopPreset) return {};
    return {
      animate: loopPreset.animate,
      transition: loopPreset.transition,
    };
  }, [loopPreset]);

  // ⭐ Activer la boucle après la fin de l'animation d'entrée
  useEffect(() => {
    setLoopActive(false);
    if (!loopPreset) return;

    const entreeDuration = (() => {
      const t = entreeProps.transition;
      if (!t) return 400;
      if (typeof t.duration === 'number') return t.duration * 1000;
      if (t.type === 'spring') return 500;
      return 400;
    })();

    const timer = setTimeout(() => {
      setLoopActive(true);
    }, entreeDuration + 300);

    return () => clearTimeout(timer);
  }, [loopPreset, entreeProps.transition, trigger]);

  // ⭐ Rejouer l'animation d'entrée quand trigger change
  useEffect(() => {
    if (trigger === 0) return;
    setShowComponent(false);
    setLoopActive(false);
    const t = setTimeout(() => {
      setShowComponent(true);
    }, 100);
    return () => clearTimeout(t);
  }, [trigger]);

  return (
    <div
      style={{
        width: '100%',
        height: '100%',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        position: 'relative',
        minHeight: 280,
      }}
    >
      <AnimatePresence initial={false}>
        {showComponent && (
          // ─── motion.div EXTÉRIEUR : entrée + sortie + interaction ───
          <motion.div
            key={`entree-${trigger}`}
            initial={entreeProps.initial}
            animate={entreeProps.animate}
            exit={entreeProps.exit}
            transition={entreeProps.transition}
            whileHover={entreeProps.whileHover}
            whileTap={entreeProps.whileTap}
            whileFocus={entreeProps.whileFocus}
            drag={entreeProps.drag}
            dragElastic={entreeProps.dragElastic}
            style={{
              scale,
              width: 220,
            }}
          >
            {/* ─── motion.div INTÉRIEUR : boucle uniquement ─── */}
            <motion.div
              animate={loopActive && loopProps.animate ? loopProps.animate : {}}
              transition={loopActive && loopProps.transition ? loopProps.transition : {}}
              style={{
                backgroundColor: 'var(--color-cardBg)',
                color: 'var(--color-textPrimary)',
                borderRadius: 12,
                padding: 20,
                cursor: 'pointer',
                border: '1px solid var(--color-borderColor)',
              }}
              className="text-center"
            >
              {children || (
                <>
                  <div className="text-2xl mb-2">🎬</div>
                  <p className="font-medium text-sm">{title || 'Aperçu'}</p>
                </>
              )}
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
};
