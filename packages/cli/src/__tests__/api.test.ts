import { describe, expect, it } from "vitest";
import { mkdtemp, rm } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { addNote, addTodo, createCustomer, generateAgenda, getCustomer, listCustomers, updateTodoStatus } from "../api.js";

const createTempDir = async () => mkdtemp(path.join(os.tmpdir(), "claudoist-"));

describe("api helpers", () => {
  it("stores notes and generates agendas", async () => {
    const tempDir = await createTempDir();

    await createCustomer(tempDir, { customerId: "acme-co", customerName: "Acme Co" });
    await addNote(tempDir, "acme-co", { text: "Review SOC2 timeline" });
    await addNote(tempDir, "acme-co", { text: "Plan integration demo" });
    const todo = await addTodo(tempDir, "acme-co", { title: "Send recap", details: "Email summary" });

    const customers = await listCustomers(tempDir);
    expect(customers).toHaveLength(1);
    expect(customers[0]?.customerId).toBe("acme-co");

    const customer = await getCustomer(tempDir, "acme-co");
    expect(customer?.notes).toHaveLength(2);
    expect(customer?.todos).toHaveLength(1);

    const agenda = await generateAgenda(tempDir, "acme-co", { recent: 2 });
    expect(agenda.markdown).toContain("Review SOC2 timeline");
    expect(agenda.emailDraft).toContain("Acme Co");

    const updated = await updateTodoStatus(tempDir, "acme-co", todo.id, "done");
    expect(updated?.status).toBe("done");

    await rm(tempDir, { recursive: true, force: true });
  });
});
