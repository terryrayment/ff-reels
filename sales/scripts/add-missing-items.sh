#!/usr/bin/env bash
# Minimal resume: only ADD missing prospects, don't re-touch existing ones.
# Useful when the main setup-github-project.sh exhausted the GraphQL rate
# budget by re-validating every item.
#
# Pre-fetches once, computes diff, adds only what's missing, throttles 3s/item.
#
# Run: PATH="$HOME/.local/bin:$PATH" bash sales/scripts/add-missing-items.sh

set -euo pipefail

OWNER="${OWNER:-@me}"
TITLE="${TITLE:-F&F Sales — 60 Founder Outreach}"
PROSPECTS_JSON="$(cd "$(dirname "$0")" && pwd)/prospects.json"

command -v gh >/dev/null || { echo "ERROR: gh missing"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq missing"; exit 1; }
[ -f "$PROSPECTS_JSON" ] || { echo "ERROR: prospects.json missing"; exit 1; }

# Resolve project
PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" '.projects[] | select(.title==$t) | .number' | head -1)
[ -n "$PROJECT_NUMBER" ] || { echo "ERROR: project not found"; exit 1; }
PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')
echo "==> Project #$PROJECT_NUMBER ($(echo "$PROJECT_VIEW" | jq -r '.url'))"

# Fields (read once)
FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
fid() { echo "$FIELDS" | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' | head -1; }
oid() { echo "$FIELDS" | jq -r --arg f "$1" --arg o "$2" '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id' | head -1; }

STATUS_FIELD_ID=$(fid "Sales Status")
SECTOR_FIELD_ID=$(fid "Sector")
CITY_FIELD_ID=$(fid "City")
EMAIL_FIELD_ID=$(fid "Email")
VERIFIED_FIELD_ID=$(fid "Email Verified")
NOT_SENT_OPT=$(oid "Sales Status" "⬜ Not Sent")
VERIFIED_TRUE_ID=$(oid "Email Verified" "✅ Apollo-verified")
VERIFIED_FALSE_ID=$(oid "Email Verified" "⚠️ Guess — verify")

# Existing items (read once)
echo "==> Reading existing items..."
EXISTING=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)
EXISTING_TITLES=$(echo "$EXISTING" | jq -r '.items[].content.title // empty')
EXISTING_COUNT=$(echo "$EXISTING_TITLES" | grep -c "" || true)
echo "    Found $EXISTING_COUNT existing items"

# Loop over prospects, add only missing ones
COUNT=$(jq 'length' "$PROSPECTS_JSON")
ADDED=0
SKIPPED=0
for i in $(seq 0 $((COUNT-1))); do
  N=$(jq -r ".[$i].n" "$PROSPECTS_JSON")
  PERSON=$(jq -r ".[$i].person" "$PROSPECTS_JSON")
  COMPANY=$(jq -r ".[$i].company" "$PROSPECTS_JSON")
  TITLE_STR="#${N} — ${PERSON} — ${COMPANY}"

  # Skip if title already exists (prefix match handles em-dash variants)
  if echo "$EXISTING_TITLES" | grep -Fq "$TITLE_STR" \
     || echo "$EXISTING_TITLES" | grep -Eq "^#${N}[[:space:]]"; then
    SKIPPED=$((SKIPPED+1))
    continue
  fi

  CITY=$(jq -r ".[$i].city" "$PROSPECTS_JSON")
  SECTOR=$(jq -r ".[$i].sector" "$PROSPECTS_JSON")
  EMAIL=$(jq -r ".[$i].email" "$PROSPECTS_JSON")
  VERIFIED=$(jq -r ".[$i].verified" "$PROSPECTS_JSON")
  NOTE=$(jq -r ".[$i].note" "$PROSPECTS_JSON")

  BODY=$(cat <<EOF
**Company:** ${COMPANY}
**City:** ${CITY}
**Sector:** ${SECTOR}
**Email:** ${EMAIL}
**Note:** ${NOTE}

See [sales/INTROS.md](https://github.com/terryrayment/ff-reels/blob/sales/master-tracker/sales/INTROS.md) for the intro email draft.
EOF
)

  echo "    + [$N] $PERSON / $COMPANY"
  ITEM_ID=$(gh project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --title "$TITLE_STR" --body "$BODY" --format json | jq -r '.id')

  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$NOT_SENT_OPT" >/dev/null
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$SECTOR_FIELD_ID" --text "$SECTOR" >/dev/null
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$CITY_FIELD_ID" --text "$CITY" >/dev/null
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$EMAIL_FIELD_ID" --text "$EMAIL" >/dev/null
  if [ "$VERIFIED" = "true" ]; then
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --field-id "$VERIFIED_FIELD_ID" --single-select-option-id "$VERIFIED_TRUE_ID" >/dev/null
  else
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --field-id "$VERIFIED_FIELD_ID" --single-select-option-id "$VERIFIED_FALSE_ID" >/dev/null
  fi

  ADDED=$((ADDED+1))
  sleep 3
done

echo ""
echo "✅ Added $ADDED items, skipped $SKIPPED already-existing"
echo "    $(echo "$PROJECT_VIEW" | jq -r '.url')"
