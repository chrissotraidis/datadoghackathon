const API = 'https://api.elevenlabs.io/v1/convai';
const PREFIX = 'hanko.called.';
const activeCalls = new Set();
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));
const string = value => typeof value === 'string' ? value : '';

export function alreadyCalled(id) {
  try { return activeCalls.has(id) || localStorage.getItem(PREFIX + id) !== null; }
  catch { return true; } // Without durable storage, do not risk a duplicate call.
}

function sanitize(value, config) {
  let text = typeof value === 'string' ? value : JSON.stringify(value, (key, item) =>
    /key|token|authorization|phone|to_number/i.test(key) ? '[redacted]' : item);
  for (const secret of [config.elevenKey, config.geminiKey, config.ownerPhone]) {
    if (secret) text = text.split(secret).join('[redacted]');
  }
  return text.replace(/\+\d[\d ()-]{7,}\d/g, '[phone redacted]');
}

function checkHours(hours) {
  const match = string(hours).match(/^(\d{2}):(\d{2})-(\d{2}):(\d{2})\s+JST$/);
  if (!match) throw new Error('Policy: owner hours must use HH:MM-HH:MM JST.');
  const [, h1, m1, h2, m2] = match.map(Number);
  if (h1 > 23 || h2 > 23 || m1 > 59 || m2 > 59) throw new Error('Policy: invalid owner hours.');
  const now = new Date(Date.now() + 9 * 60 * 60 * 1000);
  const minute = now.getUTCHours() * 60 + now.getUTCMinutes();
  const start = h1 * 60 + m1, end = h2 * 60 + m2;
  const open = start < end ? minute >= start && minute < end : start > end && (minute >= start || minute < end);
  if (!open) throw new Error(`Policy: outside owner hours (${hours}). Change is on hold.`);
}

function validateEvidence(policy, impact) {
  const known = value => string(value).trim() && !/^(unknown|unassigned|n\/a)$/i.test(value.trim());
  const date = string(impact?.last_changed?.date);
  const validDate = /^\d{4}-\d{2}-\d{2}$/.test(date) && Number.isFinite(Date.parse(date))
    && new Date(date).toISOString().slice(0, 10) === date;
  if (!known(policy?.owner) || !known(impact?.paragraph?.name)
    || !Number.isInteger(impact?.definition?.line) || impact.definition.line < 1
    || !validDate || !known(impact?.last_changed?.by)
    || !Number.isInteger(impact?.total_records) || impact.total_records < 1
    || !Number.isInteger(impact?.affected_records) || impact.affected_records < 0
    || impact.affected_records > impact.total_records)
    throw new Error('Approval held: verified source definition, paragraph, change history, customer counts and named owner are required.');
}

async function reserve(id, live) {
  const take = () => {
    if (alreadyCalled(id)) throw new Error('Policy: one call per change. Reset to call again.');
    const token = `${new Date().toISOString()}:${Math.random().toString(36).slice(2)}`;
    localStorage.setItem(PREFIX + id, token);
    activeCalls.add(id);
    return token;
  };
  if (globalThis.navigator?.locks) return navigator.locks.request(PREFIX + id, take);
  if (live) throw new Error('Live calls require a browser with Web Locks on localhost or HTTPS.');
  return take();
}

async function releaseUnattempted(id, token) {
  const release = () => {
    if (localStorage.getItem(PREFIX + id) === token) localStorage.removeItem(PREFIX + id);
    activeCalls.delete(id);
  };
  try {
    if (globalThis.navigator?.locks) await navigator.locks.request(PREFIX + id, release);
    else release();
  } catch { activeCalls.delete(id); } // Storage failure retains the durable guard.
}

async function bounded(promise, ms, message) {
  let timer;
  try {
    return await Promise.race([promise, new Promise((_, reject) => {
      timer = setTimeout(() => reject(new Error(message)), ms);
    })]);
  } finally { clearTimeout(timer); }
}

function transcript(rows) {
  return Array.isArray(rows) ? rows.filter(row => row && (row.role === 'agent' || row.role === 'user'))
    .map(row => ({ role: row.role, text: string(row.message ?? row.text) })).filter(row => row.text) : [];
}

