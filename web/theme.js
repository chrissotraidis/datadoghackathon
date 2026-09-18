(() => {
  const key = 'hanko.theme', valid = value => ['system', 'light', 'dark'].includes(value);
  const system = matchMedia('(prefers-color-scheme: dark)');
  let preference = 'system';
  try { const stored = localStorage.getItem(key); if (valid(stored)) preference = stored; } catch {}
  const resolved = () => preference === 'system' ? (system.matches ? 'dark' : 'light') : preference;
  const apply = () => {
    document.documentElement.dataset.theme = resolved();
    document.querySelector('meta[name="theme-color"]')?.setAttribute('content', resolved() === 'dark' ? '#101217' : '#f5f3ef');
    document.querySelectorAll('[data-theme-select]').forEach(select => { select.value = preference; });
    window.dispatchEvent(new CustomEvent('hanko-theme-change', { detail: { preference, resolved: resolved() } }));
  };
  window.HankoTheme = {
    getPreference: () => preference, getResolved: resolved,
    setPreference(value) { if (!valid(value)) return; preference = value; try { localStorage.setItem(key, value); } catch {} apply(); }
  };
  apply();
  system.addEventListener('change', () => { if (preference === 'system') apply(); });
  window.addEventListener('storage', event => { if (event.key === key) { preference = valid(event.newValue) ? event.newValue : 'system'; apply(); } });
  document.addEventListener('DOMContentLoaded', () => {
    document.querySelectorAll('[data-theme-select]').forEach(select => select.addEventListener('change', () => window.HankoTheme.setPreference(select.value)));
    apply();
  });
})();
