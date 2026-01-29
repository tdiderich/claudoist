#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <account-slug> <note-slug> [type]" >&2
  exit 1
fi

acct="$1"
slug="$2"
type="${3:-}"

date_str="$(date +%F)"

base="accounts/$acct/notes"
mkdir -p "$base"

file="$base/${date_str}-${slug}.md"

sed "s/^date: .*/date: $date_str/" templates/note.md > "$file"

if [[ -n "$type" ]]; then
  sed -i '' "s/^type: \"\"/type: \"$type\"/" "$file"
fi

echo "Created $file"
