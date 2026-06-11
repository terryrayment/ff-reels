#!/usr/bin/env bash
# Apollo verification sync for wave 4-5 (2026-06-11):
# update Email field + Email Verified flag on the GH Project board.

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

ITEMS=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 300)

update() {
  local TITLE_MATCH="$1" NEW_EMAIL="$2" IS_VERIFIED="$3"
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
  else
    gh project item-edit --id "$ITEM_ID" --project-id "$PROJECT_ID" \
      --field-id "$VERIFIED_FIELD_ID" --single-select-option-id "$VERIFIED_FALSE_ID" >/dev/null 2>&1
  fi
  set -e
  echo "  $TITLE_MATCH → $NEW_EMAIL  (verified=$IS_VERIFIED)" >&2
  sleep 1
}

# Wave 4
update "Grant LaFontaine" "grant@whatnot.com" false
update "Doug Bernauer" "doug@radiantnuclear.com" true
update "Isaiah Taylor" "isaiah@valaratomics.com" true
update "John Tenet" "john@chaosinc.com" true
update "Mitch Lee" "mitch@arcboats.com" true
update "Joe Kudla" "joe.kudla@vuori.com" true
update "Tarek Mansour" "tarekm@kalshi.com" true
update "Mikey Shulman" "mikey@suno.com" false
update "Peter Rahal" "peter@davidprotein.com" true
update "Alex Bazzell" "alex@unrivaled.basketball" true
# Wave 5
update "Max Haot" "max@vastspace.com" true
update "Tom O'Leary" "tom@jetzero.aero" true
update "Lukas Czinger" "lczinger@divergent3d.com" true
update "Danny Harris" "danny.harris@aloyoga.com" false
update "Zach Rash" "zach@cocodelivery.com" true
update "Matt Soule" "matt@moveparallel.com" true
update "Ara Mahdessian" "amahdessian@servicetitan.com" false
update "Dan Magy" "dan@launchfirestorm.com" true
update "Ben Nowack" "ben@reflectorbital.com" true
update "Justin Fiaschetti" "justin@inversionspace.com" true
update "Will Ahmed" "will@whoop.com" true
update "Hamdi Ulukaya" "hamdi.ulukaya@chobani.com" true
update "Marc Lore" "marc@wonder.com" true
update "Cristóbal Valenzuela" "cristobal@runwayml.com" true
update "Hiroki Koga" "hiroki@oishii.com" true
update "Jonathan Regev" "jonathan@thefarmersdog.com" true
update "David Gutstadt" "david.gutstadt@ballers-us.com" false
update "Rylan Hamilton" "rylan@blw.ai" false
update "Shayne Coplan" "shaynecoplan@polymarket.com" true
update "Jeremy Levine" "jeremy.levine@underdogfantasy.com" true

echo "Done."
