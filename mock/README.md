# Demonstration billing system

Synthetic legacy fixture with 3,000 fictional customers, exactly 1,214 in category 7. Run `python3 mock/run.py` from the project root: when GnuCOBOL is installed it compiles and executes billing.cbl for every invoice, otherwise it clearly labels Decimal arithmetic as simulated. Whole-yen tax uses half-up rounding. The copybook mirrors the inline table for dependency analysis; it is not included twice in the program. No effective-date field exists: a proposed rate change must remain held until its effective date.
