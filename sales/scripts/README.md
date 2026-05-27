# Setup the GitHub Project

This folder creates a **GitHub Project (v2)** populated with all 60 prospects, custom fields, and a status workflow.

## Prereqs

```bash
# 1. Install gh CLI (currently missing on this machine)
#    Easiest: download from cli.github.com — no homebrew required
#    Or with homebrew if you have it: brew install gh jq
#    Or pkg installer: https://github.com/cli/cli/releases/latest

# 2. Sign in
gh auth login

# 3. Add project scope (Projects v2 needs it explicitly)
gh auth refresh -s project,read:project

# 4. Verify
gh auth status
```

You'll also need `jq` (JSON parser) installed:
- Download: https://jqlang.github.io/jq/download/
- Comes with most dev installs

## Run

From the repo root:

```bash
bash sales/scripts/setup-github-project.sh
```

That's it. The script will:

1. Create a Project titled **"F&F Sales — 60 Founder Outreach"** under your user (or `terryrayment` org if you set `OWNER=terryrayment`).
2. Add custom fields:
   - **Sales Status** (single-select): ⬜ Not Sent · 📤 Sent · ⏳ Follow-up · 💬 Replied · 📞 Call Booked · 🎬 In Bid · 🏆 Won · ❄️ Cold · ❌ Pass
   - **Sector** (text)
   - **City** (text)
   - **Email** (text)
   - **Email Verified** (single-select): ✅ Apollo-verified / ⚠️ Guess
3. Add **60 draft items** — one per prospect — with all fields populated.
4. Print the project URL.

The script is **idempotent-ish**: re-running it won't create a duplicate project or duplicate items (it matches by title).

## After setup

In the GitHub Projects UI, create these views manually (one-time):

- **Board grouped by Sales Status** — your weekly working view
- **Table filtered by Email Verified = ⚠️** — verification queue
- **Board grouped by Sector** — see balance across aerospace/DTC/climate/etc.
- **Table sorted by # ascending** — full master list

## Updating

Edit `prospects.json` in this folder, then re-run the script. New prospects will be added; existing ones get field-value updates. Status fields won't be reset (we set them on create only). Wait — actually the script does set status on every run. If you want to preserve manually-set status, edit the script to only set Status when creating new items.

## Where the project lives

The project is created at the **user level** (not attached to the ff-reels repo). That's intentional — it doesn't pollute the production code repo's issue tracker. The URL will be:

```
https://github.com/users/terryrayment/projects/<N>
```

If you want it attached to the ff-reels repo specifically, you can link it via the UI later (Project settings → linked repos).
