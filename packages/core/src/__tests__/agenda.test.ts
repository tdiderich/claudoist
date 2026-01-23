import { describe, expect, it } from "vitest";
import { buildAgenda } from "../agenda.js";

const notes = [
  { id: "note-1", callId: "call-1", createdAt: "2024-10-01T10:00:00Z", source: "manual", text: "Confirm integration plan.", tags: [] },
  { id: "note-2", callId: "call-1", createdAt: "2024-10-01T10:05:00Z", source: "manual", text: "Pricing review needed.", tags: [] }
];

describe("buildAgenda", () => {
  it("includes recent notes in markdown", () => {
    const agenda = buildAgenda("Acme Co", notes, "Acme Co - Q4 planning");
    expect(agenda.title).toBe("Acme Co - Q4 planning");
    expect(agenda.markdown).toContain("- Confirm integration plan.");
    expect(agenda.markdown).toContain("- Pricing review needed.");
    expect(agenda.emailDraft).toContain("Acme Co");
  });
});
