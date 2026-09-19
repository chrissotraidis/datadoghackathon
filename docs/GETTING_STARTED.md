# Running Hango locally

A local hackathon demonstration: request a legacy billing change, compute its
impact, inspect a proposed COBOL diff, call its named owner, and keep the spoken
decision with the exact diff. Conditional approval creates a visible open task
and keeps the change held. Nothing is merged or deployed by the app.

## Run

From this directory:

```sh
cp -n web/config.example.js web/config.js
python3 -m http.server 8000 --bind 127.0.0.1
```

Open http://127.0.0.1:8000/web/ in Chrome or Brave. Use **Use demo request** →
**Analyze request** → **Call the owner**. `1` fills the demo; `R` resets simulated
records when focus is outside a text field. Live decisions and locks survive
Reset demo. Print opens a separate printable ledger with transcript and diff.

No npm, bundler, framework, or application backend. Modules load static files.
Only browser voice mode dynamically loads the ElevenLabs SDK from esm.sh, with
jsDelivr as a fallback. Phone and canned modes do not load that dependency.

## Two dashboard spaces

- **Workspace** at `/web/` is the product view: requests, source impact, proposed
  edits, owner approval and saved decisions.
- **Demo Studio** at `/web/?view=demo` guides the hackathon rehearsal. Choose a
  channel, load/analyze the example, review its impact and edit, then use the
  three Tanaka-san responses beside the call button. Only that button dials.
- **Refresh or New rehearsal** prepares a new labeled review of the same fixed proposal.
  It never calls automatically. Studio receipts use a separate ledger and keep
  earlier rehearsals; the original Workspace receipt stays untouched. Each live
  rehearsal has its own one-call lock. Changing the Studio channel also prepares
  a new rehearsal and preserves previous receipts.
- Saved records expand directly to show the transcript, rationale, conversation
  ID, exact diff and test/hash evidence. Print provides a standalone copy.

## Appearance and preferences

The header theme selector offers System, Light and Dark across all three pages.
Settings at `/web/settings.html` also controls reduced motion, presenter cue
visibility and automatic scrolling to completed impact/decision steps.
Preferences persist in this browser and synchronize across its open tabs.
Restore display defaults preserves all records and call locks.

Settings can export Workspace and Studio records as JSON. The export selects
only receipt fields; it does not include local calling credentials. Check
connection reads agent and imported-number access without placing a call or
changing the voice configuration. See [VOICE-RESEARCH.md](../VOICE-RESEARCH.md)
for the voice review and preserved baseline.

## Configuration

`web/config.js` defines `window.HANGO` and is gitignored. Existing
`window.HANKO` configurations are still supported. Use your own restricted,
short-lived provider key; never publish this config or serve this checkout on
a public interface. This static hackathon app makes requests
from the browser, so the key is readable by anyone using that local page.

| Field | Purpose |
| --- | --- |
| `elevenKey` | ElevenLabs API key for outbound calls and conversation results |
| `agentId` | Hango caller agent ID |
| `phoneNumberId` | Imported Twilio number ID from ElevenLabs, not Twilio SID |
| `ownerPhone` | Your test mobile in E.164 format, such as `+1…` |
| `geminiKey` | Optional Google Gemini key; empty uses deterministic summary |
| `demoMode` | `canned`, `phone`, or `browser` |

- **canned:** a five-second simulated conversation. No network or microphone.
  The UI and print view explicitly mark it simulated, not human sign-off.
- **phone:** calls the configured owner via ElevenLabs/Twilio, polls conversation
  analysis, and stores the real transcript and decision. Requires all four
  ElevenLabs/phone settings. The demo policy allows calls 24/7, including after 20:00 JST.
- **browser:** uses your microphone with the same ElevenLabs agent. Conversation
  analysis still needs the API key; without it, the transcript remains held and
  no approval is inferred. Use localhost or HTTPS for microphone and Web Locks.

The configured agent uses six dynamic variables and three analysis fields:
`decision`, `condition_text`, `rationale_quote`. It reads every approval back and asks “Confirm approval?”
The app requires a fresh explicit confirmation after that question, such as
“Yes” or “I confirm approval.” Greeting yes, an initial
“approve it,” and ambiguous responses cannot approve. It then ends the conversation. Only exact recognized decisions count;
missing/ambiguous results remain held. No automated retries or backup calls are
implemented. A live attempt consumes the local one-call lock even if it fails.

## What is real

- Deterministic source/paragraph/reference analysis of the synthetic fixture:
  CALC-TAX, three jobs, 1,214 of 3,000 fictional customer records, 2009-04-01.
- Original and proposed programs compile and execute using installed GnuCOBOL.
  Without `cobc`, the runner explicitly labels Decimal arithmetic simulated.
- Devin CLI produced the proposed category-7 rate edit on `chg-0417`. Codex ran
  and verified the tests and committed it because the noninteractive Devin
  permission mode declined its test/commit shell calls.
- The proposal diff is exported from that unmerged branch. `test_result.json`
  includes commit IDs, full diff hash and actual validation output.
- The ledger snapshots the displayed diff and full SHA-256 before the call.
  It stores the transcript, exact condition, rationale, owner, time and channel.

## Demonstration boundaries

The only approvable request is category 7, 8% → 10%, effective 2027-04-01.
Other/defaulted requests may show impact but cannot approve the fixed proposal.
The COBOL fixture has no effective-date guard. Unconditional confirmation is labeled APPROVED / NOT DEPLOYED.
Conditional approval retains an open task and keeps release held. The app does not apply, merge,
delete, or deploy the proposal.

Ledger storage and call locks are local to this browser and origin. They are not
tamper-proof, cross-device authorization, identity verification, or an audit
compliance guarantee. A diff hash identifies content; it is not a signature.
No recorded voice is treated as biometric authentication. The optional Gemini
summary can fall back to a template and does not determine the impact or policy.

The fixture customers, owner personas and historical dates are synthetic.
Local planning notes, call recordings, transcripts and credentials must stay
out of Git. See [security and privacy guidance](../SECURITY.md).

## Validation

```sh
python3 mock/tests/test_rates.py
python3 mock/run.py
```

Open `/web/test-impact.html` for the 48-check impact suite and
`/web/test-call.html` for a canned call/duplicate-lock check. The latter's
**Run in configured mode** button initiates a real call when phone mode is set;
do not use it accidentally. See `VALIDATION.md` for current acceptance evidence.

Call diagnostics retain the latest ten attempts in this browser: call-stage times,
provider and recorded decisions, interrupted turns and available response-delay
metrics. Settings record export includes these diagnostics. Incomplete approval
confirmation is labeled Unconfirmed, not rejected. See [DEMO-REPAIR.md](../DEMO-REPAIR.md).

## Branding compatibility

Hango keeps the original `hanko.*` browser storage keys and internal theme
interface so existing receipts, preferences and one-call locks remain intact.
The local agent prompt is branded Hango. Existing hosted voice agents must be
updated separately using [agent/prompt.txt](../agent/prompt.txt); pulling source
does not change a hosted agent.
