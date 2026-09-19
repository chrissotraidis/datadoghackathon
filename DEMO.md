# Hango demo card

**Accountability for AI changes.** Passing tests does not authorize a business change. Hango connects company policy, a named owner and a decision record tied to the exact proposal.

**The scenario:** Tanaka-san maintained this billing system before retiring.
The company retains him as a technical adviser for critical changes in his area.
AI prepares the edit; company policy names him as the approver. Hango captures
his decision and reasoning so the current team keeps the context.

## Open the right space

Use **Demo Studio** at `http://127.0.0.1:8000/web/?view=demo` when presenting.
**Workspace** is the product view; Studio contains your presenter guidance.

1. Choose **Live phone call** or **Simulated conversation**. The visible mode is
   part of the demo; say which one you are using.
2. **New rehearsal** prepares the fixed example while keeping earlier receipts.
3. **Analyze request** → **Next: review the edit** → **Next: prepare the call**.
4. Read the Tanaka-san cue card, then press **Call my phone** when ready to answer.
   In simulated mode the button says **Start simulated call**.
5. Answer naturally; you can ask which customers are affected. Give the condition,
   then wait for “Do you confirm approval of this change?” and say **“Yes, I confirm.”** Wait for the agent to end.
6. Show the held decision; open **Read transcript & evidence** in its ledger row.

A fresh rehearsal is a separate demo review of the same proposal, with its own
one-call lock. It never clears Workspace history or dials automatically.

## 45-second table demo

Use the verified canned path to demonstrate conditional approval. Introduce the mode once:
“This billing data is fictional, and this approval conversation is simulated.”
The current live session already has a No answer / HELD receipt from voicemail; show that result rather than calling again or clearing its lock.

| Time | Action | Say |
| --- | --- | --- |
| 0–7s | Point to Hango. | “Tanaka has retired. AI prepares the edits; he stays on as an adviser for critical decisions.” |
| 7–14s | **Use demo request** → **Analyze request**. | “Category seven: tax goes from eight to ten percent next April.” |
| 14–22s | Point to impact. | “One tax paragraph, three referencing jobs, 1,214 affected customers. Those facts come from the files.” |
| 22–28s | Show the diff. | “Devin prepared this edit. Codex independently compiled and tested it.” |
| 28–37s | **Call the owner**; let the simulated transcript finish. | “The owner adds a condition: check rounding on invoices under one hundred yen.” |
| 37–45s | Point to HELD, condition and diff hash. | “That condition keeps it held. The record ties the exact words to this diff. Nothing is deployed.” |

Pause while the result appears. Finish on the condition and its record, not on configuration.

## Two-minute stage script

Read [PITCH.txt](PITCH.txt) for the complete, conversational script with call cues.
Use [PITCH-NOTES.md](PITCH-NOTES.md) for the verified statistic, short answers to
“why a human?” / “why not hire someone?” and the demo's claim boundaries.

- **0:00–0:35:** One retirement-risk statistic, then introduce Tanaka: retired
  maintainer, retained adviser, consulted on critical changes while AI prepares edits.
- **0:35–0:55:** Show the billing impact, Devin's edit, matching tests, and the
  policy requiring the named owner's approval.
- **0:55–1:40:** Let the voice conversation carry the demo. Give the condition;
  wait for the final approval question before saying “Yes, I confirm.”
- **1:40–2:00:** Show Tanaka's confirmation, condition, rationale and exact change.
  Close on stepping back from daily work while passing context to the next team.

This is a target budget; time the actual rehearsal. Introduce a recording or
simulation explicitly if using one. The rounding example demonstrates condition
capture; tests already cover the 99-yen case, so do not claim discovery of a bug.

## Live conversation cue card

For a future authorized human-approval rehearsal; do not reuse the completed voicemail attempt. Allow extra time for connection and processing.
Introduce it once: “The billing data is fictional; this is a live agent conversation. I’m playing Tanaka, the retired maintainer retained as an adviser.”

1. When asked whether now is okay: “Yes, go ahead.”
2. When asked for a decision: “I approve, with one condition. Check the rounding on invoices under 100 yen. Small invoices always caused trouble in 2009.”
3. After the readback: “Yes, I confirm.”
4. Wait for goodbye, automatic end and the app's completed ledger row.

## Internal rehearsal notes

- Open `http://127.0.0.1:8000/web/?view=demo`; confirm mode, proposal hash **3ae78ec9**, matched test evidence and fresh modules. Use typed/demo input unless speech recognition has been rehearsed.
- Demo calls are available **24/7**, including after 20:00 JST. Use **New rehearsal** for a fresh attempt; previous receipts stay saved.
- One live attempt consumes its local lock. Reset clears canned evidence only; it preserves live records/locks. If a live attempt exists, show its receipt rather than retrying or clearing storage.
- All outcomes remain held for release: the fixture has no effective-date guard, and Hango has no deployment operation. JCL files are counted references, not executed scheduler jobs.
- Gemini and request speech recognition remain optional/unaccepted. The verified summary is a deterministic template. A failed summary needs no stage recovery.
- Dashboard text rehearsal passed automatic end after a prompt-only fix. This proves agent behavior, not phone transport or human approval.
- Real phone transport, app polling and safe no-answer recording passed: voicemail said “Please leave a message after the tone,” the agent ended after no response, and the phone-channel transcript/full diff hash were saved as No answer / HELD. No human approved.
- Extraction returned `conditional` and the verbatim rationale. One run included the rationale sentence inside `condition_text` too. Keep the full transcript visible; do not claim perfect sentence separation.
- If a call fails, say “The change is held,” show the error, then use the saved receipt/video. No automatic retries or backup-owner calls are implemented.
- Exact provenance and limits are in [README.md](README.md), [VALIDATION.md](VALIDATION.md), and [PRD.md](PRD.md). Devin authored the edit; Codex independently tested and committed it.
- Before claiming live human approval: verify app → answering owner → confirmed conditional readback → agent end → completed analysis → saved matching transcript/diff. This remains pending. Record one backup and time the full run.
