// ============================================================
// APP HISTORY — History avec interception async
// Version V3.4 — Await animationController.playExit()
// ============================================================

import { createBrowserHistory } from 'history';
import { animationController } from './animationController';

export const appHistory = createBrowserHistory();

export const EXIT_ANIMATION_DURATION_MS = 800;

const SKIP_ANIMATION_ROUTES = [
  '/login',
  '/register',
  '/forgot-password',
  '/reset-password',
  '/maintenance',
];

function getPathString(path: any): string {
  if (typeof path === 'string') return path;
  return path?.pathname || '/';
}

function shouldSkipAnimation(path: string): boolean {
  return SKIP_ANIMATION_ROUTES.some((r) => path.startsWith(r));
}

const originalPush = appHistory.push.bind(appHistory);
const originalReplace = appHistory.replace.bind(appHistory);

let isPending = false;
let pendingPath: any = null;
let pendingState: any = null;

appHistory.push = function (path: any, state?: any): void {
  const pathStr = getPathString(path);

  if (process.env.NODE_ENV === 'development') {
    console.log('[appHistory] push appelé →', pathStr);
  }

  // Cas skip
  if (shouldSkipAnimation(pathStr)) {
    originalPush(path, state);
    return;
  }

  // Aucun animateur → push direct
  if (!animationController.hasAny()) {
    if (process.env.NODE_ENV === 'development') {
      console.log('[appHistory] pas d\'animator → push direct');
    }
    originalPush(path, state);
    return;
  }

  // Une navigation est déjà en cours → remplacer la destination
  if (isPending) {
    pendingPath = path;
    pendingState = state;
    return;
  }

  isPending = true;
  pendingPath = path;
  pendingState = state;

  if (process.env.NODE_ENV === 'development') {
    console.log('[appHistory] ▸ exit start →', pathStr);
  }

  animationController
    .playExit()
    .then(() => {
      const p = pendingPath;
      const s = pendingState;
      pendingPath = null;
      pendingState = null;
      isPending = false;

      if (process.env.NODE_ENV === 'development') {
        console.log('[appHistory] ▸ push now →', getPathString(p));
      }

      if (p !== null) {
        originalPush(p, s);
      }
    })
    .catch((e) => {
      console.warn('[appHistory] playExit error:', e);
      isPending = false;
      const p = pendingPath;
      const s = pendingState;
      pendingPath = null;
      pendingState = null;
      if (p !== null) originalPush(p, s);
    });
};

appHistory.replace = function (path: any, state?: any): void {
  originalReplace(path, state);
};

export default appHistory;
