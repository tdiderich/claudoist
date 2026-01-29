#!/usr/bin/env bash
set -euo pipefail

scripts/bootstrap_plan_calls.sh

VENV_PYTHON=".venv/bin/python"
if [ -x "$VENV_PYTHON" ]; then
  "$VENV_PYTHON" scripts/plan_calls.py --auth-only
else
  python3 scripts/plan_calls.py --auth-only
fi
