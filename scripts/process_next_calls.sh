#!/usr/bin/env bash
set -euo pipefail

changed_only=false

if [[ "${1:-}" == "--changed" ]]; then
  changed_only=true
fi

if $changed_only; then
  files=$(git ls-files -m -- "accounts/*/next_call.md")
else
  files=$(ls accounts/*/next_call.md 2>/dev/null || true)
fi

if [[ -z "${files}" ]]; then
  echo "No next_call.md files found."
  exit 0
fi

echo "Next-call files to process:"
echo "$files" | sed 's/^/ - /'

echo
echo "Recommended flow:"
echo "1) For each file, run Codex with .codex/prompts/summarize_call.md to create a dated note + update todos."
echo "2) Review the 'Recommended account updates' section; if approved, run .codex/prompts/update_account.md."
echo "3) Rebuild global dashboard: scripts/build_todos_dashboard.sh"
