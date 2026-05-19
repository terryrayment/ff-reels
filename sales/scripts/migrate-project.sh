#!/usr/bin/env bash
# One-shot migration to apply the requested project changes:
#   1. Rename project → "FF Sales - Direct to Brand"
#   2. Add new "Status" field with simpler options (Not Contacted, Contacted, ...)
#   3. Add "Contact Date" date field
#   4. Add any missing prospects (up to 60)
#   5. For every item: write full email draft into body, set new Status = Not Contacted
#
# Leaves the original "Sales Status" + "Email Verified" fields alone —
# user can hide or delete them from the UI.
#
# Pre-fetches once. Throttles 2s/item. Designed to fit in a single 5000-call
# GraphQL budget.
#
# Run: PATH="$HOME/.local/bin:$PATH" bash sales/scripts/migrate-project.sh

set -euo pipefail

OWNER="${OWNER:-@me}"
NEW_TITLE="FF Sales - Direct to Brand"
OLD_TITLE="F&F Sales — 60 Founder Outreach"
HERE="$(cd "$(dirname "$0")" && pwd)"
PROSPECTS_JSON="$HERE/prospects.json"
EMAILS_JSON="$HERE/email-drafts.json"

command -v gh >/dev/null || { echo "ERROR: gh missing"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq missing"; exit 1; }
[ -f "$PROSPECTS_JSON" ] || { echo "ERROR: prospects.json missing"; exit 1; }
[ -f "$EMAILS_JSON" ] || {
  echo "ERROR: email-drafts.json missing. Run: python3 sales/scripts/parse-intros.py > sales/scripts/email-drafts.json"
  exit 1
}

# --- Locate project (by old or new title) ---
echo "==> Locating project..."
PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg a "$NEW_TITLE" --arg b "$OLD_TITLE" \
      '.projects[] | select(.title==$a or .title==$b) | .number' | head -1)
[ -n "${PROJECT_NUMBER:-}" ] || { echo "ERROR: project not found"; exit 1; }

PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')
CURRENT_TITLE=$(echo "$PROJECT_VIEW" | jq -r '.title')
PROJECT_URL=$(echo "$PROJECT_VIEW" | jq -r '.url')
echo "    #$PROJECT_NUMBER  '$CURRENT_TITLE'  $PROJECT_URL"

# --- Rename ---
if [ "$CURRENT_TITLE" != "$NEW_TITLE" ]; then
  echo "==> Renaming → '$NEW_TITLE'"
  gh project edit "$PROJECT_NUMBER" --owner "$OWNER" --title "$NEW_TITLE" >/dev/null
fi

# --- Field reconciliation ---
FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)

fid() { echo "$FIELDS" | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' | head -1; }
oid() { echo "$FIELDS" | jq -r --arg f "$1" --arg o "$2" '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id' | head -1; }

echo "==> Cleaning up old fields..."
# Drop the original emoji-prefixed "Sales Status" field — replaced by "Outreach Status"
OLD_SALES_STATUS_ID=$(fid "Sales Status")
if [ -n "$OLD_SALES_STATUS_ID" ]; then
  echo "    Deleting old 'Sales Status' field"
  gh project field-delete --id "$OLD_SALES_STATUS_ID" >/dev/null 2>&1 || true
  FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
fi

echo "==> Ensuring fields..."

# New "Status" field (separate from old "Sales Status")
# Custom field — must NOT be named "Status" because the built-in
# ProjectV2 "Status" (Todo/In Progress/Done) blocks creation under that name.
STATUS_FIELD_NAME="Outreach Status"
STATUS_FIELD_ID=$(fid "$STATUS_FIELD_NAME")
if [ -z "$STATUS_FIELD_ID" ]; then
  echo "    Creating '$STATUS_FIELD_NAME' field"
  STATUS_FIELD_ID=$(gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --name "$STATUS_FIELD_NAME" --data-type SINGLE_SELECT \
    --single-select-options "Not Contacted,Contacted,Followed Up,Replied,Call Booked,In Bid,Won,No Response,Pass" \
    --format json | jq -r '.id')
  # Re-read fields after creation so option IDs are visible
  FIELDS=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json)
fi
NOT_CONTACTED_OPT_ID=$(oid "$STATUS_FIELD_NAME" "Not Contacted")

# Contact Date field (date type)
CONTACT_DATE_FIELD_ID=$(fid "Contact Date")
if [ -z "$CONTACT_DATE_FIELD_ID" ]; then
  echo "    Creating 'Contact Date' field"
  CONTACT_DATE_FIELD_ID=$(gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --name "Contact Date" --data-type DATE --format json | jq -r '.id')
fi

