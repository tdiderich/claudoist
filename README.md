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
- `internal/` non-customer work (internal todos and notes)

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

## CLI shortcuts (repo-only)

Use the repo-local wrapper to run common tasks:

```bash
./claudoist new-account acme-co "Acme Co"
./claudoist new-note acme-co kickoff
./claudoist process-next-calls --changed
./claudoist build-dashboard
```

Command reference:
- `new-account <slug> <Account Name>`: scaffolds `accounts/<slug>/` with `account.md`, `todos.md`, and `next_call.md`
- `new-note <account-slug> <note-slug>`: creates a dated note file in `accounts/<account>/notes/`
- `ingest-call <account-slug> <rawfile> [note-slug]`: prints the steps to process a raw note with prompts
- `process-next-calls [--changed]`: lists `next_call.md` files and reminds the processing flow (`--changed` only shows modified files)
- `build-dashboard`: rebuilds `TODOS.md` from all per-account todos (and internal if present)
- `watch-todos`: live-updates `TODOS.md` when account todos change (requires `fswatch`)

## Agent automation

Set your default agent in `claudoist.config` and the CLI will auto-run the agent for `ingest-call` and `process-next-calls`. If `AGENT=manual`, the scripts only print the recommended flow.

Supported values: `codex`, `claude`, `gemini`, `copilot`, `manual`.

Example:

```bash
cat <<'EOF' > claudoist.config
AGENT=codex
EOF
```

Note: `claude` and `copilot` are invoked with inline prompts; very large notes may exceed their CLI limits. For long inputs, prefer `codex` or `gemini`.

## Data folder

`data/public/` is for shareable, git-tracked data. `data/private/` is ignored by git for sensitive data.

## Auto-updating TODOS.md

Run `scripts/build_todos_dashboard.sh` after any per-account TODO updates. If you want live updates, run `scripts/watch_todos.sh` (requires `fswatch`, install with `brew install fswatch`).

## Open-source friendly

Sensitive content is gitignored by default (`accounts/`, `inbox/`, `weekly/`, `metrics/`, and `TODOS.md`). Folder structure is preserved with placeholders, and you can share sanitized data under `data/public/`.

## Agents

This repo is agent-agnostic. Use prompt files in `prompts/`.

## Branching model

- Use `main` for the public template.
- Use a local-only `work` branch for personal notes and internal work.
- Use `feature/<name>` or `fix/<name>` for contributions you want to share.

To prevent accidental pushes from `work`, install the local pre-push hook:

```bash
cp scripts/hooks/pre-push-work.sh .git/hooks/pre-push
chmod +x .git/hooks/pre-push
```
