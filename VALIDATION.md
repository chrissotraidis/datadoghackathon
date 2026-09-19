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

- Independent integration regression: **55/55 PASS** in browser with isolated
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

## Final confirmation fix · 19:35 JST

- The user's live call completed and produced an approval, but the old prompt
  accepted “Approve it” before a mandatory readback. Its original receipt remains
  preserved and is labeled as not checked under the final-yes rule.
- The revised published agent asks one question
  per turn, invites a question, reads the decision back, and waits for a fresh
  explicit yes. Silence timeout is 12 seconds; maximum call length is 4 minutes.
- A live-model text simulation answered a customer-impact question, preserved
  the condition/rationale, asked the final confirmation, received “Yes, I confirm,”
  extracted conditional and invoked end_call with the correct closing message.
- App-side transcript check separately requires yes after the final question.
  Greeting yes, initial approve it, okay, missing answer, incomplete interrupted readback,
  revised condition and later withdrawal stay held. Both conditional and plain
  approval require this check. 55/55 isolated browser regressions pass.
- Spoken acceptance of the revised version remains the final human check.

- A second live-model simulation reproduced the reported “Approve it” trigger.
  The agent now asked its final confirmation, waited for a fresh “Yes,” and only
  then extracted approved. Both model transcripts pass the app confirmation
  check; the original human call correctly fails that new rule.
- Updated complete canned Studio flow passed with a visible final-confirmation
  quote, conditional-approval receipt, retained prior records and no console errors.

## Takeover integration and Settings fixes · 18 September, 20:03 JST

- Integrated the previously unfinished theme, preferences and Settings files.
  Workspace now has the same next-step guidance as Studio, with an explanation
  of policy-based owner escalation and section-by-section instructions.
- Corrected Settings navigation markup that overlapped labels, and corrected
  its Studio link from `?view=demo` to `./?view=demo`.
- Browser checks: light/dark themes, mobile 390px Settings and Studio layouts,
  preference persistence after reload, cross-tab theme/cue updates, restoring
  display defaults while retaining a receipt, export action, and Settings →
  Studio navigation. No application console warnings or errors were observed.
- Full Studio simulated flow passed: source impact → exact tested edit →
  conversation → conditional/HELD receipt with final yes and diff `3ae78ec9`.
  The call button was disabled after recording the decision.
- Existing isolated safety regressions: **55/55 PASS**. Impact suite:
  **48/48 PASS**. Python fixture tests passed with GnuCOBOL.
- Read-only connection check passed for agent access, extraction fields and
  imported number. A separate GET comparison against the private pre-polish
  snapshot confirmed `conversation_config` and `platform_settings` unchanged.
- No outbound phone call or live microphone session was made in this pass.
  Revised-agent spoken human acceptance remains separate and pending.

## Anytime demo calling

The user requested unrestricted demo hours. The fixture policy now explicitly
uses `24/7`, which the shared phone/browser call preflight accepts. Existing
restricted-hour policies still enforce their configured window. Browser
regressions pass **59/59**, including mocked phone approval at 20:30, midnight,
and 08:59 JST. The app displays `24/7`; no live call was placed by this check.
