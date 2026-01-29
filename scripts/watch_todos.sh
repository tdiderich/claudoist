#!/usr/bin/env bash
set -euo pipefail

if ! command -v fswatch >/dev/null 2>&1; then
  echo "fswatch not found. Install it with: brew install fswatch" >&2
  exit 1
fi

echo "Watching accounts/*/todos.md for changes..."

fswatch -o accounts -e ".*" -i ".*todos\\.md$" | while read -r _; do
  scripts/build_todos_dashboard.sh
done
