#!/usr/bin/env bash
# Add West Coast marketing leads as items in the FF Sales project board.
# Companion to add-missing-items.sh (which handles founders).
#
# Run: bash sales/scripts/add-marketing-leads-to-project.sh

set -euo pipefail

OWNER="${OWNER:-@me}"
TITLE="${TITLE:-FF Sales - Direct to Brand}"
LEADS_JSON="$(cd "$(dirname "$0")" && pwd)/marketing-leads.json"

command -v gh >/dev/null || { echo "ERROR: gh missing"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq missing"; exit 1; }
[ -f "$LEADS_JSON" ] || { echo "ERROR: marketing-leads.json missing"; exit 1; }

PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" '.projects[] | select(.title==$t) | .number' | head -1)
[ -n "$PROJECT_NUMBER" ] || { echo "ERROR: project not found"; exit 1; }
PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')
echo "==> Project #$PROJECT_NUMBER" >&2

FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
fid() { echo "$FIELDS" | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' | head -1; }
oid() { echo "$FIELDS" | jq -r --arg f "$1" --arg o "$2" '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id' | head -1; }

STATUS_FIELD_ID=$(fid "Status")
SECTOR_FIELD_ID=$(fid "Sector")
CITY_FIELD_ID=$(fid "City")
EMAIL_FIELD_ID=$(fid "Email")
VERIFIED_FIELD_ID=$(fid "Email Verified")
NOT_CONTACTED_OPT=$(oid "Status" "Not Contacted")
VERIFIED_FALSE_ID=$(oid "Email Verified" "⚠️ Guess — verify")

echo "==> Reading existing items..." >&2
EXISTING=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)
EXISTING_TITLES=$(echo "$EXISTING" | jq -r '.items[].content.title // empty')

COUNT=$(jq 'length' "$LEADS_JSON")
ADDED=0
SKIPPED=0
for i in $(seq 0 $((COUNT-1))); do
  N=$(jq -r ".[$i].n" "$LEADS_JSON")
  PERSON=$(jq -r ".[$i].person" "$LEADS_JSON")
  COMPANY=$(jq -r ".[$i].company" "$LEADS_JSON")
  TITLE_STR="MKT #${N} — ${PERSON} — ${COMPANY}"

  if echo "$EXISTING_TITLES" | grep -Fq "$TITLE_STR"; then
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  CITY=$(jq -r ".[$i].city" "$LEADS_JSON")
  SECTOR=$(jq -r ".[$i].sector" "$LEADS_JSON")
  EMAIL=$(jq -r ".[$i].email" "$LEADS_JSON")
  ROLE=$(jq -r ".[$i].title" "$LEADS_JSON")
  TIER=$(jq -r ".[$i].tier" "$LEADS_JSON")
  NOTE=$(jq -r ".[$i].note" "$LEADS_JSON")

  BODY=$(printf '%s\n' \
    "**Marketing-lead second contact** (founder still in row #${N})." \
    "" \
    "**Company:** ${COMPANY}" \
    "**Title:** ${ROLE}" \
    "**City:** ${CITY}" \
    "**Sector:** ${SECTOR}" \
    "**Email (guess):** ${EMAIL}" \
    "**Tier:** ${TIER}" \
    "**Note:** ${NOTE}" \
    "" \
    "Email is a pattern guess. Verify in Apollo before sending." \
    "See sales/MARKETING-LEADS.md in the ff-reels repo.")

  echo "    + MKT [$N] $PERSON / $COMPANY" >&2
  ITEM_ID=$(gh project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --title "$TITLE_STR" --body "$BODY" --format json | jq -r '.id')

  set +e
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$NOT_CONTACTED_OPT" >/dev/null 2>&1
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$SECTOR_FIELD_ID" --text "$SECTOR" >/dev/null 2>&1
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$CITY_FIELD_ID" --text "$CITY" >/dev/null 2>&1
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$EMAIL_FIELD_ID" --text "$EMAIL" >/dev/null 2>&1
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$VERIFIED_FIELD_ID" --single-select-option-id "$VERIFIED_FALSE_ID" >/dev/null 2>&1
  set -e

  ADDED=$((ADDED+1))
  sleep 3
done

echo "" >&2
echo "✅ Added $ADDED items, skipped $SKIPPED already-existing" >&2
echo "    $(echo "$PROJECT_VIEW" | jq -r '.url')" >&2
