You are processing an account's live call scratchpad at `accounts/<account>/next_call.md`.

Task:
- Convert it into a dated note under `accounts/<account>/notes/YYYY-MM-DD-<slug>.md` using `templates/note.md`.
- Extract decisions, risks, and action items.
- Update `accounts/<account>/todos.md` as needed.
- Do not edit `accounts/<account>/account.md` directly, but recommend updates with rationale.
- Incorporate the Agenda section as `topics` in frontmatter and/or a short summary in the note body.

Constraints:
- Preserve YAML frontmatter; use date from `next_call.md` if present, otherwise use today.
- Keep the new note concise and accurate to the scratchpad.
- Notes are append-only.

Output:
- Provide a patch for the new note and TODO updates.
- Include a short "Recommended account updates" section.
