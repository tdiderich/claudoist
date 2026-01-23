# Claudoist Data Schema

This document defines the canonical, strict JSON data format for Claudoist. JSON is the source of truth. Markdown is optional and used only for freeform notes, email drafts, or call docs.

## Storage Layout

Default layout (file per customer):

- data/
  - customers/
    - <customer_id>.json
    - <customer_id>-docs/
      - <call_id>.md (optional)

Future migration (folder per customer) keeps JSON canonical:

- data/
  - customers/
    - <customer_id>/
      - customer.json
      - docs/
        - <call_id>.md (optional)

The file layout must support a transparent migration: the JSON format stays identical, only the file path changes.

## Canonical JSON

All timestamps are ISO 8601 UTC strings. IDs are stable, lowercase, and URL-safe (e.g. "acme-co", "call-2024-10-01-001").

### Customer File

```json
{
  "schemaVersion": 1,
  "customerId": "acme-co",
  "customerName": "Acme Co",
  "updatedAt": "2024-10-01T18:12:00Z",
  "notes": [],
  "todos": [],
  "callDocs": []
}
```

### Note

```json
{
  "id": "note-2024-10-01-001",
  "callId": "call-2024-10-01-001",
  "createdAt": "2024-10-01T17:50:00Z",
  "source": "manual",
  "text": "Customer asked about SOC2 timeline.",
  "tags": ["security", "follow-up"]
}
```

### Todo

```json
{
  "id": "todo-2024-10-01-001",
  "createdAt": "2024-10-01T18:00:00Z",
  "updatedAt": "2024-10-01T18:00:00Z",
  "status": "open",
  "title": "Send SOC2 timeline",
  "details": "Provide SOC2 completion date and interim controls.",
  "dueAt": "2024-10-03T17:00:00Z",
  "sourceNoteIds": ["note-2024-10-01-001"]
}
```

### Call Doc (JSON)

```json
{
  "id": "call-doc-2024-10-01-001",
  "callId": "call-2024-10-01-001",
  "title": "Acme Co - Q4 planning",
  "createdAt": "2024-10-01T18:10:00Z",
  "updatedAt": "2024-10-01T18:10:00Z",
  "markdown": "# Agenda\n...",
  "emailDraft": "Hi team,...",
  "markdownPath": null
}
```

Markdown is stored inline by default. If the markdown becomes large, it can be moved to `markdownPath` and `markdown` can be null.

## Diff-Friendly Conventions

- Stable key ordering on write (schemaVersion, ids, timestamps, then arrays)
- One JSON object per customer file
- Append-only note IDs whenever possible
- Avoid re-sorting arrays unless needed for deterministic output
