import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { addNote, generateAgenda, getCustomer, listCustomers } from "../api.js";

const createTempDir = async () => mkdtemp(path.join(os.tmpdir(), "claudoist-"));

describe("api helpers", () => {
  it("stores notes and generates agendas", async () => {
    const tempDir = await createTempDir();

    await addNote(tempDir, "acme-co", { text: "Review SOC2 timeline" });
    await addNote(tempDir, "acme-co", { text: "Plan integration demo" });

    const customers = await listCustomers(tempDir);
    expect(customers).toHaveLength(1);
    expect(customers[0]?.customerId).toBe("acme-co");

    const customer = await getCustomer(tempDir, "acme-co");
    expect(customer?.notes).toHaveLength(2);

    const agenda = await generateAgenda(tempDir, "acme-co", { recent: 2 });
    expect(agenda.markdown).toContain("Review SOC2 timeline");
    expect(agenda.emailDraft).toContain("acme-co");

    await rm(tempDir, { recursive: true, force: true });
  });
});
