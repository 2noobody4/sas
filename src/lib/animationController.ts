// ============================================================
// ANIMATION CONTROLLER — Registre global d'animateurs
// Version V3 — Compatible React 16
// ============================================================

type AnimatorFn = () => Promise<void>;

const animators = new Map<string, AnimatorFn>();

export const animationController = {
  register(id: string, fn: AnimatorFn): () => void {
    animators.set(id, fn);
    return () => {
      animators.delete(id);
    };
  },

  async playExit(): Promise<void> {
    if (animators.size === 0) return;

    const promises: Promise<void>[] = [];
    animators.forEach((fn, id) => {
      try {
        promises.push(fn());
      } catch (e) {
        console.warn(`[animationController] "${id}" error:`, e);
      }
    });

    await Promise.all(promises);
  },

  isRegistered(id: string): boolean {
    return animators.has(id);
  },

  hasAny(): boolean {
    return animators.size > 0;
  },

  count(): number {
    return animators.size;
  },

  clear(): void {
    animators.clear();
  },
};

export default animationController;
