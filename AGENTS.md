# AGENTS

This repo is agent-agnostic. Use prompts from the `prompts/` folder.

## Prompts

- `prompts/summarize_call.md` - turn raw notes into structured notes + TODOs
- `prompts/process_next_call.md` - convert `accounts/<account>/next_call.md` into a dated note + TODOs
- `prompts/update_account.md` - update `accounts/<account>/account.md` frontmatter after review
- `prompts/weekly_review.md` - create weekly summaries in `weekly/`
- `prompts/plan_next_steps.md` - propose next actions and risks (no file edits)

## Conventions

- Notes are append-only; `account.md` is curated truth.
- Keep dates in `YYYY-MM-DD`.
- Use `scripts/build_todos_dashboard.sh` after per-account TODO updates.

## Safety rules

- Treat ignored paths as sensitive: do not read or write `accounts/`, `inbox/`, `weekly/`, `metrics/`, `data/private/`, or `TODOS.md` unless the user explicitly asks.
- Never introduce secrets, API keys, tokens, or customer-identifying data into tracked files.
- Prefer patches and minimal edits; avoid large rewrites of content.
- Ask before running networked commands or installing dependencies.
- Keep sensitive content in ignored files; use `data/public/` for sanitized, shareable data.

## Schemas

Frontmatter schemas live in `schemas/` and can be used by any agent for validation.
