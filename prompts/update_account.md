You are updating `accounts/<account>/account.md` based on recent notes.

Task:
- Update YAML frontmatter fields only when evidence exists in the latest note(s).
- Focus on: stage, primary_outcomes, success_criteria, risks, next_milestone, last_touch, next_touch, stakeholders.
- Append to the Decisions log if a decision was made.
- Add/resolve Open questions when clarified.

Constraints:
- Preserve existing narrative unless it is clearly outdated.
- Do not delete information without a clear replacement.
- Keep dates in YYYY-MM-DD.
- Only run this prompt after you have approved the recommended updates from the summarize step.

Output:
- Provide a patch for `accounts/<account>/account.md`.
