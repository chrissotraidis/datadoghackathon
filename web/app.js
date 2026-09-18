import { loadMock } from './lib/mockdata.js?v=20260918-2';
import { parseRequest, analyze, checkPolicy } from './lib/impact.js?v=20260918-2';
import { requestApproval, alreadyCalled } from './lib/call.js?v=20260918-2';
import * as ledger from './lib/ledger.js?v=20260918-2';

const $ = id => document.getElementById(id);
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const DEMO = 'From April, consumption tax on category 7 goes from 8 to 10 percent.';
const config = { demoMode: 'canned', ...(window.HANKO || {}) };
const mode = ['phone', 'browser', 'canned'].includes(config.demoMode) ? config.demoMode : 'canned';
config.demoMode = mode;
let mock, request, impact, policy, busy = false, calls = 0, recognition;
const notice = (id, message = '') => { $(id).textContent = message; $(id).hidden = !message; };
const pill = (id, text, kind = 'idle') => { $(id).textContent = text; $(id).className = `pill ${kind}`; };
const count = () => { $('counter').innerHTML = `AI calls for this change: <b>${calls}</b>`; };
const focusStep = id => $(id).scrollIntoView({ behavior: matchMedia('(prefers-reduced-motion: reduce)').matches ? 'auto' : 'smooth', block: 'start' });
const hashDiff = async diff => diff ? Array.from(new Uint8Array(await crypto.subtle.digest('SHA-256', new TextEncoder().encode(diff))), b => b.toString(16).padStart(2, '0')).join('') : 'no-diff';
const impactReady = () => impact?.definition?.line > 0 && impact?.paragraph?.start_line > 0 && impact?.paragraph?.name !== 'unknown' && impact?.last_changed?.date !== 'unknown' && impact?.affected_records > 0 && impact?.total_records >= impact?.affected_records && policy?.owner !== 'unknown';
const matchesProposal = () => !request?.parsed_with_defaults && request?.category === 7 && request.field === 'TAX-RATE-CAT7' && Number(request.from) === .08 && Number(request.to) === .10 && request.effective === '2027-04-01';
const gate = () => {
  for (const id of ['submit', 'demo', 'speak', 'request-text', 'reset', 'reload']) $(id).disabled = busy || !mock;
  $('call').disabled = busy || !policy || !request || !policy.requires_call || !matchesProposal() || !impactReady() || !mock?.evidenceMatched;
};
function updateLedger() {
  ledger.render($('ledger-content'));
  const n = ledger.all().length;
  pill('ledger-pill', n ? `${n} decision${n === 1 ? '' : 's'}` : 'No decisions', n ? 'done' : 'idle');
  $('print').disabled = !n;
}
function invalidate() {
  if (busy) return;
  request = impact = policy = null;
  $('request-result').hidden = true;
  pill('request-pill', 'Ready');
  pill('impact-pill', 'Waiting for request');
  pill('call-pill', 'Awaiting impact');
  $('impact-content').innerHTML = '<div class="empty-state"><p>Submit the request to compute its impact.</p></div>';
  $('policy-content').innerHTML = '<div class="empty-state"><p>Analyze the request to check its approval policy.</p></div>';
  $('transcript').hidden = $('decision-result').hidden = true;
  $('call-status').textContent = 'One call per change. Every word on the record.';
  notice('call-error'); gate();
}
async function renderChange() {
  $('change-content').className = '';
  const diff = mock.diff;
  mock.evidenceMatched = false;
  if (!diff) {
    pill('change-pill', 'Awaiting diff');
    $('change-content').innerHTML = '<div class="empty-state"><span class="empty-icon" aria-hidden="true">±</span><p>Waiting for the proposed change.<small>Reload after change.diff and test_result.json are ready.</small></p></div>';
    return;
  }
  const test = mock.testResult;
  const diffHash = await hashDiff(diff);
  mock.evidenceMatched = test?.passed === true && test.diff_sha256 === diffHash;
  pill('change-pill', mock.evidenceMatched ? 'Tests passed · exact diff' : test?.passed === false ? 'Tests failed' : 'Test evidence unmatched', mock.evidenceMatched ? 'done' : 'failed');
  $('change-content').innerHTML = `<div class="diff-toolbar"><span class="mono">change.diff</span><span>PROPOSED · AWAITING HUMAN REVIEW</span></div><pre class="diff" aria-label="Proposed change diff">${diff.split('\n').map(line => `<span class="diff-line ${line.startsWith('+') ? 'diff-add' : line.startsWith('-') ? 'diff-remove' : /^(?:@@|diff |index )/.test(line) ? 'diff-meta' : ''}">${escape(line)}</span>`).join('')}</pre><p class="change-note">${escape(test?.summary || 'Test evidence has not been supplied.')} ${test?.effective_date_enforced === false ? `Effective ${escape(test.effective_date || '2027-04-01')}; source has no date guard. Release stays held.` : 'No change is deployed by Hanko.'}</p>`;
}
function renderRequest() {
  const percent = value => `${Number((Number(value) * 100).toFixed(8))}%`;
  $('request-result').hidden = false;
  $('request-result').innerHTML = `<div class="parsed"><div><span>Field · ${escape(request.id)}</span><strong>${escape(request.field)}</strong></div><div><span>Proposed rate</span><strong>${percent(request.from)} <b class="rate-arrow">→</b> ${percent(request.to)}</strong></div><div><span>Effective</span><strong>${escape(request.effective)}</strong></div></div>${request.parsed_with_defaults ? '<p class="defaults">Parsed with defaults · review the field, rates, and effective date above.</p>' : ''}`;
}
function renderImpact() {
  const p = impact.paragraph, changed = impact.last_changed;
  const refs = impact.references.map(ref => `<code>${escape(ref.file)}:${escape(ref.line)}</code>`).join('');
  const jobs = impact.jobs.map(job => `<code>${escape(job)}</code>`).join('');
  $('impact-content').className = '';
  $('impact-content').innerHTML = `<div class="impact-stats"><div class="stat"><span class="stat-label">Program paragraph</span><div class="stat-value code">${escape(p.name)}</div><small>${escape(p.file)} · lines ${p.start_line}–${p.end_line}</small></div><div class="stat"><span class="stat-label">Customers affected</span><div class="stat-value">${impact.affected_records.toLocaleString()}</div><small>of ${impact.total_records.toLocaleString()} total records</small></div><div class="stat"><span class="stat-label">Nightly jobs</span><div class="stat-value">${impact.jobs.length.toLocaleString().padStart(2, '0')}</div><small>reference this field</small></div></div><table class="facts"><tbody><tr><th scope="row">Referenced by</th><td><div class="file-list">${refs}</div></td></tr><tr><th scope="row">Nightly jobs</th><td><div class="file-list">${jobs}</div></td></tr><tr><th scope="row">Last changed</th><td><code>${escape(changed.date)}</code> &nbsp; by ${escape(changed.by)}</td></tr></tbody></table><div class="source-summary"><p>${escape(impact.summary)}</p><span class="source-tag">Summary / ${escape(impact.summary_source)} · facts computed from source</span></div>`;
}
function renderPolicy() {
  $('policy-content').className = '';
  $('policy-content').innerHTML = `<div class="policy-grid"><div class="policy-item"><span class="stat-label">Registered owner</span><div class="owner"><span class="owner-avatar" aria-hidden="true">田</span>${escape(policy.owner)}</div></div><div class="policy-item"><span class="stat-label">Hours · channel</span><p>${escape(policy.hours)}</p><p class="muted">${mode === 'canned' ? 'Simulated conversation · no phone call' : mode === 'browser' ? 'Browser voice conversation' : 'Phone · registered number'}</p></div><div class="policy-item wide"><span class="stat-label">Reason for call</span><p>${escape(policy.tripped.join('; ') || 'No approval-call rule was triggered.')}</p></div></div>`;
  pill('call-pill', policy.requires_call ? 'Owner review required' : 'No call required', policy.requires_call ? 'conditional' : 'idle');
}
function renderTranscript(lines = []) {
  $('transcript').hidden = !lines.length;
  $('transcript').innerHTML = lines.map(line => `<div class="utterance ${line.role === 'agent' ? 'agent' : 'user'}"><small>${line.role === 'agent' ? 'Hanko' : escape(policy?.owner || 'Owner')}${mode === 'canned' ? ' · simulated' : ''}</small><p>${escape(line.text)}</p></div>`).join('');
  $('transcript').scrollTop = $('transcript').scrollHeight;
}
function status(name, data) {
  if (name === 'transcript') return renderTranscript(data);
  const labels = { policy: 'Checking policy', dialing: mode === 'canned' ? 'Starting simulated conversation' : `Dialing ${policy.owner}`, ringing: mode === 'canned' ? 'Simulated ringing' : 'Ringing', in_call: 'In conversation', processing: 'Extracting decision', done: 'Conversation finished' };
  const label = labels[name] || 'Approval in progress';
  $('call-status').textContent = label;
  pill('call-pill', label, name === 'done' ? 'done' : 'working');
}
async function submit(event) {
  event.preventDefault();
  if (busy || !mock || !$('request-text').value.trim()) return;
  busy = true; gate(); notice('global-error'); notice('call-error');
  $('transcript').hidden = $('decision-result').hidden = true;
  try {
    request = parseRequest($('request-text').value.trim());
    policy = null; renderRequest();
    pill('request-pill', 'Parsed', 'done'); pill('impact-pill', 'Analyzing source', 'working');
    impact = await analyze(request, mock, config.geminiKey);
    policy = checkPolicy(request, impact, mock.policy);
    renderImpact(); renderPolicy();
    if (!impactReady()) throw new Error('Source evidence is incomplete. Approval stays held.');
    if (!matchesProposal()) notice('call-error', 'This request does not match the available CHG-0417 proposal: category 7, 8% → 10%, effective 2027-04-01. Approval is held; use the demo request to review this diff.');
    calls = (impact.summary_source === 'gemini' ? 1 : 0) + (alreadyCalled(request.id) || ledger.all().some(row => row.change_id === request.id) ? 1 : 0); count();
    pill('impact-pill', 'Verified from source', 'done');
    focusStep('impact-panel');
    if (alreadyCalled(request.id)) $('call-status').textContent = 'Already contacted for this change. One call per change.';
  } catch (error) {
    policy = null; pill('impact-pill', 'Unable to analyze', 'failed');
    notice('global-error', `Could not analyze this request: ${error.message}`);
  } finally { busy = false; gate(); }
}
async function callOwner() {
  if (busy || !request || !policy?.requires_call || !matchesProposal() || !impactReady() || !mock?.evidenceMatched) return;
  if (alreadyCalled(request.id) || ledger.all().some(row => row.change_id === request.id)) {
    notice('call-error', 'One call per change. This change already has a call attempt or recorded decision. Simulated records can be reset; live evidence is preserved.');
    return;
  }
  busy = true; gate(); notice('call-error');
  if (recognition) recognition.abort();
  try {
    const diff = mock.diff || '';
    const fullHash = await hashDiff(diff);
    const snapshot = { request: structuredClone(request), impact: structuredClone(impact), policy: structuredClone(policy), testsPassed: mock.testResult?.passed === true, testHash: mock.testResult?.diff_sha256 };
    calls++; count();
    const decision = await requestApproval({ policy: snapshot.policy, request: snapshot.request, impact: snapshot.impact, config, onStatus: status });
    if (decision.attempted !== true) {
      calls--; count(); notice('call-error', decision.error || 'Approval could not start. The change is held.');
      pill('call-pill', 'Held · call not started', 'conditional');
      $('call-status').textContent = 'No call was placed. Correct the configuration or wait for owner hours.';
      return;
    }
    renderTranscript(decision.transcript);
    const evidenceMatched = Boolean(diff) && snapshot.testsPassed && snapshot.testHash === fullHash;
    const eligibility = decision.decision === 'approved' ? 'APPROVED · RELEASE HELD' : decision.decision === 'rejected' ? 'REJECTED' : 'HELD';
    const conditionTask = decision.decision === 'conditional' ? decision.condition_text || 'Clarify and satisfy the owner’s condition before further approval.' : '';
    const saved = ledger.append({ change_id: snapshot.request.id, request_text: snapshot.request.text, facts_summary: `${snapshot.impact.paragraph.name}; ${snapshot.impact.jobs.length} jobs; ${snapshot.impact.affected_records} of ${snapshot.impact.total_records} customers; last changed ${snapshot.impact.last_changed.date}. ${snapshot.impact.summary}`, diff_hash: fullHash === 'no-diff' ? fullHash : fullHash.slice(0, 8), decision: decision.decision, condition_text: decision.condition_text, approver: snapshot.policy.owner, approved_at: decision.ended_at, conversation_id: decision.conversation_id, channel: decision.channel, transcript: decision.transcript, rationale_quote: decision.rationale_quote, started_at: decision.started_at, error: decision.error, diff_sha256: fullHash, diff_snapshot: diff, eligibility, condition_task: conditionTask, test_evidence_matched: evidenceMatched, attempted: decision.attempted });
    if (!saved) throw new Error('An existing ledger decision was preserved; this result did not replace it');
    updateLedger(); notice('call-error', decision.error);
    $('decision-result').hidden = false;
    const note = decision.decision === 'conditional' ? `<span class="task-label">Open condition task</span>“${escape(conditionTask)}”` : decision.decision === 'no_answer' ? 'No confirmed approval was received. The change remains on hold.'  : decision.decision === 'rejected' ? escape(decision.condition_text || decision.rationale_quote || 'The owner rejected this change.') : `Approval recorded. Release remains held: the proposed effective date is ${escape(snapshot.request.effective)} and the source has no date guard. ${evidenceMatched ? 'Test evidence matches this exact diff.' : 'Matching test evidence is still required.'}`;
    $('decision-result').innerHTML = `<div class="decision-card ${decision.decision === 'rejected' ? 'rejected' : ''}"><h3>${escape(eligibility)}${decision.channel === 'canned' ? ' · SIMULATED DECISION' : ''}</h3><p>${note}</p>${decision.rationale_quote ? `<p>Rationale: “${escape(decision.rationale_quote)}”</p>` : ''}<p class="mono">${escape(snapshot.request.id)} · diff ${fullHash === 'no-diff' ? 'unavailable' : fullHash.slice(0, 8)}</p></div>`;
    pill('call-pill', 'Decision recorded', 'done');
    $('call-status').textContent = decision.channel === 'canned' ? 'Simulated decision saved to the ledger.' : 'Decision saved to the ledger.';
    focusStep('decision-result');
  } catch (error) {
    notice('call-error', `Approval could not complete: ${error.message}. The change remains held.`);
    pill('call-pill', 'Held', 'conditional');
  } finally { busy = false; gate(); }
}
async function reloadChange() {
  if (busy || !mock) return;
  busy = true; gate(); notice('global-error');
  try {
    const [diffResponse, testResponse] = await Promise.all([fetch('../mock/change.diff', { cache: 'no-store' }), fetch('../mock/test_result.json', { cache: 'no-store' })]);
    if ((!diffResponse.ok && diffResponse.status !== 404) || (!testResponse.ok && testResponse.status !== 404)) throw new Error('Could not reload change evidence');
    const [diff, test] = await Promise.all([diffResponse.ok ? diffResponse.text() : null, testResponse.ok ? testResponse.json() : null]);
    mock.diff = diff; mock.testResult = test; await renderChange();
    if (request && ledger.all().some(row => row.change_id === request.id)) notice('call-error', 'The ledger retains the exact diff reviewed during the recorded call. Reloading does not approve a new diff.');
  } catch (error) { notice('global-error', error.message); }
  finally { busy = false; gate(); }
}
function resetDemo() {
  if (busy) return;
  if (recognition) recognition.abort();
  try {
    ledger.all().filter(row => row.channel === 'canned').forEach(row => localStorage.removeItem(`hanko.called.${row.change_id}`));
    ledger.reset(); updateLedger(); $('request-text').value = ''; calls = 0; count(); invalidate();
    notice('global-error'); $('speech-status').textContent = ''; $('request-text').focus();
  } catch { notice('global-error', 'Demo reset could not clear local storage. Existing call locks remain in effect.'); }
}
function fillDemo() { if (!busy) { $('request-text').value = DEMO; invalidate(); $('request-text').focus(); } }
$('request-form').addEventListener('submit', submit);
$('request-text').addEventListener('input', invalidate);
$('demo').addEventListener('click', fillDemo);
$('call').addEventListener('click', callOwner);
$('reload').addEventListener('click', reloadChange);
$('reset').addEventListener('click', resetDemo);
$('print').addEventListener('click', () => { if (!ledger.printView()) notice('global-error', 'Allow pop-ups for this page to open the printable ledger.'); });
document.addEventListener('keydown', event => {
  if (busy || event.repeat || event.ctrlKey || event.metaKey || event.altKey || /^(INPUT|TEXTAREA|SELECT|BUTTON)$/.test(event.target.tagName) || event.target.isContentEditable) return;
  if (event.key.toLowerCase() === 'r') { event.preventDefault(); resetDemo(); }
  if (event.key === '1') { event.preventDefault(); fillDemo(); }
});
const Speech = window.SpeechRecognition || window.webkitSpeechRecognition;
if (Speech) {
  $('speak').hidden = false;
  $('speak').addEventListener('click', () => {
    if (busy) return;
    if (recognition) recognition.abort();
    recognition = new Speech(); recognition.lang = 'en-US'; recognition.interimResults = false; recognition.maxAlternatives = 1;
    recognition.onstart = () => { $('speech-status').textContent = 'Listening… say the change you need.'; };
    recognition.onresult = event => { if (busy) return; $('request-text').value = event.results[0][0].transcript; invalidate(); $('speech-status').textContent = 'Request captured. Review it, then analyze.'; recognition.stop(); };
    recognition.onerror = event => { $('speech-status').textContent = `Voice input unavailable (${event.error}). You can type the request.`; };
    recognition.onend = () => { if ($('speech-status').textContent.startsWith('Listening')) $('speech-status').textContent = 'Listening ended. Type or try again.'; };
    try { recognition.start(); } catch { $('speech-status').textContent = 'Could not start voice input. You can type the request.'; }
  });
}
$('mode-label').textContent = mode === 'canned' ? 'Simulated demo' : mode === 'browser' ? 'Browser voice mode' : 'Live phone mode';
$('mode-description').textContent = mode === 'canned' ? 'Real impact analysis · simulated approval · no call is placed' : 'Mock legacy system · live approval conversation';
updateLedger();
try { mock = await loadMock(); await renderChange(); gate(); }
catch (error) { notice('global-error', `Workspace could not load: ${error.message}. Serve the repository over localhost and reload.`); pill('change-pill', 'Unavailable', 'failed'); }
