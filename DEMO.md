# Hanko demo card

**The stamp for agents.** An AI proposes the code change; Hanko keeps the human judgment attached to it.

## Open the right space

Use **Demo Studio** at `http://127.0.0.1:8000/web/?view=demo` when presenting.
**Workspace** is the product view; Studio contains your presenter guidance.

1. Choose **Live phone call** or **Simulated conversation**. The visible mode is
   part of the demo; say which one you are using.
2. **New rehearsal** prepares the fixed example while keeping earlier receipts.
3. **Analyze request** → **Next: review the edit** → **Next: prepare the call**.
4. Read the Tanaka-san cue card, then press **Call my phone** when ready to answer.
   In simulated mode the button says **Start simulated call**.
5. Give the condition and confirm its readback. Wait for the agent to end.
6. Show the held decision; open **Read transcript & evidence** in its ledger row.

A fresh rehearsal is a separate demo review of the same proposal, with its own
one-call lock. It never clears Workspace history or dials automatically.

## 45-second table demo

Use the verified canned path to demonstrate conditional approval. Introduce the mode once:
“This billing data is fictional, and this approval conversation is simulated.”
The current live session already has a No answer / HELD receipt from voicemail; show that result rather than calling again or clearing its lock.

| Time | Action | Say |
| --- | --- | --- |
| 0–7s | Point to Hanko. | “An AI can edit an old billing system. The person who understands it still needs to judge the change. Hanko keeps that judgment.” |
| 7–14s | **Use demo request** → **Analyze request**. | “Category seven: tax goes from eight to ten percent next April.” |
| 14–22s | Point to impact. | “One tax paragraph, three referencing jobs, 1,214 affected customers. Those facts come from the files.” |
| 22–28s | Show the diff. | “Devin wrote the edit. The compiled COBOL tests pass.” |
| 28–37s | **Call the owner**; let the simulated transcript finish. | “The owner adds a condition: check rounding on invoices under one hundred yen.” |
| 37–45s | Point to HELD, condition and diff hash. | “That condition keeps it held. The record ties the exact words to this diff. Nothing is deployed.” |

Pause while the result appears. Finish on the condition and its record, not on configuration.

## Two-minute stage script

**0:00–0:20 — problem**
“Imagine a billing system that one person knows better than the documentation. An AI can propose a change, but the hard part is still getting that person's judgment—and keeping the reason behind it.”

**0:20–0:35 — product and mode**
“Hanko means the stamp. It checks the impact, presents the change, asks the named owner, and keeps the answer with the exact diff. This is fictional billing data with a simulated approval.”
If showing an accepted live recording, replace the final sentence: “This is a recorded live rehearsal; I played the owner, and the business data is fictional.”

**0:35–1:05 — show request, impact, proposal**
“Category-seven tax changes from eight to ten percent. Hanko reads the source and customer fixture: one tax paragraph, three referencing jobs, 1,214 affected records. This summary is a template built from those facts. Devin wrote the edit. The compiled COBOL tests pass.”

**1:05–1:40 — show decision and record**
“The owner adds a condition: check rounding on small invoices. Hanko reads it back, then keeps the exact words, the reason, who was asked, the time, the transcript, and the diff hash. The change stays held until the condition is addressed.”

**1:40–2:00 — close**
“The useful result is the judgment attached to the code. Our real call reached voicemail, so Hanko recorded no answer and kept it held. A human's conditional approval through the app is the remaining live gate.”
Once human approval is verified, replace the final sentence: “We can show the source, executed tests, and a human decision preserved with the exact proposal.”

## Live conversation cue card

For a future authorized human-approval rehearsal; do not reuse the completed voicemail attempt. Allow extra time for connection and processing.
Introduce it once: “The billing data is fictional; this is a live agent conversation. I’m playing the system owner.”

1. When asked whether now is okay: “Yes, go ahead.”
2. When asked for a decision: “I approve, with one condition. Check the rounding on invoices under 100 yen. Small invoices always caused trouble in 2009.”
3. After the readback: “Yes, that is right.”
4. Wait for goodbye, automatic end and the app's completed ledger row.

## Internal rehearsal notes

- Open `http://127.0.0.1:8000/web/?view=demo`; confirm mode, proposal hash **3ae78ec9**, matched test evidence and fresh modules. Use typed/demo input unless speech recognition has been rehearsed.
- Live policy hours are **09:00–20:00 JST**, excluding 20:00. The planned stage starts at 20:00; use saved evidence/video or labeled simulation then. Do not weaken the hours.
- One live attempt consumes its local lock. Reset clears canned evidence only; it preserves live records/locks. If a live attempt exists, show its receipt rather than retrying or clearing storage.
- All outcomes remain held for release: the fixture has no effective-date guard, and Hanko has no deployment operation. JCL files are counted references, not executed scheduler jobs.
- Gemini and request speech recognition remain optional/unaccepted. The verified summary is a deterministic template. A failed summary needs no stage recovery.
- Dashboard text rehearsal passed automatic end after a prompt-only fix. This proves agent behavior, not phone transport or human approval. Successful test: `conv_3401m2sz1ma9f0q8p8ja6z601rkn`.
- Real phone transport, app polling and safe no-answer recording passed: voicemail said “Please leave a message after the tone,” the agent ended after no response, and the phone-channel transcript/full diff hash were saved as No answer / HELD. No human approved.
- Extraction returned `conditional` and the verbatim rationale. One run included the rationale sentence inside `condition_text` too. Keep the full transcript visible; do not claim perfect sentence separation.
- If a call fails, say “The change is held,” show the error, then use the saved receipt/video. No automatic retries or backup-owner calls are implemented.
- Exact provenance and limits are in [README.md](README.md), [VALIDATION.md](VALIDATION.md), and [PRD.md](PRD.md). Devin authored the edit; Codex independently tested and committed it.
- Before claiming live human approval: verify app → answering owner → confirmed conditional readback → agent end → completed analysis → saved matching transcript/diff. This remains pending. Record one backup and time the full run.