# Existing fields (we keep these, just reference)
SECTOR_FIELD_ID=$(fid "Sector")
CITY_FIELD_ID=$(fid "City")
EMAIL_FIELD_ID=$(fid "Email")
VERIFIED_FIELD_ID=$(fid "Email Verified")
VERIFIED_TRUE_ID=$(oid "Email Verified" "✅ Apollo-verified")
VERIFIED_FALSE_ID=$(oid "Email Verified" "⚠️ Guess — verify")

echo "    Status: $STATUS_FIELD_ID  ContactDate: $CONTACT_DATE_FIELD_ID"

# --- Pre-fetch existing items ---
echo "==> Reading items..."
EXISTING=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)

# Build a lookup: title -> {item_id (PVTI_*), content_id (DI_*)}
declare -a EXISTING_TITLES
declare -a EXISTING_IDS
declare -a EXISTING_CONTENT_IDS
while IFS= read -r line; do
  EXISTING_TITLES+=("$(echo "$line" | jq -r '.title')")
  EXISTING_IDS+=("$(echo "$line" | jq -r '.id')")
  EXISTING_CONTENT_IDS+=("$(echo "$line" | jq -r '.content_id')")
done < <(echo "$EXISTING" | jq -c '.items[] | {title: .content.title, id: .id, content_id: .content.id}')

# Sets ITEM_ID and CONTENT_ID globals
find_item_ids() {
  ITEM_ID=""
  CONTENT_ID=""
  local n="$1"
  for i in "${!EXISTING_TITLES[@]}"; do
    case "${EXISTING_TITLES[$i]}" in
      "#${n} —"*|"#${n}—"*|"#${n} -"*)
        ITEM_ID="${EXISTING_IDS[$i]}"
        CONTENT_ID="${EXISTING_CONTENT_IDS[$i]}"
        return
        ;;
    esac
  done
}

# --- Process all 60 prospects ---
COUNT=$(jq 'length' "$PROSPECTS_JSON")
echo "==> Reconciling $COUNT prospects (throttled 2s/item)..."

CREATED=0
UPDATED=0
for i in $(seq 0 $((COUNT-1))); do
  N=$(jq -r ".[$i].n" "$PROSPECTS_JSON")
  PERSON=$(jq -r ".[$i].person" "$PROSPECTS_JSON")
  COMPANY=$(jq -r ".[$i].company" "$PROSPECTS_JSON")
  CITY=$(jq -r ".[$i].city" "$PROSPECTS_JSON")
  SECTOR=$(jq -r ".[$i].sector" "$PROSPECTS_JSON")
  EMAIL=$(jq -r ".[$i].email" "$PROSPECTS_JSON")
  VERIFIED=$(jq -r ".[$i].verified" "$PROSPECTS_JSON")
  NOTE=$(jq -r ".[$i].note" "$PROSPECTS_JSON")
  EMAIL_DRAFT=$(jq -r --arg n "$N" '.[$n] // "(no draft)"' "$EMAILS_JSON")

  TITLE_STR="#${N} — ${PERSON} — ${COMPANY}"

  BODY=$(cat <<EOF
**Company:** ${COMPANY}
**City:** ${CITY}
**Sector:** ${SECTOR}
**Email:** ${EMAIL}
**Note:** ${NOTE}

---

## Email Draft

${EMAIL_DRAFT}

---

_Edit before sending. Personalize with one thing from their last 60 days of public output._
EOF
)

  find_item_ids "$N"
  if [ -n "${ITEM_ID:-}" ]; then
    echo "    [$((i+1))/$COUNT] $TITLE_STR (updating body + status)"
    # Body edit is best-effort: gh errors "no changes to make" if body is identical.
    set +e
    gh project item-edit --id "$CONTENT_ID" --body "$BODY" >/dev/null 2>&1
    set -e
    UPDATED=$((UPDATED+1))
  else
    echo "    [$((i+1))/$COUNT] $TITLE_STR (creating)"
    CREATE_OUT=$(gh project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --title "$TITLE_STR" --body "$BODY" --format json)
    ITEM_ID=$(echo "$CREATE_OUT" | jq -r '.id')
    # Set the existing fields too (only for new items)
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
    CREATED=$((CREATED+1))
  fi

  # Always set "Outreach Status" to "Not Contacted" (best-effort; idempotent)
  set +e
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$NOT_CONTACTED_OPT_ID" >/dev/null 2>&1
  set -e

  sleep 2
done

echo ""
echo "✅ Migration complete: $CREATED created, $UPDATED updated"
echo "    URL: $PROJECT_URL"
echo ""
echo "    Next steps in the UI:"
echo "      • Hide 'Assignees' column: View settings → Configure → toggle off"
echo "      • Hide old 'Sales Status' field if you only want the new 'Status'"
echo "      • Pin 'Contact Date' so you can set it inline when you mark Status=Contacted"
