#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <account-slug> <raw-note-file> [note-slug]" >&2
  exit 1
fi

acct="$1"
raw="$2"
slug="${3:-}"

echo "Ingesting: $raw"
echo "Account: $acct"
[[ -n "$slug" ]] && echo "Note slug: $slug"

echo
echo "Next steps:"
echo "1) Run Codex with .codex/prompts/summarize_call.md on the raw note."
echo "2) Review the \"Recommended account updates\" section. If approved, run .codex/prompts/update_account.md."
echo "3) Rebuild the global dashboard: scripts/build_todos_dashboard.sh"
