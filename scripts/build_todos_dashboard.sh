#!/usr/bin/env bash
set -euo pipefail

out="${1:-TODOS.md}"
tmp="$(mktemp)"

{
  echo "# Global TODOs"
  echo
  echo "## Accounts"

  for f in accounts/*/todos.md; do
    [[ -f "$f" ]] || continue

    title="$(head -n 1 "$f" | sed 's/^# Todos - //')"
    [[ -z "$title" ]] && title="$(basename "$(dirname "$f")")"

    echo
    echo "### $title"
    echo

    tail -n +2 "$f" | sed 's/^## /#### /'

    awk -v acct="$title" '
      /^## Done/ {in_done=1; next}
      /^## Archive \(Done\)/ {in_done=1; next}
      /^## / {in_done=0}
      in_done && /^- \[x\]/ {
        line=$0
        sub(/^- \[x\] /, "", line)
        print "- [x] " acct " - " line
      }
    ' "$f" >> "$tmp"
  done


  echo
  echo "## Archive (Done)"
  echo
  if [[ -s "$tmp" ]]; then
    cat "$tmp"
  else
    echo "- [x] YYYY-MM-DD - ..."
  fi
} > "$out"

echo "Wrote $out"

rm -f "$tmp"
