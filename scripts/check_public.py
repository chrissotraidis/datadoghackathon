"""Check the tracked working tree without printing sensitive matched values.

This complements Gitleaks; it is not a general personal-data classifier.
"""
from pathlib import Path
import re
import subprocess
import sys

ROOT = Path(__file__).resolve().parents[1]
PATHS = subprocess.check_output(
    ['git', 'ls-files', '-z'], cwd=ROOT
).decode().split('\0')
PATTERNS = {
    'provider account identifier': r'\b(?:conv|agtvrsn|agent|phnum)_[a-z0-9]{16,}\b',
    'credential': r'\b(?:sk-[A-Za-z0-9_-]{20,}|sk_[A-Za-z0-9]{30,}|AIza[\w-]{30,}|gh[pousr]_[A-Za-z0-9]{25,})\b',
    'private key': r'-----BEGIN (?:RSA |EC |OPENSSH )?PRIVATE KEY-----',
    'local home path': r'/(?:Users|home)/[A-Za-z0-9_.-]+/',
    'email address': r'[\w.+-]+@[\w.-]+\.[A-Za-z]{2,}',
    'phone number': r'(?<!\w)\+[1-9][0-9 ()-]{8,18}[0-9]',
}

def problems(path, text):
    parts = Path(path).parts
    if (path in {'web/config.js', 'PLAN.md'} or
        any(p in {'work', 'private', 'recordings', 'transcripts'} for p in parts) or
        (Path(path).name.startswith('.env') and Path(path).name != '.env.example') or
        Path(path).suffix in {'.pem', '.key'} or
        re.search(r'-records-.*\.json$', path)):
        yield 'private file path', 0
    for label, pattern in PATTERNS.items():
        for match in re.finditer(pattern, text):
            value = match.group()
            # Reserved example domains and NANP fictional 555-01xx numbers only.
            if label == 'email address' and value.split('@')[-1] in {'example.com', 'example.org', 'example.net', 'users.noreply.github.com'}:
                continue
            if label == 'phone number' and re.fullmatch(r'\+120255501\d{2}', value):
                continue
            yield label, text[:match.start()].count('\n') + 1

def main():
    findings = []
    count = 0
    for path in filter(None, PATHS):
        file = ROOT / path
        if not file.is_file():
            continue
        count += 1
        text = file.read_bytes().decode('utf8', 'replace')
        findings.extend((path, label, line) for label, line in problems(path, text))
    for path, label, line in findings:
        print(f'FAIL {path}:{line}: {label} (value withheld)')
    if not findings:
        print(f'PASS: {count} tracked files; no blocked private paths or patterns.')
    return bool(findings)

if __name__ == '__main__':
    sys.exit(main())
