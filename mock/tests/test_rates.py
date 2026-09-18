"""Verify source rates, mirrored copybook, and actual whole-yen rounding."""
from pathlib import Path
from decimal import Decimal
import csv
import re
import sys

sys.path.insert(0, str(Path(__file__).resolve().parents[1]))
from run import ROOT, read_rates, tax, execute

rates = read_rates()
assert len(rates) == 8
assert rates[7] == Decimal('0.08')
copybook = (ROOT / 'copybooks/rates.cpy').read_text()
for category, rate in rates.items():
    assert re.search(rf'TAX-RATE-CAT{category}\s+PIC 9V99 VALUE {rate}\.', copybook)
invoices = [(7, 99), (7, 6), (7, 7), (1, 100), (8, 900000)]
actual, engine = execute(invoices)
expected = [tax(amount, rates[cat]) for cat, amount in invoices]
assert actual == expected, (actual, expected)
assert actual[0] == 8
assert actual[1:3] == [0, 1]
with (ROOT / 'customers.csv').open() as handle:
    customers = list(csv.DictReader(handle))
assert len(customers) == 3000
assert sum(c['category'] == '7' for c in customers) == 1214
print(f'PASS: 8 rates, copybook parity, 5 invoice checks ({engine}), 3000 customers / 1214 category 7')
