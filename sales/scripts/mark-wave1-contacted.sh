#!/usr/bin/env bash
# Mark the 10 wave-1 founder outreach items as Contacted (2026-06-10),
# and append the custom pitch-page link to each item body.

set -euo pipefail

OWNER="${OWNER:-@me}"
TITLE="${TITLE:-FF Sales - Direct to Brand}"
CONTACT_DATE="2026-06-10"

PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" '.projects[] | select(.title==$t) | .number' | head -1)
PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')

FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
fid() { echo "$FIELDS" | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' | head -1; }
oid() { echo "$FIELDS" | jq -r --arg f "$1" --arg o "$2" '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id' | head -1; }

STATUS_FIELD_ID=$(fid "Status")
DATE_FIELD_ID=$(fid "Contact Date")
CONTACTED_OPT=$(oid "Status" "Contacted")

ITEMS=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)

# "title fragment|slug" pairs for wave 1
WAVE1=(
  "Chris Power — Hadrian|hadrian"
  "Brandon Tseng — Shield AI|shield-ai"
  "Tom Mueller — Impulse Space|impulse"
  "JoeBen Bevirt — Joby|joby"
  "Bill Shufelt — Athletic Brewing|athletic"
  "Ben Goodwin — Olipop|olipop"
  "Gabi Lewis — Magic Spoon|magic-spoon"
  "Andrew Benin — Graza|graza"
  "Shiza Shahid — Our Place|our-place"
  "Matt Taylor — Tracksmith|tracksmith"
)

for entry in "${WAVE1[@]}"; do
  FRAGMENT="${entry%%|*}"
  SLUG="${entry##*|}"
  LINK="https://reels.friendsandfamily.tv/${SLUG}"

  ITEM_JSON=$(echo "$ITEMS" | jq -c --arg t "$FRAGMENT" '
    .items[] | select((.content.title // "") | contains($t)) | select((.content.title // "") | startswith("MKT") | not)' | head -1)
  if [ -z "$ITEM_JSON" ]; then
    echo "⚠️  Not found: $FRAGMENT" >&2
    continue
  fi

  ITEM_ID=$(echo "$ITEM_JSON" | jq -r '.id')
  DRAFT_ID=$(echo "$ITEM_JSON" | jq -r '.content.id // empty')
  TITLE_STR=$(echo "$ITEM_JSON" | jq -r '.content.title')
  BODY=$(echo "$ITEM_JSON" | jq -r '.content.body // ""')

  set +e
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$CONTACTED_OPT" >/dev/null 2>&1
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$DATE_FIELD_ID" --date "$CONTACT_DATE" >/dev/null 2>&1
  if [ -n "$DRAFT_ID" ] && ! echo "$BODY" | grep -q "$LINK"; then
    NEW_BODY=$(printf '%s\n\n**Custom pitch page:** %s\n**Emailed:** %s (wind-up format, draft cued in terry@friendsandfamily.tv)\n' "$BODY" "$LINK" "$CONTACT_DATE")
    gh project item-edit --id "$DRAFT_ID" --body "$NEW_BODY" >/dev/null 2>&1
  fi
  set -e

  echo "  ✓ $TITLE_STR → Contacted $CONTACT_DATE + $LINK" >&2
  sleep 1
done

echo "Done." >&2
