#!/usr/bin/env bash
set -euo pipefail

if [[ $# -lt 2 ]]; then
  echo "Usage: $0 <prompt-file> <input-file> [context]" >&2
  exit 1
fi

prompt_file="$1"
input_file="$2"
context="${3:-}"

if [[ ! -f "$prompt_file" ]]; then
  echo "Prompt file not found: $prompt_file" >&2
  exit 1
fi

if [[ ! -f "$input_file" ]]; then
  echo "Input file not found: $input_file" >&2
  exit 1
fi

if [[ -f "./claudoist.config" ]]; then
  # shellcheck disable=SC1091
  source ./claudoist.config
fi

agent="${AGENT:-manual}"

if [[ "$agent" == "manual" || -z "$agent" ]]; then
  exit 2
fi

combined="$(mktemp)"

{
  if [[ -n "$context" ]]; then
    echo "# Context"
    echo "$context"
    echo
  fi
  echo "# Instructions"
  cat "$prompt_file"
  echo
  echo "# Input"
  cat "$input_file"
} > "$combined"

case "$agent" in
  codex)
    codex exec - < "$combined"
    ;;
  claude)
    # Claude CLI does not accept a prompt file directly; inline the combined prompt.
    claude -p "$(cat "$combined")"
    ;;
  gemini)
    # Gemini CLI appends -p prompt to stdin; use stdin as the full prompt.
    gemini -p "" < "$combined"
    ;;
  copilot)
    # Copilot CLI uses -p for non-interactive prompts.
    copilot -p "$(cat "$combined")"
    ;;
  *)
    echo "Unknown AGENT: $agent" >&2
    rm -f "$combined"
    exit 1
    ;;
esac

rm -f "$combined"
