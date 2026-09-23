
  const renderPreview = () => {
    const safeInitial = animationProps.initial || { opacity: 0 };
    const safeAnimate = animationProps.animate || { opacity: 1 };
    const safeTransition = animationProps.transition || { duration: 0.4 };
    const safeExit = animationProps.exit || { opacity: 0, transition: { duration: 0.3 } };

    return (
      <div
        className="w-full h-full flex items-center justify-center"
        style={{ minHeight: 280, position: 'relative' }}
      >
        <AnimatePresence initial={false}>
          {showComponent && (
            <motion.div
              key={previewKey}
              initial={safeInitial}
              animate={safeAnimate}
              exit={safeExit}
              transition={safeTransition}
              whileHover={animationProps.whileHover}
              whileTap={animationProps.whileTap}
              whileFocus={animationProps.whileFocus}
              drag={animationProps.drag}
              dragElastic={animationProps.dragElastic}
              style={{
                backgroundColor: 'var(--color-cardBg)',
                color: 'var(--color-textPrimary)',
                borderRadius: 12,
                padding: 20,
                cursor: 'pointer',
                border: '1px solid var(--color-borderColor)',
                width: 220,
                scale: 0.75,
              }}
              className="text-center"
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
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    );
  };
