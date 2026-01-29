#!/usr/bin/env bash
set -euo pipefail

VENV_PYTHON=".venv/bin/python"
if [ -x "$VENV_PYTHON" ]; then
  "$VENV_PYTHON" scripts/plan_calls.py "$@"
else
  python3 scripts/plan_calls.py "$@"
fi
