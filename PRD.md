# Hanko execution PRD

Status: implementation and evidence snapshot, 18 September 2026. This narrows
the original Notion plan in `PLAN.md` to the MVP actually built. See
[README.md](README.md) for operation, [VALIDATION.md](VALIDATION.md) for checks,
and [DEMO.md](DEMO.md) for the spoken demo.

## Outcome and user

A maintainer proposes a billing change. The person who understands the system
hears its scope, gives a decision and explains any condition. Hanko keeps that
judgment with the exact proposed diff. Success is a traceable decision and a
clear hold state; Hanko does not deploy the change.

The demonstration uses a fictional billing system and fictional customer data.
Tanaka-san is the named owner in the scenario; a presenter role-plays that owner.
It is not a production authorization or verified identity system.

## Fixed MVP

| Step | Implemented behavior | Acceptance |
| --- | --- | --- |
| Request | Type, use the demo sentence, or optionally use browser speech recognition. Rule parser displays category, rates, effective date and any defaults. | Only complete category 7, 8% → 10%, effective 2027-04-01 can approve the fixed `CHG-0417` proposal. Other requests may be analyzed but remain blocked. |
| Impact | Exact-token search across the six loaded legacy source files; source definition and paragraph lines; distinct referencing JCL files; category count from CSV; history from the fixture metadata. | `CALC-TAX` lines 38–50; definition line 18; five references; three jobs; 1,214/3,000 records; history 2009-04-01. Missing evidence stays visibly unknown. |
| Summary | Deterministic two-sentence template; optional Gemini can rewrite supplied facts with a timeout and fallback. | Facts and policy never depend on Gemini. Current verified demo uses the template. |
| Change | Display the proposal diff and test output; snapshot diff and full SHA-256 before the approval attempt. | Proposal evidence refers to the same diff hash. Baseline remains on `main`; proposed code remains unmerged on `chg-0417`. |
| Policy | Named owner; tax/rate/record triggers; live-call hours 09:00–20:00 JST; local one-call reservation. | Preflight rejection places no call. Duplicate attempts cannot place another live call. No automatic retries or backup calls. |
| Conversation | ElevenLabs phone or browser conversation, or clearly labeled canned simulation. Read back the condition before accepting confirmation. | Extract recognized decision, verbatim condition and rationale; end the conversation; ambiguity or missing confirmation stays held. |
| Record | Local ledger saves request, facts, owner, time, channel, transcript, condition task, rationale, conversation ID, exact diff and hash. Printable copy includes the evidence. | Conditional means HELD with an open condition. Reloading a proposal cannot alter the recorded diff. Reset removes canned records and preserves live evidence/locks. |

All outcomes remain held for release in this MVP. The proposed COBOL code has
no effective-date guard, and Hanko has no merge or deployment operation.

## Evidence and remaining gates

| Gate | Status | Exact evidence / remaining acceptance |
| --- | --- | --- |
| Deterministic impact | PASS | Expanded fixture and real-file browser suite: 48/48, including explicit date, invalid-date and fractional-rate regressions. The original 33 checks had no console warnings/errors. |
| Real COBOL execution | PASS | Baseline and proposal compile/run with GnuCOBOL over all 3,000 rows. A 99-yen category-7 invoice rounds to 8 yen before and 10 yen after. Other category totals remain unchanged. |
| Change provenance | PASS | Devin CLI authored the edit. Codex independently ran validation and committed it because Devin's noninteractive shell permissions declined test/commit calls. Proposal commit `620f933cce11de09984ea9e673505addbecd1444`; exported diff hash starts `3ae78ec9`. |
| Local application flow | PASS | Impact → proposal → canned conditional decision → HELD ledger row; duplicate and mismatch checks; simulated reset preservation. This is not a human sign-off. |
| ElevenLabs text behavior | PASS after fix | Initial rehearsal extracted correctly but did not end. A prompt-only closing fix was published; the second text rehearsal ended automatically and extracted `conditional`. |
| Extraction fidelity | Verified with variation | Both rehearsals preserved the rounding condition and rationale verbatim. One `condition_text` included the rationale sentence too; keep the full transcript and separate rationale visible rather than claiming exact sentence segmentation. |
| App → phone → human → ledger | PENDING | Presenter receives the call, confirms the readback, agent ends, app polls the same conversation and saves its exact decision/transcript/hash once. Dashboard text preview does not satisfy this gate. |
| Browser voice fallback | PENDING | Microphone session through the app, confirmed decision extraction and automatic end. |
| Speech request / Gemini | PENDING, optional | Browser speech recognition and a live Gemini response have not been accepted. Typed input and template summary are the verified defaults. |
| Show readiness | PENDING | Time one full rehearsal; record a backup; verify the visible mode, proposal hash and retained receipt; submit the hackathon entry separately. |

The successful synthetic text test is
[conversation conv_3401m2sz1ma9f0q8p8ja6z601rkn](https://elevenlabs.io/app/agents/history/conv_3401m2sz1ma9f0q8p8ja6z601rkn/details),
using published version `agtvrsn_4301m2sz0thrfq7s24tsa84w3hfc`.
No microphone or outbound phone call was used for that acceptance.

## Real, simulated, and deliberately absent

- **Real computation:** source analysis, customer counting, actual GnuCOBOL
  execution, proposal content and hash, local storage and printable receipt.
- **Synthetic inputs:** COBOL business scenario, customer records, historical
  date, named owner persona and the scripted condition.
- **Simulated approval:** canned mode. **Live model but synthetic participation:**
  automated dashboard text rehearsal. Neither establishes spoken human approval.
- **Pending live acceptance:** phone and browser voice through the application.
- **Absent:** deployment, future-date enforcement in COBOL, automatic condition
  resolution, retries, backup-owner escalation, cross-device locks, secure
  server-side secrets, identity verification and tamper-proof audit storage.

## Finish without widening scope

1. Complete one real approval rehearsal inside the owner's hours, capture the
   result, and retain it. The planned 20:00 stage slot is outside the current
   live-call window; use a saved live receipt/video or a labeled simulation.
2. Show matched test evidence only when its SHA-256 equals the displayed diff;
   a generic passing JSON flag is not proof for a newly reloaded proposal.
3. Keep the final condition, HELD state, channel and short diff hash together
   on screen; make the printable transcript/diff the natural final proof.

These are the remaining refinements, not permission to add another workflow.
Keep static browser ES modules, no framework/build step/backend, and code files
under 300 lines. Do not change published acceptance status until evidence exists.
