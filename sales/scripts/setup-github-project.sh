#!/usr/bin/env bash
# Setup FF Sales — Direct to Brand as a GitHub Project (v2)
# Idempotent: rename existing project, reconcile fields, update items.
#
# Prereqs:
#   ~/.local/bin/gh installed and authed with project scope
#   jq installed
#   sales/scripts/prospects.json + email-drafts.json present
#
# Run from repo root:
#   PATH="$HOME/.local/bin:$PATH" bash sales/scripts/setup-github-project.sh

set -euo pipefail

OWNER="${OWNER:-@me}"
TITLE="FF Sales - Direct to Brand"
OLD_TITLE="F&F Sales — 60 Founder Outreach"
PROSPECTS_JSON="$(cd "$(dirname "$0")" && pwd)/prospects.json"
EMAILS_JSON="$(cd "$(dirname "$0")" && pwd)/email-drafts.json"

command -v gh >/dev/null || { echo "ERROR: gh CLI not installed"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq not installed"; exit 1; }
[ -f "$PROSPECTS_JSON" ] || { echo "ERROR: $PROSPECTS_JSON missing"; exit 1; }
[ -f "$EMAILS_JSON" ] || { echo "ERROR: $EMAILS_JSON missing — run parse_intros.py first"; exit 1; }

gh auth status >/dev/null || { echo "Run: gh auth login"; exit 1; }

# ---- Find or rename existing project, or create new ----
echo "==> Looking for project..."
PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" --arg o "$OLD_TITLE" \
      '.projects[] | select(.title==$t or .title==$o) | .number' | head -1 || true)

if [ -z "${PROJECT_NUMBER:-}" ]; then
  echo "==> Creating project: $TITLE"
  PROJECT_NUMBER=$(gh project create --owner "$OWNER" --title "$TITLE" --format json | jq -r '.number')
else
  echo "==> Found project #$PROJECT_NUMBER"
fi

PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')
CURRENT_TITLE=$(echo "$PROJECT_VIEW" | jq -r '.title')
PROJECT_URL=$(echo "$PROJECT_VIEW" | jq -r '.url')

if [ "$CURRENT_TITLE" != "$TITLE" ]; then
  echo "==> Renaming '$CURRENT_TITLE' → '$TITLE'"
  gh project edit "$PROJECT_NUMBER" --owner "$OWNER" --title "$TITLE" >/dev/null
fi

echo "    Project: #$PROJECT_NUMBER  ID: $PROJECT_ID"
echo "    URL: $PROJECT_URL"

# ---- Field management ----
fields_json() {
  gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json
}

field_id_by_name() {
  fields_json | jq -r --arg n "$1" '.fields[] | select(.name==$n) | .id' | head -1
}

option_id_by_name() {
  local field_name="$1"; local opt_name="$2"
  fields_json | jq -r --arg f "$field_name" --arg o "$opt_name" \
    '.fields[] | select(.name==$f) | .options[]? | select(.name==$o) | .id' | head -1
}

delete_field_if_exists() {
  local field_name="$1"
  local fid
  fid=$(field_id_by_name "$field_name")
  if [ -n "$fid" ]; then
    echo "    Deleting old field '$field_name' ($fid)"
    gh project field-delete --id "$fid" >/dev/null
  fi
}

ensure_select_field() {
  local field_name="$1"; shift
  local options=("$@")
  local fid
  fid=$(field_id_by_name "$field_name")
  if [ -z "$fid" ]; then
    local opts_csv; opts_csv=$(IFS=,; echo "${options[*]}")
    echo "    Creating select field '$field_name'"
    fid=$(gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --name "$field_name" --data-type SINGLE_SELECT \
      --single-select-options "$opts_csv" --format json | jq -r '.id')
  fi
  echo "$fid"
}

ensure_text_field() {
  local field_name="$1"
  local fid
  fid=$(field_id_by_name "$field_name")
  if [ -z "$fid" ]; then
    echo "    Creating text field '$field_name'"
    fid=$(gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --name "$field_name" --data-type TEXT --format json | jq -r '.id')
  fi
  echo "$fid"
}

ensure_date_field() {
  local field_name="$1"
  local fid
  fid=$(field_id_by_name "$field_name")
  if [ -z "$fid" ]; then
    echo "    Creating date field '$field_name'"
    fid=$(gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --name "$field_name" --data-type DATE --format json | jq -r '.id')
  fi
  echo "$fid"
}

echo "==> Reconciling fields..."

# Replace old 'Sales Status' field if it has the old options
OLD_STATUS_ID=$(field_id_by_name "Sales Status")
if [ -n "$OLD_STATUS_ID" ]; then
  HAS_OLD_OPTS=$(fields_json | jq -r '.fields[] | select(.name=="Sales Status") | .options[]?.name' | grep -c "Not Sent" || true)
  if [ "$HAS_OLD_OPTS" -gt 0 ]; then
    delete_field_if_exists "Sales Status"
  fi
fi

# Status with new option set (contacted-based vocabulary)
STATUS_OPTIONS=(
  "Not Contacted"
  "Contacted"
  "Followed Up"
  "Replied"
  "Call Booked"
  "In Bid"
  "Won"
  "No Response"
  "Pass"
)
STATUS_FIELD_ID=$(ensure_select_field "Status" "${STATUS_OPTIONS[@]}")
NOT_CONTACTED_OPT_ID=$(option_id_by_name "Status" "Not Contacted")

SECTOR_FIELD_ID=$(ensure_text_field "Sector")
CITY_FIELD_ID=$(ensure_text_field "City")
EMAIL_FIELD_ID=$(ensure_text_field "Email")
CONTACT_DATE_FIELD_ID=$(ensure_date_field "Contact Date")

VERIFIED_FIELD_ID=$(ensure_select_field "Email Verified" \
  "Apollo-verified" \
  "Guess - verify before send")
VERIFIED_TRUE_ID=$(option_id_by_name "Email Verified" "Apollo-verified")
VERIFIED_FALSE_ID=$(option_id_by_name "Email Verified" "Guess - verify before send")

# ---- Add or update prospects ----
echo "==> Reconciling 60 prospects (throttled 2s/item)..."
COUNT=$(jq 'length' "$PROSPECTS_JSON")

# Pre-fetch all existing items once (saves API calls)
EXISTING_ITEMS=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)

