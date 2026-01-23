import { describe, expect, it } from "vitest";
import type { CallDoc, CallNote, CustomerFile } from "@claudoist/core";
import { buildContextBundle, buildPrompt } from "../agentContext.js";

const sampleCustomer: CustomerFile = {
  schemaVersion: 1,
  customerId: "acme-co",
  customerName: "Acme Co",
  updatedAt: "2024-10-01T10:00:00Z",
  notes: [],
  todos: [
    {
      id: "todo-1",
      createdAt: "2024-10-01T10:00:00Z",
      updatedAt: "2024-10-01T10:00:00Z",
      status: "open",
      title: "Send recap",
      details: null,
      dueAt: null,
      sourceNoteIds: []
    }
  ],
  callDocs: []
};

const notes: CallNote[] = [
  {
    id: "note-1",
    callId: null,
    createdAt: "2024-10-01T10:00:00Z",
    source: "manual",
    text: "Discuss pricing timeline.",
    tags: []
  }
];

const docs: CallDoc[] = [
  {
    id: "doc-1",
    callId: null,
    title: "Acme Co - Q4 prep",
    createdAt: "2024-10-01T10:00:00Z",
    updatedAt: "2024-10-01T10:00:00Z",
    markdown: "# Agenda",
    emailDraft: "Hi team",
    markdownPath: null
  }
];

describe("agent context", () => {
  it("builds a bundle with open todos and notes", () => {
    const bundle = buildContextBundle(sampleCustomer, notes, docs);
    expect(bundle.customerId).toBe("acme-co");
    expect(bundle.openTodos).toHaveLength(1);
    expect(bundle.recentNotes[0]?.text).toContain("pricing");
  });

  it("renders prompt with JSON context", () => {
    const bundle = buildContextBundle(sampleCustomer, notes, docs);
    const prompt = buildPrompt(bundle);
    expect(prompt).toContain("Context:");
    expect(prompt).toContain("\"customerId\": \"acme-co\"");
  });
});
