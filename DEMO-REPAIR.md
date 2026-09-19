# Demo conversation repair · 18 September 2026

The reported phone call connected and completed. ElevenLabs extracted approved;
the app held the result because the last confirmation question was interrupted
before it completed. Several earlier turns were also interrupted. The old
No answer label obscured this distinction. Historical receipts are retained.

The recorded provider timing shows a median 1.08 seconds and maximum 3.17 seconds
from detected silence to first audio. The model's median first-token time was
0.19 seconds. These measurements describe the reported call, not a benchmark of
the revised configuration; repeated interrupted explanations also prolonged it.

Changes:
- Refreshing Demo Studio starts a new review, clears current input/state and
  retains previous receipts. It never automatically calls.
- The agent uses a short readback and “Confirm approval?” It asks again if the
  question was cut off, and clarifies a bare no rather than calling it rejection.
- Turn eagerness is patient, allowing the caller to finish a correction. This
  trades a little turn-taking speed for fewer premature replies. The voice,
  speech model, language model, connection settings and timeouts are unchanged.
- Hanko recognizes both the short and older complete confirmation questions.
  A new explicit yes is still required; interrupted questions, new conditions,
  and withdrawal remain held. No past receipt was reclassified as approved.
- Records show Unconfirmed and retain the provider decision, local outcome,
  interrupted turns and available response timing. The latest ten attempt
  diagnostics survive refresh and are included in Settings export.

Verification: 64/64 isolated browser regressions passed. Two live-model text
simulations passed: corrected “No, I mean I approve” followed by a fresh final yes
produced approved; explicit rejection produced rejected. Both invoked end_call.
Refresh checks retained the ledger, changed the review ID, reset the call count
and enabled a new call after analysis. No phone call was placed for these tests.
A spoken room/phone rehearsal is still needed to assess actual audio recognition
and perceived timing; text simulations do not establish that acceptance.

Configuration guidance: [ElevenLabs conversation flow](https://elevenlabs.io/docs/eleven-agents/customization/conversation-flow).

## Explicit confirmation wording fix

A later call said “I confirm approval” after the full confirmation question.
The voice agent correctly approved it, but the app incorrectly required the
literal prefix “yes”. The checker now accepts explicit confirmation phrases,
including “I confirm approval”, “I confirm”, and “I approve the change”.
Negations, questions, qualifications and changed conditions still do not confirm.
Unconditional approval is now shown as APPROVED / NOT DEPLOYED, and the agent
says owner approval is complete. Deployment is a separate action that this demo
does not perform. Conditional approvals still retain their open condition.
