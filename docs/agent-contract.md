# Agent Contract

Agents live under `/agents/<name>/` and are run via CLI.

## Manifest

Each agent includes `agent.json` (or `agent.yaml`) declaring:

```json
{
  "name": "call-planner",
  "version": "0.1.0",
  "description": "Generate call agenda + email draft from recent notes.",
  "entry": "index.ts",
  "capabilities": ["read-notes", "write-call-doc"],
  "inputSchema": "CallPlannerInput",
  "outputSchema": "CallPlannerOutput",
  "allowedReadPaths": ["docs/", "data/"],
  "allowedWritePaths": ["data/"]
}
```

## Input/Output Schema

Agents accept JSON via stdin or `--input <path>` and return JSON on stdout.

### CallPlannerInput

```json
{
  "customerId": "acme-co",
  "recentNotes": ["note-2024-10-01-001", "note-2024-09-15-002"],
  "agendaTitle": "Acme Co - Q4 planning",
  "contextMarkdown": "Optional freeform notes"
}
```

### CallPlannerOutput

```json
{
  "callDoc": {
    "title": "Acme Co - Q4 planning",
    "markdown": "# Agenda\n...",
    "emailDraft": "Hi team,..."
  },
  "todos": [
    {"title": "Send SOC2 timeline", "details": "..."}
  ]
}
```

## Execution

Agents default to no network access. Read/write paths are enforced by the CLI runtime.
