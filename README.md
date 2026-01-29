# claudoist

AI-native customer success workbench. Everything lives as plain text in this repo, with light structure so AI agents can reliably parse and update.

## What this repo is

This is a plain-text customer success operating system. Notes are append-only, account files hold the current truth, and todos are the execution surface. Prompts are included to turn raw notes into structured updates.

## Structure

- `inbox/` quick capture, low friction
- `accounts/<account>/` system of record per customer
- `accounts/<account>/next_call.md` scratchpad for live calls
- `playbooks/` reusable outcomes + troubleshooting patterns
- `prompts/` agent-agnostic prompts for consistent updates
- `schemas/` JSON schemas for frontmatter fields
- `templates/` starter docs
- `weekly/` weekly review outputs

## Guardrails

- Notes are append-only; `account.md` is curated truth
- Empty the inbox daily
- Graduation path: note -> todo -> playbook
- Use the global `TODOS.md` as the execution surface

## Global TODO dashboard

`TODOS.md` contains a section per account plus a global archive of done items. Per-account `todos.md` also includes its own archive section. A shareable template lives at `TODOS.example.md`.

## Quickstart (day-to-day)

1. Create an account
   - `scripts/new_account.sh acme-co "Acme Co"`
2. Live call scratchpad
   - Edit `accounts/acme-co/next_call.md` during the call
3. Process notes with AI agent
   - Use `prompts/process_next_call.md` to create a dated note and update todos
   - Review the "Recommended account updates" section and run `prompts/update_account.md` if approved
4. Update the global dashboard
   - `scripts/build_todos_dashboard.sh`
5. Weekly review
   - Run `prompts/weekly_review.md` to write `weekly/YYYY-Www.md`

You can also use `accounts/<account>/next_call.md` as your live call scratchpad, then process it with AI agent and convert it into a dated note + todo updates.

## Initial setup (copy/paste)

```bash
# clone
git clone <your-repo-url>
cd claudoist

# create 1 account (repeat as needed)
scripts/new_account.sh acme-co "Acme Co"

# or batch-create 10-30 accounts (edit the list first)
cat <<'EOF' > /tmp/accounts.txt
acme-co|Acme Co
globex|Globex
initech|Initech
EOF

while IFS='|' read -r slug name; do
  [[ -z "$slug" ]] && continue
  scripts/new_account.sh "$slug" "$name"
done < /tmp/accounts.txt

# build the global dashboard
scripts/build_todos_dashboard.sh
```

## Data folder

`data/public/` is for shareable, git-tracked data. `data/private/` is ignored by git for sensitive data.

## Auto-updating TODOS.md

Run `scripts/build_todos_dashboard.sh` after any per-account TODO updates. If you want live updates, run `scripts/watch_todos.sh` (requires `fswatch`, install with `brew install fswatch`).

## Open-source friendly

Sensitive content is gitignored by default (`accounts/`, `inbox/`, `weekly/`, `metrics/`, and `TODOS.md`). Folder structure is preserved with placeholders, and you can share sanitized data under `data/public/`.

## Agents

This repo is agent-agnostic. Use prompt files in `prompts/`.
