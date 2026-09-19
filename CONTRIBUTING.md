# Contributing to Hanko

Keep changes focused and use the existing visual styles. There is no build step
or package manager for the frontend. Start with the [local setup](docs/GETTING_STARTED.md).

Before opening a pull request:

1. Run `python3 scripts/check_public.py` and `python3 mock/tests/test_rates.py`.
2. For JavaScript changes, run `node --check` on changed modules and exercise
   `/web/test-regression.html` and `/web/test-impact.html` in the local browser.
3. Recheck affected buttons and both light and dark themes. Use simulation;
   automated tests must never dial a real number.
4. Explain what changed, how you tested it, and any remaining acceptance limits.

Preserve existing receipts and one-call locks. Keep the existing `hanko.*` storage keys intact.
Never interpret greeting consent as approval or a conditional decision as release.

`chg-0417` is an intentionally unmerged **demo proposal**, not a maintenance
branch. Do not merge it into `main`: baseline source and displayed diff must keep
matching their test evidence.

Use only synthetic examples. Keep `web/config.js`, `.env` files, local planning
notes, screenshots with personal data, real transcripts and recordings out of
Git and public issues. See [SECURITY.md](SECURITY.md).
