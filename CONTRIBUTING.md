# Contributing

Thanks for helping build Claudoist. This repo is early-stage and moving fast.

## Quick start
```bash
cd web
npm install
npm run dev
```

## Issue workflow
We use `bd` (beads) for issue tracking.
- `bd ready` - find unblocked work
- `bd show <id>` - view issue details
- `bd update <id> --status in_progress` - claim work
- `bd close <id>` - complete work

## Development notes
- Keep data storage local-first and git-friendly.
- Avoid browser-only storage APIs; route storage through adapters.
- UI should use Chakra UI.

## Pull requests
- Keep changes small and focused.
- Include a short rationale and verification steps.
- If you add new dependencies, explain why.
