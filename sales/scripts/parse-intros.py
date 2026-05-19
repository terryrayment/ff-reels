#!/usr/bin/env python3
"""Parse INTROS.md into a JSON map of {prospect_number: full_email_text}."""
import re, json, sys

md = open("sales/INTROS.md").read()
# Each prospect section starts with "### N. Name, Company" and ends at next "### " or "---"
sections = re.split(r'^### (\d+)\.\s+(.+?)\n', md, flags=re.M)
# sections is [pre, n1, header1, body1, n2, header2, body2, ...]
emails = {}
for i in range(1, len(sections), 3):
    n = int(sections[i])
    header = sections[i+1].strip()
    body = sections[i+2]
    # Strip trailing horizontal rule and following batch headers
    body = re.split(r'^---\s*$', body, flags=re.M)[0]
    # Strip leading/trailing whitespace
    body = body.strip()
    emails[n] = body

print(json.dumps(emails, ensure_ascii=False, indent=2))
print(f"# Parsed {len(emails)} emails", file=sys.stderr)
