#!/usr/bin/env bash
# Update GitHub Project items based on Apollo verification results.
# - Update Email field for each MKT row
# - Update Email Verified field (✅ when confirmed/corrected/replaced, ⚠️ otherwise)
# - Update item title where person was replaced (Alex Moore → Shane Karp)

set -euo pipefail

OWNER="${OWNER:-@me}"
TITLE="${TITLE:-FF Sales - Direct to Brand}"

PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" '.projects[] | select(.title==$t) | .number' | head -1)
PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')

FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
fid() { echo "$FIELDS" | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' | head -1; }
oid() { echo "$FIELDS" | jq -r --arg f "$1" --arg o "$2" '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id' | head -1; }

EMAIL_FIELD_ID=$(fid "Email")
VERIFIED_FIELD_ID=$(fid "Email Verified")
VERIFIED_TRUE_ID=$(oid "Email Verified" "✅ Apollo-verified")
VERIFIED_FALSE_ID=$(oid "Email Verified" "⚠️ Guess — verify")

ITEMS=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)

# Tuples: title_contains | new_email | verified (true/false) | title_rename (optional)
# Confirmed (email matches Apollo)
update() {
  local TITLE_MATCH="$1"
  local NEW_EMAIL="$2"
  local IS_VERIFIED="$3"

  local ITEM_ID
  ITEM_ID=$(echo "$ITEMS" | jq -r --arg t "$TITLE_MATCH" '.items[] | select(.content.title | contains($t)) | .id' | head -1)
  if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
    echo "⚠️  Not found: $TITLE_MATCH" >&2
    return
  fi

  set +e
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$EMAIL_FIELD_ID" --text "$NEW_EMAIL" >/dev/null 2>&1
  if [ "$IS_VERIFIED" = "true" ]; then
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --field-id "$VERIFIED_FIELD_ID" --single-select-option-id "$VERIFIED_TRUE_ID" >/dev/null 2>&1
  fi
  set -e

  echo "  $TITLE_MATCH → $NEW_EMAIL  (verified=$IS_VERIFIED)" >&2
  sleep 1
}

rename_item() {
  local TITLE_MATCH="$1"
  local NEW_TITLE="$2"
  local ITEM_ID
  ITEM_ID=$(echo "$ITEMS" | jq -r --arg t "$TITLE_MATCH" '.items[] | select(.content.title | contains($t)) | .content.id // .id' | head -1)
  if [ -z "$ITEM_ID" ] || [ "$ITEM_ID" = "null" ]; then
    echo "⚠️  Not found for rename: $TITLE_MATCH" >&2
    return
  fi
  set +e
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --title "$NEW_TITLE" >/dev/null 2>&1
  set -e
  echo "  rename: $TITLE_MATCH → $NEW_TITLE" >&2
}

# Confirmed
update "MKT #3 — Leslie Sanchez" "leslie@castelion.com" "true"
update "MKT #12 — Cindy Hofbauer" "cindy@flybyjing.com" "true"
update "MKT #30 — Jacqueline Barrett" "jacqueline@patrickta.com" "true"
update "MKT #14 — Lauren Murphy" "lauren@eatfishwife.com" "true"
update "MKT #4 — Neil Presicci" "neil.presicci@apexspace.com" "true"

# Corrected
update "MKT #7 — Alex Pearlman" "apearlman@varda.com" "true"
update "MKT #10 — Kelli Furrer" "k.furrer@slingshotaerospace.com" "true"
update "MKT #22 — Fred DePerez" "fred.deperez@harbingermotors.com" "true"

# Replaced — Epirus: rename + new email
rename_item "MKT #9 — Alex Moore — Epirus" "MKT #9 — Shane Karp — Epirus"
update "MKT #9" "shane.karp@epirusinc.com" "true"

echo "Done."
