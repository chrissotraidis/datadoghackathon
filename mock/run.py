"""Run the synthetic billing fixture with real COBOL when available."""
from pathlib import Path
from decimal import Decimal, ROUND_HALF_UP
import csv
import re
import shutil
import subprocess
import tempfile

ROOT = Path(__file__).resolve().parent


def read_rates():
    return {int(n): Decimal(rate) for n, rate in re.findall(
        r'TAX-RATE-CAT(\d)\s+PIC\s+9V99\s+VALUE\s+(\d\.\d{2})',
        (ROOT / 'billing.cbl').read_text())}


def tax(amount, rate):
    return int((Decimal(amount) * rate).quantize(Decimal('1'), rounding=ROUND_HALF_UP))


def execute(invoices):
    """Returns (taxes, engine); compiler errors are failures, never hidden."""
    compiler = shutil.which('cobc')
    if not compiler:
        rates = read_rates()
        return [tax(amount, rates[cat]) for cat, amount in invoices], 'simulated'
    with tempfile.TemporaryDirectory(prefix='hanko-cobol-') as tmp:
        binary = str(Path(tmp) / 'billing')
        subprocess.run([compiler, '-x', '-o', binary, str(ROOT / 'billing.cbl')],
                       check=True, capture_output=True, text=True)
        data = ''.join(f'{cat} {amount:09d}\n' for cat, amount in invoices) + 'END\n'
        result = subprocess.run([binary], input=data, text=True, capture_output=True,
                                check=True, timeout=20)
        rows = result.stdout.strip().splitlines()
        if len(rows) != len(invoices):
            raise RuntimeError('COBOL output count does not match input')
        return [int(line.split(',')[1]) for line in rows], 'GnuCOBOL'


def main():
    with (ROOT / 'customers.csv').open() as handle:
        customers = list(csv.DictReader(handle))
    invoices = [(int(c['category']), int(c['monthly_amount'])) for c in customers]
    results, engine = execute(invoices)
    totals = {n: 0 for n in range(1, 9)}
    for (cat, _), amount in zip(invoices, results):
        totals[cat] += amount
    print(f'Engine: {engine}; invoices: {len(invoices)}')
    for cat, amount in totals.items():
        print(f'Category {cat}: {amount} yen tax')


if __name__ == '__main__':
    main()