function extract(data) {
  const fields = data.analysis?.data_collection_results || {};
  const raw = string(fields.decision?.value).trim().toLowerCase();
  const condition_text = string(fields.condition_text?.value).trim();
  const rationale_quote = string(fields.rationale_quote?.value).trim();
  // Only an explicit enum can approve: "not approved", questions and prose all hold.
  let decision = ['approved', 'conditional', 'rejected', 'no_answer'].includes(raw) ? raw : 'no_answer';
  if (decision === 'approved' && condition_text) decision = 'conditional';
  if (decision === 'conditional' && !condition_text) decision = 'no_answer';
  const userText = transcript(data.transcript).filter(row => row.role === 'user').map(row => row.text).join(' ');
  if (decision === 'approved' && /\b(not approved|do not approve|don't approve|cannot approve|can't approve|unsure|not sure|i reject)\b/i.test(userText)) decision = 'no_answer';
  return { decision, condition_text, rationale_quote,
    error: decision === 'no_answer' ? 'No unambiguous approval decision was captured. Change is on hold.' : null };
}

async function api(path, body, config, log, timeout = 15000) {
  const controller = new AbortController();
  const timer = setTimeout(() => controller.abort(), timeout);
  const method = body ? 'POST' : 'GET';
  log('request', { method, url: API + path, body });
  try {
    const response = await fetch(API + path, { method, signal: controller.signal,
      headers: { 'xi-api-key': config.elevenKey, ...(body ? { 'Content-Type': 'application/json' } : {}) },
      ...(body ? { body: JSON.stringify(body) } : {}) });
    const text = await response.text();
    log('response', { status: response.status, body: text });
    if (!response.ok) throw new Error(`ElevenLabs HTTP ${response.status}: ${text.slice(0, 400)}`);
    return JSON.parse(text);
  } finally { clearTimeout(timer); }
}

async function poll(id, config, emit, result, log) {
  const deadline = Date.now() + 240000;
  while (Date.now() < deadline) {
    const data = await api('/conversations/' + encodeURIComponent(id), null, config, log,
      Math.max(1, Math.min(15000, deadline - Date.now())));
    if (Array.isArray(data.transcript)) {
      result.transcript = transcript(data.transcript);
      emit('transcript', result.transcript.slice());
    }
    if (data.status === 'done') return Object.assign(result, extract(data));
    if (data.status === 'failed') throw new Error('The approval conversation failed. Change is on hold.');
    emit(data.status === 'in-progress' ? 'in_call' : data.status === 'processing' ? 'processing' : 'ringing');
    await delay(Math.min(3000, Math.max(0, deadline - Date.now())));
  }
  throw new Error('No final decision after four minutes. Change is on hold; the call will not be retried.');
}

async function browserCall(config, variables, emit, result, log) {
  let conversation, expired = false, disconnected = false, finish;
  const ended = new Promise(resolve => { finish = resolve; });
  const endQuietly = session => Promise.resolve(session.endSession()).catch(() => {});
  try {
    const sdk = await bounded(import('https://esm.sh/@elevenlabs/client'), 15000, 'SDK load timed out.')
      .catch(() => bounded(import('https://cdn.jsdelivr.net/npm/@elevenlabs/client/+esm'), 15000, 'SDK load timed out.'));
    const mic = navigator.mediaDevices.getUserMedia({ audio: true }).then(stream => {
      stream.getTracks().forEach(track => track.stop());
    });
    await bounded(mic, 30000, 'Microphone permission timed out.');
    checkHours(config.ownerHours);
    log('request', { mode: 'browser', agentId: config.agentId, dynamicVariables: variables });
    result.attempted = true;
    const pending = sdk.Conversation.startSession({ agentId: config.agentId, dynamicVariables: variables,
      onMessage: message => {
        if (expired) return;
        log('response', { mode: 'browser', message });
        const role = message.role || (message.source === 'ai' ? 'agent' : message.source);
        result.transcript.push(...transcript([{ role, message: message.message }]));
        emit('transcript', result.transcript.slice());
      },
      onStatusChange: state => { if (!expired && state.status === 'connected') emit('in_call'); },
      onDisconnect: () => { disconnected = true; finish(null); },
      onError: () => finish('Browser conversation failed. Change is on hold.')
    });
    pending.then(session => { if (expired) endQuietly(session); }, () => {});
    conversation = await bounded(pending, 30000, 'Browser connection timed out.');
    result.conversation_id = conversation.getId();
    const error = await bounded(ended, 240000, 'Browser conversation exceeded four minutes.');
    if (error) throw new Error(error);
    emit('processing');
    if (!config.elevenKey) throw new Error('No API key: transcript retained, but the decision is unverified and on hold.');
    if (!result.conversation_id) throw new Error('Browser session returned no conversation ID.');
    return await poll(result.conversation_id, config, emit, result, log);
  } finally {
    expired = true;
    if (conversation && !disconnected) await bounded(endQuietly(conversation), 3000, 'Disconnect timed out.').catch(() => {});
  }
}

