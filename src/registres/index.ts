// ============================================================
// REGISTRES — Point d'entrée unifié
// Version V3 — Compatible React 16
// ============================================================

export * from "./tailwindRegistry";
export * from "./animationPresets";
export * from "./lucideRegistry";
export * from "./modulesRegistry";

// ✅ Exporter depuis motionBoxUsages uniquement (qui ré-exporte déjà depuis motionBoxRegistry)
export * from './motionBoxUsages';

// ❌ Ne pas exporter depuis motionBoxRegistry pour éviter les doublons
// export * from './motionBoxRegistry';
