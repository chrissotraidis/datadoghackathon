# Hanko contracts

All modules are browser ES modules. No backend. Paths are relative to web/.
Mock files are fetched from ../mock/.

## Request
{ id: "CHG-0417", text: string, field: "TAX-RATE-CAT7", category: 7,
  from: "0.08", to: "0.10", effective: "2027-04-01", parsed_with_defaults: boolean }

## Impact
{ field: string,
  paragraph: { name: string, file: "billing.cbl", start_line: number, end_line: number },
  definition: { file: string, line: number },
  references: [ { file: string, line: number, text: string } ],
  jobs: [ string ],
  affected_records: number, total_records: number,
  last_changed: { date: string, by: string },
  summary: string, summary_source: "gemini" | "template" }

## PolicyCheck
{ module: "billing.cbl", owner: string, owner_phone: string, backup: string,
  hours: string, channel: "phone", tripped: [ string ], requires_call: boolean }

## Decision
{ conversation_id: string | null, channel: "phone" | "browser" | "canned",
  decision: "approved" | "conditional" | "rejected" | "no_answer",
  condition_text: string, rationale_quote: string,
  transcript: [ { role: "agent" | "user", text: string } ],
  started_at: string, ended_at: string, error: string | null }

## LedgerRow
{ change_id: string, request_text: string, facts_summary: string, diff_hash: string,
  decision: string, condition_text: string, approver: string, approved_at: string,
  conversation_id: string | null, channel: string }

## Module interfaces
lib/mockdata.js   export async function loadMock() -> Mock
                  Mock = { files: { [relpath]: string }, customers: [ { customer_id, name, category, monthly_amount } ],
                           policy: object, lastChanged: object, diff: string | null, testResult: object | null }
lib/impact.js     export function parseRequest(text) -> Request
                  export async function analyze(request, mock, geminiKey) -> Impact
                  export function checkPolicy(request, impact, mock.policy) -> PolicyCheck
lib/call.js       export async function requestApproval({ policy, request, impact, config, onStatus }) -> Decision
                  export function alreadyCalled(change_id) -> boolean
lib/ledger.js     export function append(row); export function all(); export function render(el); export function printView(); export function reset()
app.js            wires REQUEST -> IMPACT -> CHANGE -> CALL -> LEDGER

## Dynamic variables sent to the ElevenLabs agent (both phone and browser)
{ owner_name, requester: "Chris", change_id, change_title, facts_short, impact_summary }
change_title  = `${request.text}`
facts_short   = `${impact.paragraph.name} paragraph; ${impact.jobs.length} nightly jobs; ${impact.affected_records} customers; last changed ${impact.last_changed.date}`
impact_summary = impact.summary

## Config (web/config.js, gitignored)
window.HANKO = { elevenKey, agentId, phoneNumberId, ownerPhone, geminiKey, demoMode: "phone" | "browser" | "canned" }

## Rules
- Every module works in demoMode "canned" with no keys.
- One approval call per change_id, ever. call.js enforces it with localStorage key hanko.called.<change_id>.
- Never throw to the UI. Return decision "no_answer" with error set.
- Files under 300 lines. No frameworks. No build step.
