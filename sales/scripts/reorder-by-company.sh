#!/usr/bin/env bash
# Reorder all items in the FF Sales project so that founder + marketing lead
# for the same company are adjacent. Sort key: company name (case-insensitive),
# then "A" for founder, "B" for MKT, then prospect number.

set -euo pipefail

OWNER="${OWNER:-@me}"
TITLE="${TITLE:-FF Sales - Direct to Brand}"

PROJECT_NUMBER=$(gh project list --owner "$OWNER" --format json 2>/dev/null \
  | jq -r --arg t "$TITLE" '.projects[] | select(.title==$t) | .number' | head -1)
PROJECT_VIEW=$(gh project view "$PROJECT_NUMBER" --owner "$OWNER" --format json)
PROJECT_ID=$(echo "$PROJECT_VIEW" | jq -r '.id')
echo "==> Project #$PROJECT_NUMBER ($PROJECT_ID)" >&2

ITEMS=$(gh project item-list "$PROJECT_NUMBER" --owner "$OWNER" --format json --limit 200)

# Emit TSV: company\tkind\tnumber\titemId\ttitle
# Split title by ' — ' (em-dash with spaces).
SORTED=$(echo "$ITEMS" | jq -r '
  .items[] |
  (.content.title // "") as $t |
  ($t | split(" — ")) as $parts |
  (if ($t | startswith("MKT ")) then "B" else "A" end) as $kind |
  ($parts[0] // "" | gsub("^MKT "; "") | gsub("^#"; "") | tonumber? // 999) as $n |
  ($parts[-1] // "" | ascii_downcase) as $company |
  [$company, $kind, ($n | tostring), .id, $t] | @tsv
' | sort -t$'\t' -k1,1 -k2,2 -k3,3n)

PREV_ID=""
COUNT=0
while IFS=$'\t' read -r CO KIND N ITEM_ID TITLE_STR; do
  COUNT=$((COUNT+1))
  if [ -z "$PREV_ID" ]; then
    gh api graphql -f query='mutation($proj:ID!, $item:ID!) {
      updateProjectV2ItemPosition(input:{ projectId:$proj, itemId:$item })
      { clientMutationId }
    }' -F proj="$PROJECT_ID" -F item="$ITEM_ID" >/dev/null
  else
    gh api graphql -f query='mutation($proj:ID!, $item:ID!, $after:ID!) {
      updateProjectV2ItemPosition(input:{ projectId:$proj, itemId:$item, afterId:$after })
      { clientMutationId }
    }' -F proj="$PROJECT_ID" -F item="$ITEM_ID" -F after="$PREV_ID" >/dev/null
  fi
  printf "  %02d [%s] %s\n" "$COUNT" "$CO" "$TITLE_STR" >&2
  PREV_ID="$ITEM_ID"
  sleep 0.4
done <<< "$SORTED"

echo "==> Reordered $COUNT items by company." >&2
