#!/usr/bin/env bash
set -euo pipefail

branch="$(git rev-parse --abbrev-ref HEAD)"

if [[ "$branch" == "work" ]]; then
  echo "Blocked: pushing from 'work' branch is disabled." >&2
  exit 1
fi
