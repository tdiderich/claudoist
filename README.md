# Claudoist

Claudoist is a local-first, AI-native todo app for people who live in the terminal and spend their days on calls. It prioritizes lightweight workflows, agent extensibility, and git-friendly storage over bloated features.

## Why
- Call-heavy roles (customer success, solutions engineering) need fast capture, quick grouping, and minimal overhead.
- Notes should turn into actionable todos with agent help.
- Local storage and git backup keep data portable and auditable.

## Status
Early planning and scaffolding. The UI lives in `web/` today; core storage and CLI scaffolding live in `packages/`.

## Quick start (UI)
```bash
cd web
npm install
npm run dev
```

## Project layout
- `web/` - Vite + React + Chakra UI client
- `packages/core/` - data models + storage adapters
- `packages/cli/` - CLI workflows and agent runner
- `agents/` - agent manifests + in-repo agents
- `docs/` - agent-readable docs (start with `docs/chakra-ui.txt`)
- `data/` - local-first customer files (git-friendly)
- `scripts/` - helper scripts for common tasks

## Design goals
- Local-first storage with a clean adapter boundary (file-based now, SQLite later).
- Git-backed sync by committing a data folder.
- Agent/plugin model that can read `docs/*` and generate tasks from notes.
- Web-first today, Tauri-ready later.

## Contributing
See `CONTRIBUTING.md`. Issues are tracked with `bd` (beads).
