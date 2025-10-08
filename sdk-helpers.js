function meetApi() {
  const g = typeof window !== 'undefined' ? window.google : undefined;
  return g?.meet?.addons || null;
}

let initialized = false;
let cachedContext = null;
let state = {};
const listeners = new Set();

export async function ensureInitialized() {
  if (initialized) return cachedContext;
  const api = meetApi();
  try { await api?.initialize?.(); } catch {}
  try {
    const ctx = await api?.context?.getMeeting?.();
    cachedContext = ctx ? { meetingId: ctx.meetingId || ctx.id || null } : null;
  } catch { cachedContext = null; }
  try {
    api?.sharedState?.subscribe?.((s) => {
      state = { ...(s || {}) };
      listeners.forEach((fn) => fn(state));
    });
  } catch {}
  initialized = true;
  return cachedContext;
}

export async function openStage(url) {
  const api = meetApi();
  if (api?.stage?.open) return api.stage.open({ url });
  window.open(url, '_blank', 'noopener,noreferrer');
}

export async function setSharedState(patch) {
  const api = meetApi();
  state = { ...state, ...(patch || {}) };
  if (api?.sharedState?.set) return api.sharedState.set(state);
  listeners.forEach((fn) => fn(state));
}

export function subscribeSharedState(cb) {
  listeners.add(cb); cb(state);
  return () => listeners.delete(cb);
}

export const meet = { openStage, setSharedState };
export default meet;