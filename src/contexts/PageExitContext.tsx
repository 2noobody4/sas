// ============================================================
// PAGE EXIT CONTEXT — Signale aux MotionBox que la page sort
// Version V3 — Compatible React 16
// ------------------------------------------------------------
// PageWrapper met isExiting=true → tous les MotionBox enfants
// avec une animationSortie jouent leur exit avant le démontage.
// ============================================================

import { createContext } from 'react';

export const PageExitContext = createContext<boolean>(false);

export default PageExitContext;
