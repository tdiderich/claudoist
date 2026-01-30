# CLI Architecture + Storage Model

## Architecture (Node CLI)

- Single entrypoint: `claudoist` (Node executable).
- Commands map 1:1 to the existing Bash behaviors to preserve UX.
- Uses Node APIs plus `googleapis` for calendar OAuth/fetching.
- Locates repo root by walking up from `cwd` and checking for known markers.

## Config

- `claudoist.config` is a simple key/value file loaded by the CLI.
- `AGENT` selects agent runner: `manual`, `codex`, `claude`, `gemini`, `copilot`.
- Env var `AGENT` can override if config is missing.

## Storage Model

- Everything is file-based; there is no database.
- Canonical data lives in:
  - `accounts/<account>/` for customer notes, todos, and next-call scratchpads.
  - `templates/` for generated file scaffolds.
  - `prompts/` for agent instructions.
- `TODOS.md` is derived output; rebuild via `build-dashboard`.

## Command Implementation Notes

- `plan-calls` and `google-authenticate` use Node Google APIs directly.
- `process-next-calls` uses git diff for `--changed` and falls back to listing files.
- `watch-todos` uses Node's filesystem watcher with a debounce to avoid thrash.
