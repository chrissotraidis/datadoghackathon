let KEY = 'hanko.ledger';
export function useDemoLedger() { KEY = 'hanko.demo.ledger'; volatileRows = []; storageWarning = ''; }
let volatileRows = [];
let storageWarning = '';
const escape = value => String(value ?? '').replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
const labels = { approved: 'Approved', conditional: 'Conditional', rejected: 'Rejected', no_answer: 'No answer' };
const formatDate = value => {
  const date = new Date(value);
  return Number.isNaN(date.getTime()) ? 'Not recorded' : date.toLocaleString([], { month: 'short', day: 'numeric', hour: '2-digit', minute: '2-digit' });
};

export function all() {
  try {
    const stored = JSON.parse(localStorage.getItem(KEY) || '[]');
    if (!Array.isArray(stored)) throw new Error('Invalid ledger');
    if (!storageWarning) volatileRows = stored.filter(row => row && typeof row === 'object');
  } catch { storageWarning = 'Local storage is unavailable. This record is only in this tab; print it to keep a copy.'; }
  return volatileRows.map(row => ({ ...row }));
}

export function append(row) {
  const rows = all();
  if (rows.some(existing => existing.change_id === row.change_id)) return false;
  volatileRows = [{ ...row }, ...rows];
  try { localStorage.setItem(KEY, JSON.stringify(volatileRows)); }
  catch { storageWarning = 'This record could not be saved to local storage. Print it before closing this tab.'; }
  return true;
}

export function render(el) {
  const rows = all();
  if (!rows.length) {
    el.innerHTML = '<div class="empty-state"><span class="empty-icon" aria-hidden="true">▤</span><p>No decisions yet.<small>The conversation ends. The context stays here.</small></p></div>';
    return;
  }
  el.innerHTML = `${storageWarning ? `<p class="notice">${escape(storageWarning)}</p>` : ''}<div class="ledger-scroll"><table class="ledger-table"><thead><tr><th scope="col">Change</th><th scope="col">Decision</th><th scope="col">Condition · verbatim</th><th scope="col">Approver</th><th scope="col">When</th><th scope="col">Channel</th><th scope="col">Diff</th></tr></thead><tbody>${rows.map(row => {
    const decision = Object.hasOwn(labels, row.decision) ? row.decision : 'no_answer';
    return `<tr><td class="mono">${escape(row.change_id)}</td><td><span class="pill ${decision}">${labels[decision]}</span><span class="row-note">${escape(row.eligibility || (decision === 'approved' ? 'Review recorded' : 'HELD'))}</span>${row.channel !== 'canned' && ['approved','conditional'].includes(decision) && !row.confirmation_quote ? '<span class="row-note">Earlier rule · final yes not checked</span>' : ''}</td><td>${row.condition_text ? `“${escape(row.condition_text)}”` : '<span class="muted">—</span>'}${row.condition_task ? '<span class="row-note">Open condition task</span>' : ''}</td><td>${escape(row.approver)}</td><td class="row-time">${escape(formatDate(row.approved_at))}</td><td>${row.channel === 'canned' ? '<span class="simulated">Simulated</span>' : escape(row.channel)}</td><td class="mono" title="${escape(row.diff_sha256 || row.diff_hash)}">${escape(row.diff_hash)}</td></tr>`;
  }).join('')}</tbody></table></div><div class="record-library">${rows.map(row => `<details class="record-detail"><summary><span>${escape(row.change_id)}</span> Read transcript &amp; evidence <span aria-hidden="true">↗</span></summary><p class="record-meta">${row.space === 'demo' ? 'Demo Studio rehearsal' : 'Workspace decision'} · ${escape(row.channel)} · Proposal ${escape(row.proposal_id || row.change_id)}</p>${row.confirmation_quote ? `<p class="confirmation-proof"><strong>Final human confirmation:</strong> “${escape(row.confirmation_quote)}”</p>` : ''}${row.condition_text ? `<p><strong>Condition:</strong> ${escape(row.condition_text)}</p>` : ''}${row.rationale_quote ? `<p><strong>Rationale:</strong> ${escape(row.rationale_quote)}</p>` : ''}<div class="saved-transcript">${(row.transcript || []).map(line => `<p><strong>${line.role === 'agent' ? 'Hanko' : escape(row.approver)}:</strong> ${escape(line.text)}</p>`).join('') || '<p>No transcript recorded.</p>'}</div><p class="record-meta">Conversation: ${escape(row.conversation_id || 'Not recorded')}<br>SHA-256: ${escape(row.diff_sha256 || row.diff_hash)}<br>Tests: ${row.test_evidence_matched ? 'Matched to this exact diff' : 'Not verified'}</p><details><summary>Exact diff reviewed</summary><pre class="diff">${escape(row.diff_snapshot || 'No diff recorded.')}</pre></details></details>`).join('')}</div>`;
}

