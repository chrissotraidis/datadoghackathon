# Hanko validation · 18 September 2026

## Verified locally

- Original fixture commit: `f6c2733`.
- Proposed change commit: `620f933cce11de09984ea9e673505addbecd1444` on unmerged
  `chg-0417`. Devin authored the edit; Codex independently tested and committed.
- Both baseline and proposal compile with GnuCOBOL and execute all 3,000 rows.
  Baseline category-7 total tax: 43,426,201 yen. Proposal: 54,282,813 yen.
  Other category totals are unchanged. A 99-yen category-7 invoice rounds to
  8 yen before and 10 yen after the proposal.
- Impact browser suite: **48/48 PASS**, zero warnings/errors. Finds source
  definition line 18, CALC-TAX lines 38–50, five source references, three jobs,
  1,214/3,000 records and history date 2009-04-01.
- Call browser canned test: **PASS**, about four seconds, streamed transcript,
  conditional result, duplicate prevention, zero warnings/errors.
- Mocked network checks: preflight config/policy/hours, concurrent duplicate
  reservation, safe decision extraction, API redaction, SDK fallback, microphone
  cleanup, four-minute polling limit, and no-key browser hold.
- Full UI browser run: real impact and proposed diff → simulated conditional
  decision → one HELD ledger row with transcript, rationale, condition task,
  diff snapshot and SHA-256. Duplicate blocked; mismatched request blocked;
  reset clears canned records and preserves live evidence.
- Desktop and 390px mobile layout inspected; no document overflow. Print HTML
  includes escaped transcript and exact diff; native print dialog not asserted.

- Independent integration regression: **43/43 PASS** in browser with isolated
  storage and mocked network; explicit dates/fractional rates preserve their
  values, incomplete source evidence prevents dialing, and setup failures release
  only unattempted reservations. Missing owner transcript cannot establish a
  decision. Studio/Workspace ledgers are isolated and Studio reset retains live
  rehearsals. Zero application console errors.
- Authenticated browser API readiness: **PASS** for agent access, all three
  extraction fields, and imported Twilio number. This verifies browser CORS.

## Guided dashboard verification

- Workspace and Demo Studio are separate views with a shared review engine.
- Studio browser run: select simulated channel → analyze example → review edit →
  prepare conversation → simulated conditional decision → exact-hash HELD receipt.
- New rehearsal preserves prior receipts, creates a distinct review ID and does
  not dial. Workspace still shows its original real phone No answer record.
- Saved transcript and exact diff are readable from each ledger record.
- Studio layout checked at 390px; no horizontal document overflow.

## ElevenLabs setup

- Hanko caller created and published with six dynamic variables, structured
  extraction fields and end-conversation tool.
- Restricted one-day demo key saved only in gitignored local config; API read
  checks confirm agent and imported Twilio number accessible.
- First dashboard text rehearsal extracted **conditional**, condition
  **Check the rounding on invoices under 100 yen.**, and rationale
  **Small invoices always caused trouble in 2009.**
- That first rehearsal needed manual end; a prompt-only fix was published and
  re-tested. The second conversation ended automatically with the end-call tool.
  The second condition included the rationale sentence too, still verbatim.
  These are automated text rehearsals, not spoken human acceptance.

## Real phone run through the app

- **PASS: outbound phone transport, app polling and safe no-answer recording.**
  The call reached voicemail: “Please leave a message after the tone.” The
  agent ended after no response. The app recorded **No answer / HELD**, channel
  **phone**, and retained the transcript with the exact proposal's full SHA-256:
  `3ae78ec9e2eff58ec42ce5b63752779f3a4b92ccbf2103e20e51cd9e0103dee4`.
- No human answered or approved the proposal. This live failure-path evidence
  is separate from the canned conditional flow and dashboard text rehearsals.
  Preserve this ledger row and its one-call lock; no further live calls were
  made as part of this documentation update.

## Remaining acceptance

- Spoken human conditional approval through the app: the owner hears the
  impact, confirms the readback, the agent ends, and the app preserves the
  completed conditional decision and transcript against the same diff.
- Live browser microphone conversation and request speech recognition.
- Optional live Gemini summary (currently deterministic template).
- Backup demo video and hackathon submission are not completed by these tests.
