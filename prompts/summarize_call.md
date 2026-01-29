You are updating this repo's customer success workbench.

Task:
- Read a raw note from `inbox/` or an unstructured note file.
- Create a structured note in `accounts/<account>/notes/YYYY-MM-DD-<slug>.md` using `templates/note.md`.
- Extract decisions, risks, and action items.
- Propose TODO updates by editing `accounts/<account>/todos.md` and/or `TODOS.md`.
- Recommend whether `accounts/<account>/account.md` should be updated.

Constraints:
- Preserve YAML frontmatter, update only fields supported by the note.
- Notes are append-only: do not edit existing notes unless fixing clear mistakes.
- Be conservative: if unsure, add items as candidate action items.
- Keep content concise and human-readable.
- Do not edit `accounts/<account>/account.md` in this step.

Output:
- Provide a patch for the new note file and any TODO updates.
- Include a short "Recommended account updates" section listing fields to update and why (or "No account update recommended").
