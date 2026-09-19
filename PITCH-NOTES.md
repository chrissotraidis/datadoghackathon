# Hango: presenter notes

Read-aloud copy: [PITCH.txt](PITCH.txt). Present the existing Demo Studio as the
visual sequence: impact → proposed edit → policy and named owner → conversation
→ decision record. No slide deck is required for this two-minute walkthrough.

## The claim to land

**Experienced developers can step back from daily maintenance while remaining
available for critical decisions in the systems they know.**

In this fictional scenario, Tanaka-san is a former employee who maintained the
COBOL billing system for years. After retiring, he stays involved as a retained
technical adviser. The current team uses AI to prepare changes, while company
policy names Tanaka as the approver for critical tax changes in his area.
His decision, conditions and reasoning are captured with the exact proposal,
so the current team can retain that context.

This is an advisory role agreed with the company, not an assumption that retired
staff remain responsible or can be contacted indefinitely. It is a proposed use
case, not a claim about a universal Japanese employment practice. In the app,
“owner” means the named reviewer in the policy; the prototype does not infer
responsibility automatically from Git history or manage adviser contracts.

The accountability point still matters: passing tests does not authorize a
business change. The company defines which decisions need Tanaka's approval.
Voice makes that consultation practical; the decision record preserves its value
for the next maintainer. The product does not guarantee that his judgment is
correct or that all undocumented knowledge will be captured.

## Short answers to the objections

- **Why involve a person?** The company chooses which decisions it delegates.
  In this example, its policy reserves tax changes for a named owner. Tests
  establish implementation behavior; they do not establish business permission.
  Hango does not argue that every AI action needs a phone call.
- **Why not hire someone else?** You can. The replacement still needs the
  reasoning behind earlier decisions. Tanaka can advise on critical changes
  while the new team takes over daily work. Each recorded conversation helps
  the new team inherit context; Hango complements that handover.
- **What if AI gets better?** Better implementation can support wider delegation.
  Companies still choose that scope. Hango's proposed role is to handle decisions
  outside it and preserve who authorized the exception. The prototype demonstrates
  one fixed billing proposal, not a general autonomous permissions engine.
- **Is this just an approval workflow?** It is a focused approval workflow for
  agent-proposed changes: explain measured impact, discuss conditions by voice,
  confirm the decision, and attach it to an exact diff. Approval workflows already
  exist; the pitch should demonstrate this interaction rather than claim novelty
  for human approval itself.
- **Why voice?** It lets the owner ask questions and explain conditions in a short
  conversation. The useful part is the captured reasoning. Do not claim that
  everyone prefers voice or that voice verifies identity.
- **Doesn't Tanaka still have to work?** Yes, in the limited advisory role he has
  agreed to. The proposed benefit is selective consultation instead of daily
  maintenance. It does not require a retiree to remain available around the clock.

## Source and wording

NTT Data Business Brains surveyed 221 Japanese IT practitioners on 17–18 April
2026; results were published on 19 May. 59.8% reported the possibility of some
subsystems/tools becoming inoperable if a particular veteran left suddenly;
15.6% reported the possibility of multiple important systems stopping. Combined:
**75.4%**. This measures reported risk, not actual outages or impending retirements
at 75% of Japanese companies.

[Original survey](https://prtimes.jp/main/html/rd/p/000000030.000103389.html).

One statistic is enough for the spoken pitch. More numbers will not answer the
question of why a business owner should authorize this change.

## Demo handling and claim limits

- Devin CLI prepared the rate edit and test updates before the presentation.
  Its test/commit shell calls were blocked by noninteractive permissions; Codex
  independently compiled, tested and committed the proposal. The app displays
  that prepared diff; it does not invoke Devin live when you analyze a request.
- Use the PITCH.txt call lines for a live rehearsal. For recorded evidence, replace
  the call introduction with: “Here's a recorded call, with me playing Tanaka.”
  For canned mode: “Here's a simulated call with Tanaka.” Let its transcript
  play instead of pretending to answer a live agent.
- Rehearse the whole run. The time budget is a target, not a measured live runtime.
  If connection or analysis takes longer, use a timed recording. If no decision
  arrives, say: “There's no confirmed approval, so the change stays held.”
- The rounding condition illustrates how conditions are captured. The fixture
  tests already cover a 99-yen invoice. Do not claim this call discovered a new
  bug or proved that a human outperformed the test suite.
- This MVP keeps local decision records and holds release. It neither merges nor
  deploys, and it cannot prevent someone deploying outside Hango. Do not describe
  it as an enforced production deployment gate, legal transfer of liability,
  tamper-proof audit trail, identity verification, or compliance certification.
- A production gate is a next step: integrate the decision with the deployment
  workflow, authenticated approvers and shared durable storage. That is future
  work, not part of this presentation change.