for i in $(seq 0 $((COUNT-1))); do
  N=$(jq -r ".[$i].n" "$PROSPECTS_JSON")
  PERSON=$(jq -r ".[$i].person" "$PROSPECTS_JSON")
  COMPANY=$(jq -r ".[$i].company" "$PROSPECTS_JSON")
  CITY=$(jq -r ".[$i].city" "$PROSPECTS_JSON")
  SECTOR=$(jq -r ".[$i].sector" "$PROSPECTS_JSON")
  EMAIL=$(jq -r ".[$i].email" "$PROSPECTS_JSON")
  VERIFIED=$(jq -r ".[$i].verified" "$PROSPECTS_JSON")
  NOTE=$(jq -r ".[$i].note" "$PROSPECTS_JSON")
  EMAIL_DRAFT=$(jq -r --arg n "$N" '.[$n] // ""' "$EMAILS_JSON")

  TITLE_STR="#${N} — ${PERSON} — ${COMPANY}"

  # Build body with full email draft
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

  # Match existing by exact title OR by leading "#N —" prefix (handles em-dash variants)
  ITEM_ID=$(echo "$EXISTING_ITEMS" \
    | jq -r --arg t "$TITLE_STR" --arg p "#${N} —" \
        '.items[] | select(.content.title==$t or (.content.title | startswith($p))) | .id' | head -1)

  if [ -n "${ITEM_ID:-}" ] && [ "$ITEM_ID" != "null" ]; then
    echo "    [$((i+1))/$COUNT] $TITLE_STR (updating)"
    # Update existing draft item title + body
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --title "$TITLE_STR" --body "$BODY" >/dev/null
  else
    echo "    [$((i+1))/$COUNT] $TITLE_STR (creating)"
    ITEM_ID=$(gh project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --title "$TITLE_STR" --body "$BODY" --format json | jq -r '.id')
  fi

  # Set field values
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$NOT_CONTACTED_OPT_ID" >/dev/null

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

  sleep 2
done

echo ""
echo "✅ Done."
echo "    Open: $PROJECT_URL"
echo ""
echo "    UI tips:"
echo "      • Hide the built-in 'Assignees' column in each view: View → Configure → toggle off Assignees"
echo "      • Suggested views: Board grouped by Status; Table sorted by # ascending; Table filtered by Email Verified = Guess"
echo "      • 'Contact Date' is a date field — set it when you mark Status = Contacted"
