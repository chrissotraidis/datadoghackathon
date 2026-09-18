# Voice reliability review · 18 September 2026

The working ElevenLabs agent was preserved. This pass made no agent updates,
model changes, prompt changes, or outbound calls.

The private baseline snapshot records Flash v2, speed 1.0, stability 0.5,
similarity 0.8, a 12-second turn timeout, normal turn eagerness, a 45-second
silence end-call timeout, and a four-minute maximum conversation.
The existing approval readback and explicit final-yes rule remain in force.

## Findings

[ElevenLabs voice customization](https://elevenlabs.io/docs/eleven-agents/customization/voice)
supports speaking-speed adjustment. The current speed is already the default;
there is no measured evidence from this pass that changing it improves the demo.

[Expressive Mode](https://elevenlabs.io/docs/eleven-agents/customization/voice/expressive-mode)
uses Eleven v3 Conversational and a context-sensitive turn-taking system.
It can adapt emotional delivery and timing, but adopting it changes the current
speech model. The docs also note variation across voices and languages.
It was not enabled on the working agent.

If voice experimentation resumes, compare a separate candidate with the saved
baseline using the same questions, interruption, long condition, and final yes.
Measure whether the owner finishes speaking, whether the condition is verbatim,
and whether approval waits for the final confirmation. A more expressive sound
alone is not a reliability result. Keep the candidate away from the active demo
until a spoken rehearsal passes. This is a proposed evaluation, not completed
acceptance or a claim that a different model is better.

## Delivered in the app

- Presenter cues invite an impact question before the decision.
- Conversation stages reflect actual call status events.
- Settings checks agent access, extraction fields and imported-number access
  using read-only requests. It never changes the agent or dials the recipient.
- Preferences control theme, reduced motion, cue visibility, and automatic
  scrolling without modifying approval policy or existing receipts.