async function canned(request, emit, result) {
  result.attempted = true;
  const lines = [
    { role: 'agent', text: 'This is Hanko calling about the billing change. Do you approve it?' },
    { role: 'user', text: 'Approved, but check the rounding on invoices under 100 yen.' },
    { role: 'user', text: 'Small invoices always caused trouble in 2009.' },
    { role: 'agent', text: 'Recorded as conditional. Thank you.' }
  ];
  emit('dialing'); await delay(500); emit('ringing'); await delay(500); emit('in_call');
  for (const line of lines) {
    await delay(500); result.transcript.push(line); emit('transcript', result.transcript.slice());
  }
  emit('processing'); await delay(1000);
  return Object.assign(result, { conversation_id: 'canned-' + request.id, decision: 'conditional',
    condition_text: lines[1].text, rationale_quote: lines[2].text });
}

export async function requestApproval(input = {}) {
  const { policy, request, impact, config = {}, onStatus } = input || {};
  const result = { conversation_id: null, channel: ['phone', 'browser', 'canned'].includes(config?.demoMode) ? config.demoMode : 'canned',
    decision: 'no_answer', attempted: false, condition_text: '', rationale_quote: '', transcript: [],
    started_at: new Date().toISOString(), ended_at: '', error: null };
  const emit = (status, rows) => { try { onStatus?.(status, rows); } catch { /* UI errors must not cause redial. */ } };
  const log = (kind, value) => console.log('[Hanko call]', kind, sanitize(value, config || {}));
  let reserved = false;
  try {
    emit('policy');
    if (!request?.id || !request.text || !policy?.owner || !impact?.paragraph?.name || !Array.isArray(impact.jobs) || !impact.last_changed?.date || !string(impact.summary).trim() || !Number.isFinite(impact.affected_records))
      throw new Error('Missing request, owner or impact details.');
    validateEvidence(policy, impact);
    if (policy.requires_call !== true) throw new Error('Policy: this change does not require an owner call.');
    if (!['phone', 'browser', 'canned'].includes(config?.demoMode)) throw new Error('Set demoMode to phone, browser or canned.');
    const live = config.demoMode !== 'canned';
    if (live && !string(config.agentId).trim()) throw new Error('Missing ElevenLabs agentId.');
    if (config.demoMode === 'phone') {
      if (!string(config.elevenKey).trim() || !string(config.phoneNumberId).trim()) throw new Error('Missing ElevenLabs API key or phoneNumberId.');
      if (!/^\+[1-9]\d{7,14}$/.test(config.ownerPhone || '')) throw new Error('Set ownerPhone to a valid E.164 phone number.');
      if (policy.owner_phone && !policy.owner_phone.startsWith('env:') && policy.owner_phone !== config.ownerPhone)
        throw new Error('Policy: configured phone does not match the named owner.');
    }
    if (live) checkHours(policy.hours);
    if (config.demoMode === 'browser' && !globalThis.navigator?.mediaDevices?.getUserMedia) throw new Error('Browser microphone requires localhost or HTTPS.');
    const variables = { owner_name: policy.owner, requester: 'Chris', change_id: request.id, change_title: `${request.text}`,
      facts_short: `${impact.paragraph.name} paragraph; ${impact.jobs.length} nightly jobs; ${impact.affected_records} customers; last changed ${impact.last_changed.date}`,
      impact_summary: impact.summary };
    reserved = await reserve(request.id, live);
    if (config.demoMode === 'canned') await canned(request, emit, result);
    else if (config.demoMode === 'browser') {
      emit('dialing'); await browserCall({ ...config, ownerHours: policy.hours }, variables, emit, result, log);
    } else {
      checkHours(policy.hours); emit('dialing');
      result.attempted = true;
      const response = await api('/twilio/outbound-call', { agent_id: config.agentId,
        agent_phone_number_id: config.phoneNumberId, to_number: config.ownerPhone,
        conversation_initiation_client_data: { dynamic_variables: variables } }, config, log);
      result.conversation_id = string(response.conversation_id) || null;
      if (response.success === false || !result.conversation_id) throw new Error('Outbound call was not accepted or returned no conversation ID.');
      emit('ringing'); await poll(result.conversation_id, config, emit, result, log);
    }
  } catch (error) {
    result.decision = 'no_answer';
    result.error = sanitize(error?.message || 'Approval call failed. Change is on hold.', config || {});
    result.rationale_quote ||= result.error;
  } finally {
    if (reserved && !result.attempted) await releaseUnattempted(request.id, reserved);
    else if (reserved) activeCalls.delete(request.id);
    result.ended_at = new Date().toISOString();
    emit('done');
  }
  log('decision', result);
  return result;
}
