#!/usr/bin/env python3
"""Parse INTROS.md into a JSON map of {prospect_number: full_email_text}.

Run from repo root:
  python3 sales/scripts/parse-intros.py > sales/scripts/email-drafts.json
"""
import re
import json
import sys
from pathlib import Path

INTROS = Path(__file__).resolve().parent.parent / "INTROS.md"
md = INTROS.read_text()

# Sections start with "### N. Name, Company" and end at next "### " or "---"
parts = re.split(r'^### (\d+)\.\s+(.+?)\n', md, flags=re.M)
# parts is [pre, n1, header1, body1, n2, header2, body2, ...]
emails = {}
for i in range(1, len(parts), 3):
    n = int(parts[i])
    body = parts[i + 2]
    # Strip trailing horizontal rule and following batch headers
    body = re.split(r'^---\s*$', body, flags=re.M)[0].strip()
    emails[n] = body

print(json.dumps(emails, ensure_ascii=False, indent=2))
print(f"# Parsed {len(emails)} emails", file=sys.stderr)
