#!/usr/bin/env bash
set -euo pipefail

VENV_DIR=".venv"
if [ -z "${PYTHON_BIN:-}" ]; then
  if [ -x "/opt/homebrew/opt/python@3.12/bin/python3.12" ]; then
    PYTHON_BIN="/opt/homebrew/opt/python@3.12/bin/python3.12"
  else
    PYTHON_BIN="python3"
  fi
fi

if ! command -v "$PYTHON_BIN" >/dev/null 2>&1; then
  echo "python3 not found. Install Python 3.10+ and try again."
  exit 1
fi

if [ ! -d "$VENV_DIR" ]; then
  "$PYTHON_BIN" -m venv "$VENV_DIR"
fi

"$VENV_DIR/bin/python" -m pip install --upgrade pip
"$VENV_DIR/bin/python" -m pip install --upgrade google-api-python-client google-auth-httplib2 google-auth-oauthlib

echo "Bootstrap complete. Run: ./claudoist plan-calls [days]"
