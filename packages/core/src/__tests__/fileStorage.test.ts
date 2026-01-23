import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { FileStorageAdapter } from "../fileStorage.js";

const createTempDir = async () => mkdtemp(path.join(os.tmpdir(), "claudoist-"));

const sampleNote = {
  id: "note-1",
  callId: "call-1",
  createdAt: "2024-10-01T10:00:00Z",
  source: "manual" as const,
  text: "Customer asked about rollout timeline.",
  tags: ["timeline"]
};

const sampleTodo = {
  id: "todo-1",
  createdAt: "2024-10-01T10:10:00Z",
  updatedAt: "2024-10-01T10:10:00Z",
  status: "open" as const,
  title: "Send rollout timeline",
  details: null,
  dueAt: null,
  sourceNoteIds: ["note-1"]
};

describe("FileStorageAdapter", () => {
  it("creates and reads customer files", async () => {
    const tempDir = await createTempDir();
    const adapter = new FileStorageAdapter(tempDir);

    await adapter.appendCallNote("acme-co", sampleNote);
    await adapter.addTodos("acme-co", [sampleTodo]);

    const loaded = await adapter.loadCustomer("acme-co");
    expect(loaded?.customerId).toBe("acme-co");
    expect(loaded?.notes).toHaveLength(1);
    expect(loaded?.todos).toHaveLength(1);

    await rm(tempDir, { recursive: true, force: true });
  });
});
