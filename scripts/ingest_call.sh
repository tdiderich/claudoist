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

context="Account: $acct"
[[ -n "$slug" ]] && context="$context\nNote slug: $slug"

if scripts/run_agent.sh prompts/summarize_call.md "$raw" "$context"; then
  exit 0
fi

echo
echo "Next steps:"
echo "1) Run your agent with prompts/summarize_call.md on the raw note."
echo "2) Review the \"Recommended account updates\" section. If approved, run prompts/update_account.md."
echo "3) Rebuild the global dashboard: scripts/build_todos_dashboard.sh"
