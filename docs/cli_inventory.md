# CLI Inventory (Bash -> Node)

## Commands

- `new-account <slug> <Account Name>`
  - Creates `accounts/<slug>/`.
  - Creates subfolders: `notes/`, `artifacts/runbooks`, `artifacts/configs`, `artifacts/emails`.
  - Writes `account.md`, `todos.md`, `next_call.md` from templates (replacing account name).

- `new-note <account-slug> <note-slug> [type]`
  - Creates `accounts/<account>/notes/YYYY-MM-DD-<note-slug>.md`.
  - Updates `date:` in `templates/note.md` and optional `type:`.

- `ingest-call <account-slug> <rawfile> [note-slug]`
  - Prints context and runs `prompts/summarize_call.md` via configured agent.
  - If no agent configured, prints manual next steps.

- `process-next-calls [--changed]`
  - Lists `accounts/*/next_call.md`.
  - `--changed` uses `git ls-files -m` to find modified `next_call.md` files.
  - Runs `prompts/process_next_call.md` via configured agent for each file.
  - If no agent configured, prints manual flow.

- `plan-calls [days]`
  - Runs calendar planner (Node).
  - Defaults to rest of work week if no `days` provided.
  - Uses Google Calendar OAuth and account mapping.

- `google-authenticate`
  - Completes OAuth flow and saves token.

- `build-dashboard [output]`
  - Rebuilds `TODOS.md` from all `accounts/*/todos.md` and `internal` todos.
  - Aggregates done items into a global archive.

- `watch-todos`
  - Watches `accounts/*/todos.md` and rebuilds `TODOS.md` on changes.

## Dependencies & Assumptions

- Agent commands: `codex`, `claude`, `gemini`, `copilot` invoked by name in PATH.
- Calendar planning relies on Node + Google APIs (`googleapis`).
- `process-next-calls --changed` assumes `git` is available.
- `watch-todos` needs a filesystem watcher (Node `fs.watch` in the rewrite).
