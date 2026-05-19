#!/usr/bin/env bash
# Setup F&F Sales — 60 Founder Outreach as a GitHub Project (v2)
# Prereqs: gh CLI installed and authenticated with `project` scope.
#   brew install gh   # or download from cli.github.com
#   gh auth login
#   gh auth refresh -s project,read:project
#
# Run from anywhere:
#   bash sales/scripts/setup-github-project.sh
#
# Idempotent-ish: if a project with the same title exists for the owner,
# the script will print its URL and exit rather than create a duplicate.

set -euo pipefail

OWNER="${OWNER:-@me}"                          # override: OWNER=terryrayment bash ...
TITLE="${TITLE:-F&F Sales — 60 Founder Outreach}"
PROSPECTS_JSON="$(cd "$(dirname "$0")" && pwd)/prospects.json"

command -v gh >/dev/null || { echo "ERROR: gh CLI not installed. brew install gh"; exit 1; }
command -v jq >/dev/null || { echo "ERROR: jq not installed. brew install jq"; exit 1; }
[ -f "$PROSPECTS_JSON" ] || { echo "ERROR: $PROSPECTS_JSON missing"; exit 1; }

echo "==> Checking gh auth..."
gh auth status >/dev/null || { echo "Run: gh auth login"; exit 1; }

# Confirm project scope
if ! gh auth status 2>&1 | grep -q "project"; then
  echo "==> Refreshing token with project scope..."
  gh auth refresh -s project,read:project
fi

# --- Find or create project ---
echo "==> Looking for existing project: $TITLE"
EXISTING=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" '.projects[] | select(.title==$t) | .number' | head -1 || true)

if [ -n "${EXISTING:-}" ]; then
  echo "==> Project already exists: #$EXISTING"
  PROJECT_NUMBER="$EXISTING"
else
  echo "==> Creating project..."
  PROJECT_NUMBER=$(gh project create --owner "$OWNER" --title "$TITLE" --format json | jq -r '.number')
  echo "    Created project #$PROJECT_NUMBER"
fi

PROJECT_ID=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.id')
PROJECT_URL=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json | jq -r '.url')
echo "    Project ID: $PROJECT_ID"
echo "    URL: $PROJECT_URL"

# --- Define Status field options ---
STATUS_OPTIONS=(
  "⬜ Not Sent"
  "📤 Sent"
  "⏳ Follow-up Sent"
  "💬 Replied"
  "📞 Call Booked"
  "🎬 In Bid"
  "🏆 Won"
  "❄️ Cold"
  "❌ Pass"
)

# --- Helper: get or create a single-select field ---
get_or_create_field() {
  local field_name="$1"; shift
  local options=("$@")
  local existing_id
  existing_id=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    | jq -r --arg n "$field_name" '.fields[] | select(.name==$n) | .id' | head -1)
  if [ -n "$existing_id" ]; then
    echo "    Field '$field_name' exists: $existing_id" >&2
    echo "$existing_id"
    return
  fi
  local opts_csv
  opts_csv=$(IFS=,; echo "${options[*]}")
  echo "    Creating field '$field_name' with options: $opts_csv" >&2
  gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --name "$field_name" \
    --data-type SINGLE_SELECT \
    --single-select-options "$opts_csv" \
    --format json | jq -r '.id'
}

# --- Helper: get or create a text field ---
get_or_create_text_field() {
  local field_name="$1"
  local existing_id
  existing_id=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
    | jq -r --arg n "$field_name" '.fields[] | select(.name==$n) | .id' | head -1)
  if [ -n "$existing_id" ]; then
    echo "$existing_id"
    return
  fi
  gh project field-create "$PROJECT_NUMBER" --owner "$OWNER" \
    --name "$field_name" \
    --data-type TEXT \
    --format json | jq -r '.id'
}

echo "==> Setting up custom fields..."
STATUS_FIELD_ID=$(get_or_create_field "Sales Status" "${STATUS_OPTIONS[@]}")
SECTOR_FIELD_ID=$(get_or_create_text_field "Sector")
CITY_FIELD_ID=$(get_or_create_text_field "City")
EMAIL_FIELD_ID=$(get_or_create_text_field "Email")
VERIFIED_FIELD_ID=$(get_or_create_field "Email Verified" "✅ Apollo-verified" "⚠️ Guess — verify")

# Get the Not-Sent option ID for default Status
NOT_SENT_OPT_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
  | jq -r '.fields[] | select(.name=="Sales Status") | .options[] | select(.name=="⬜ Not Sent") | .id')

VERIFIED_TRUE_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
  | jq -r '.fields[] | select(.name=="Email Verified") | .options[] | select(.name=="✅ Apollo-verified") | .id')
VERIFIED_FALSE_ID=$(gh project field-list "$PROJECT_NUMBER" --owner "$OWNER" --format json \
  | jq -r '.fields[] | select(.name=="Email Verified") | .options[] | select(.name=="⚠️ Guess — verify") | .id')

# --- Add prospects as draft items ---
echo "==> Adding 60 prospects..."
COUNT=$(jq 'length' "$PROSPECTS_JSON")

for i in $(seq 0 $((COUNT-1))); do
  N=$(jq -r ".[$i].n" "$PROSPECTS_JSON")
  PERSON=$(jq -r ".[$i].person" "$PROSPECTS_JSON")
  COMPANY=$(jq -r ".[$i].company" "$PROSPECTS_JSON")
  CITY=$(jq -r ".[$i].city" "$PROSPECTS_JSON")
  SECTOR=$(jq -r ".[$i].sector" "$PROSPECTS_JSON")
  EMAIL=$(jq -r ".[$i].email" "$PROSPECTS_JSON")
  VERIFIED=$(jq -r ".[$i].verified" "$PROSPECTS_JSON")
  NOTE=$(jq -r ".[$i].note" "$PROSPECTS_JSON")

  TITLE_STR="#${N} — ${PERSON} — ${COMPANY}"
  BODY=$(cat <<EOF
**Company:** ${COMPANY}
**City:** ${CITY}
**Sector:** ${SECTOR}
**Email:** ${EMAIL}
**Note:** ${NOTE}

---

See [sales/INTROS.md](https://github.com/terryrayment/ff-reels/blob/sales/master-tracker/sales/INTROS.md) for the intro email draft.

EOF
)

  echo "    [$((i+1))/$COUNT] $TITLE_STR"

  # Check if item exists (by title)
  EXISTING_ITEM=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200 \
    | jq -r --arg t "$TITLE_STR" '.items[] | select(.content.title==$t) | .id' | head -1)

  if [ -n "$EXISTING_ITEM" ]; then
    ITEM_ID="$EXISTING_ITEM"
    echo "        (exists, updating fields)"
  else
    ITEM_ID=$(gh project item-create "$PROJECT_NUMBER" --owner "$OWNER" \
      --title "$TITLE_STR" --body "$BODY" --format json | jq -r '.id')
  fi

  # Set field values
  gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
    --field-id "$STATUS_FIELD_ID" --single-select-option-id "$NOT_SENT_OPT_ID" >/dev/null

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
done

echo ""
echo "✅ Done."
echo "    Open: $PROJECT_URL"
echo ""
echo "    Suggested views to create in the UI:"
echo "      • Board view grouped by Sales Status"
echo "      • Table view filtered by Email Verified = ⚠️"
echo "      • Board view grouped by Sector"
