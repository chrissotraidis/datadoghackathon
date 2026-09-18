import { readPreferences, savePreferences, defaults } from './preferences.js?v=20260918-polish';
const $ = id => document.getElementById(id);
const config = window.HANKO || {};
const notice = (message, error = false) => { $('settings-status').textContent = message; $('settings-status').classList.toggle('error', error); };
function populate() {
  const prefs = readPreferences();
  $('motion-choice').value = prefs.motion;
  $('show-cues').checked = prefs.showCues;
  $('auto-advance').checked = prefs.autoAdvance;
}
populate();
for (const [id, name] of [['motion-choice', 'motion'], ['show-cues', 'showCues'], ['auto-advance', 'autoAdvance']]) {
  $(id).addEventListener('change', () => {
    try { savePreferences({ [name]: $(id).type === 'checkbox' ? $(id).checked : $(id).value }); notice('Saved. Your records and calling configuration are unchanged.'); }
    catch { notice('This browser could not save the preference. Existing records are unchanged.', true); }
  });
}
$('theme-choice').addEventListener('change', () => notice('Theme updated for this browser.'));
window.addEventListener('storage', event => { if (event.key === 'hanko.preferences') populate(); });
$('reset-preferences').addEventListener('click', () => {
  try { savePreferences(defaults); window.HankoTheme?.setPreference('system'); populate(); notice('Display defaults restored. All decision records are preserved.'); }
  catch { notice('Preferences could not be saved in this browser.', true); }
});
const configured = value => typeof value === 'string' && value.trim().length > 0;
$('agent-ready').textContent = configured(config.agentId) && configured(config.elevenKey) ? 'Configured' : 'Needs local setup';
$('number-ready').textContent = configured(config.phoneNumberId) ? 'Configured' : 'Needs local setup';
$('recipient-ready').textContent = /^\+[1-9]\d{7,14}$/.test(config.ownerPhone || '') ? `Registered · ending ${config.ownerPhone.slice(-4)}` : 'Needs a test number';
const ready = ['agentId', 'elevenKey', 'phoneNumberId', 'ownerPhone'].every(k => configured(config[k]));
$('connection-pill').textContent = ready ? 'Configured · not checked' : 'Setup incomplete';
$('check-connection').disabled = !ready;
try {
  const response = await fetch('../mock/policy.json', { cache: 'no-store' });
  if (!response.ok) throw new Error();
  const policy = await response.json();
  $('owner-hours').textContent = policy.modules?.['billing.cbl']?.hours || 'Not configured';
} catch { $('owner-hours').textContent = 'Could not read policy'; }
$('check-connection').addEventListener('click', async () => {
  const button = $('check-connection'); button.disabled = true;
  $('connection-result').textContent = 'Checking agent and imported number access…';
  const controller = new AbortController(), timer = setTimeout(() => controller.abort(), 12000);
  try {
    const get = async path => {
      const response = await fetch('https://api.elevenlabs.io/v1/convai' + path, { headers: { 'xi-api-key': config.elevenKey }, signal: controller.signal });
      if (!response.ok) throw new Error(`Connection check returned HTTP ${response.status}.`);
      return response.json();
    };
    const [agent, number] = await Promise.all([get('/agents/' + encodeURIComponent(config.agentId)), get('/phone-numbers/' + encodeURIComponent(config.phoneNumberId))]);
    const fields = agent.platform_settings?.data_collection || {};
    if (!['decision', 'condition_text', 'rationale_quote'].every(k => Object.hasOwn(fields, k)) || !number.phone_number_id) throw new Error('The configured agent or number is missing required setup.');
    $('connection-pill').textContent = 'Connection verified'; $('connection-pill').className = 'pill done';
    $('connection-result').textContent = 'Agent access, decision fields and imported number verified. No call placed or settings changed.';
  } catch (error) {
    $('connection-pill').textContent = 'Check needs attention'; $('connection-pill').className = 'pill conditional';
    $('connection-result').textContent = error.name === 'AbortError' ? 'Connection check timed out. You can retry.' : error.message.startsWith('Connection check returned HTTP') || error.message.startsWith('The configured') ? error.message : 'Connection unavailable. Check the network and local setup.';
  } finally { clearTimeout(timer); button.disabled = false; }
});
const rows = key => { try { const value = JSON.parse(localStorage.getItem(key) || '[]'); return Array.isArray(value) ? value : []; } catch { return []; } };
function updateCounts() {
  const workspace = rows('hanko.ledger'), studio = rows('hanko.demo.ledger');
  $('workspace-count').textContent = workspace.length; $('studio-count').textContent = studio.length;
  $('export-records').disabled = !workspace.length && !studio.length;
}
updateCounts(); window.addEventListener('storage', updateCounts);
$('export-records').addEventListener('click', () => {
  const fields = ['change_id','proposal_id','space','request_text','facts_summary','decision','eligibility','condition_text','condition_task','rationale_quote','confirmation_quote','confirmation_policy','approver','approved_at','channel','conversation_id','started_at','diff_hash','diff_sha256','diff_snapshot','test_evidence_matched','transcript','error'];
  const clean = list => list.filter(r => r && typeof r === 'object').map(row => Object.fromEntries(fields.filter(k => Object.hasOwn(row, k)).map(k => [k, row[k]])));
  const payload = { product: 'Hanko', exported_at: new Date().toISOString(), workspace: clean(rows('hanko.ledger')), studio: clean(rows('hanko.demo.ledger')) };
  const url = URL.createObjectURL(new Blob([JSON.stringify(payload, null, 2)], { type: 'application/json' }));
  const link = document.createElement('a'); link.href = url; link.download = `hanko-records-${new Date().toISOString().slice(0,10)}.json`; link.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000); notice('Record export downloaded. No credentials are included.');
});
