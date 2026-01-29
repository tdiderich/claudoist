#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <account-slug> <Account Name>" >&2
  exit 1
fi

slug="$1"
shift
name="$*"

base="accounts/$slug"

mkdir -p "$base/notes" "$base/artifacts/runbooks" "$base/artifacts/configs" "$base/artifacts/emails"

sed "s/^account: \".*\"/account: \"$name\"/" templates/account.md > "$base/account.md"

sed "s/{{account}}/$name/" templates/todos.md > "$base/todos.md"

sed "s/^account: \"\"/account: \"$name\"/" templates/next_call.md > "$base/next_call.md"

echo "Created $base with account.md, todos.md, and next_call.md"
