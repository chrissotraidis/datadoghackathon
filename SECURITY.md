# Security and privacy

Hanko is an experimental local demo. Run it on `127.0.0.1`, not a public network
interface. Browser calling uses a local API key that anyone with access to the
page can read; this architecture is not suitable for a public live-call deployment.

## Keep private data local

- Copy `web/config.example.js` to the ignored `web/config.js` and supply your own
  restricted credentials only for live testing. Never commit keys or recipients.
- Customer rows, owner names and history in `mock/` are synthetic fixtures.
- Actual calls send the recipient and change context to the configured voice
  provider. Browser microphone mode sends audio to that provider. Optional Gemini
  summarization sends source-impact context to Google. Simulation calls neither.
- Receipts and diagnostic exports can contain speech, names, conversation IDs,
  conditions and code. Treat them as private and review before sharing.
- `.gitignore` prevents common accidental additions; it does not redact exports
  or remove anything already committed. Run the repository check before pushing.

## Report a sensitive finding

Use GitHub's **Security → Report a vulnerability** on this repository for private
reports. Do not post the secret or private transcript in an issue or pull request.
Provide a file path, affected commit and description without reproducing the value.

If a key was exposed, revoke or rotate it at the provider. Deleting the current
file alone does not revoke access or erase Git history, forks, caches or downloads.
Coordinate any necessary history cleanup with the repository owner.

## Automated checks

GitHub secret scanning and push protection are enabled. The repository workflow
runs Gitleaks over fetched Git history and a lightweight check of tracked paths,
provider account IDs, contact details and common credential formats. These reduce
accidental publication; they do not prove the absence of every kind of personal data.
