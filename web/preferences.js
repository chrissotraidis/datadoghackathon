const KEY = 'hanko.preferences';
export const defaults = Object.freeze({ motion: 'system', showCues: true, autoAdvance: true });
export function readPreferences() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '{}');
    return { motion: stored.motion === 'reduced' ? 'reduced' : 'system', showCues: stored.showCues !== false, autoAdvance: stored.autoAdvance !== false };
  } catch { return { ...defaults }; }
}
export function savePreferences(value) {
  const prefs = { ...readPreferences(), ...value };
  localStorage.setItem(KEY, JSON.stringify(prefs));
  applyPreferences(prefs);
  window.dispatchEvent(new CustomEvent('hanko-preferences-change', { detail: prefs }));
  return prefs;
}
export function applyPreferences(prefs = readPreferences()) {
  document.documentElement.dataset.motion = prefs.motion;
  document.documentElement.dataset.cues = prefs.showCues ? 'show' : 'hide';
  return prefs;
}
export function prefersReducedMotion() {
  return readPreferences().motion === 'reduced' || matchMedia('(prefers-reduced-motion: reduce)').matches;
}
applyPreferences();
window.addEventListener('storage', event => { if (event.key === KEY) applyPreferences(); });