export function printView() {
  const rows = all();
  const popup = window.open('', '_blank');
  if (!popup) return false;
  popup.opener = null;
  popup.document.write(`<!doctype html><html lang="en"><head><meta charset="utf-8"><title>Hanko change ledger</title><style>
    body{font:14px/1.6 -apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;color:#252525;max-width:850px;margin:45px auto;padding:0 25px}h1{font-size:30px;letter-spacing:-1px}h2{margin:0;font-size:20px}header{border-bottom:2px solid #222;margin-bottom:30px}section{break-inside:avoid;border-bottom:1px solid #bbb;padding:0 0 30px;margin:30px 0}.stamp{float:right;color:#c83232;border:4px double #c83232;padding:8px;font:26px serif;transform:rotate(-5deg)}dt{font-size:11px;text-transform:uppercase;letter-spacing:.8px;color:#666;margin-top:15px}dd{margin:3px 0;overflow-wrap:anywhere}pre{white-space:pre-wrap;overflow-wrap:anywhere;font:11px/1.6 monospace;background:#f4f4f4;padding:12px}.simulated{color:#9e6000;font-weight:700}button{padding:10px 18px;background:#222;color:#fff;border:0;cursor:pointer}.transcript p{margin:8px 0}@media print{button{display:none}body{margin:0}section{break-inside:auto}.stamp{print-color-adjust:exact}}
    </style></head><body><header><h1>Hanko change ledger</h1><p>Spoken judgment, bound to the exact diff. Local demonstration record.</p></header><button onclick="window.print()">Print ledger</button>${rows.length ? rows.map(row => {
      const stamp = ({ approved: '承認', conditional: '条件付', rejected: '却下', no_answer: '保留' })[row.decision] || '保留';
      const fields = { 'Proposal': row.proposal_id || row.change_id, 'Space': row.space === 'demo' ? 'Demo Studio rehearsal' : 'Workspace', 'Request': row.request_text, 'Facts': row.facts_summary, 'Decision': labels[row.decision] || 'No answer', 'Eligibility': row.eligibility || 'HELD', 'Final human confirmation': row.confirmation_quote || 'Not verified under the final-yes rule', 'Condition (verbatim)': row.condition_text || 'None', 'Open condition task': row.condition_task || 'None', 'Rationale (verbatim)': row.rationale_quote || 'Not recorded', 'Approver': row.approver, 'Recorded at': row.approved_at, 'Channel': row.channel === 'canned' ? 'SIMULATED — canned demonstration' : row.channel, 'Conversation ID': row.conversation_id || 'None', 'Diff hash': row.diff_hash, 'Full SHA-256': row.diff_sha256 || 'Not recorded', 'Matching test evidence': row.test_evidence_matched === true ? 'Verified against the exact diff SHA-256' : 'Not verified', 'Call started': row.started_at || 'Not recorded', 'Error': row.error || 'None' };
      return `<section><div class="stamp">${stamp}</div><h2>${escape(row.change_id)}</h2>${row.channel === 'canned' ? '<p class="simulated">SIMULATED APPROVAL · NOT A HUMAN SIGN-OFF</p>' : ''}<dl>${Object.entries(fields).map(([key, value]) => `<dt>${escape(key)}</dt><dd>${escape(value)}</dd>`).join('')}</dl><h3>Transcript</h3><div class="transcript">${(row.transcript || []).map(line => `<p><strong>${line.role === 'agent' ? 'Hanko' : escape(row.approver)}:</strong> ${escape(line.text)}</p>`).join('') || '<p>No transcript recorded.</p>'}</div><h3>Exact diff reviewed</h3><pre>${escape(row.diff_snapshot || 'No diff was available.')}</pre></section>`;
    }).join('') : '<p>No decisions recorded.</p>'}</body></html>`);
  popup.document.close();
  return true;
}

export function reset() {
  volatileRows = all().filter(row => row.channel !== 'canned');
  try { localStorage.setItem(KEY, JSON.stringify(volatileRows)); storageWarning = ''; }
  catch { storageWarning = 'Local storage is unavailable.'; }
}
