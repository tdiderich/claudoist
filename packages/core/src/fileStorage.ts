import { promises as fs } from "node:fs";
import path from "node:path";
import { customerFileSchema } from "./schema.js";
import { stableStringify } from "./serialize.js";
import { createEmptyCustomer, type StorageAdapter } from "./storage.js";
import type { CallDoc, CallNote, CustomerFile, CustomerSummary, TodoItem } from "./types.js";

export class FileStorageAdapter implements StorageAdapter {
  private rootDir: string;

  constructor(rootDir: string) {
    this.rootDir = rootDir;
  }

  async loadCustomer(customerId: string): Promise<CustomerFile | null> {
    const filePath = this.customerFilePath(customerId);
    try {
      const raw = await fs.readFile(filePath, "utf8");
      const parsed = customerFileSchema.parse(JSON.parse(raw));
      return parsed;
    } catch (error) {
      if ((error as NodeJS.ErrnoException).code === "ENOENT") {
        return null;
      }
      throw error;
    }
  }

  async saveCustomer(customer: CustomerFile): Promise<void> {
    await this.ensureCustomersDir();
    const filePath = this.customerFilePath(customer.customerId);
    const payload = stableStringify(customer);
    await fs.writeFile(filePath, payload, "utf8");
  }

  async listCustomers(): Promise<CustomerSummary[]> {
    await this.ensureCustomersDir();
    const entries = await fs.readdir(this.customersDir(), { withFileTypes: true });
    const summaries: CustomerSummary[] = [];

    for (const entry of entries) {
      if (!entry.isFile() || !entry.name.endsWith(".json")) {
        continue;
      }
      const customerId = entry.name.replace(/\.json$/, "");
      const data = await this.loadCustomer(customerId);
      if (!data) {
        continue;
      }
      const openTodoCount = data.todos.filter((todo) => todo.status !== "done").length;
      const lastCallAt = data.notes.length
        ? data.notes[data.notes.length - 1]?.createdAt ?? null
        : null;
      summaries.push({
        customerId: data.customerId,
        customerName: data.customerName,
        updatedAt: data.updatedAt,
        openTodoCount,
        lastCallAt
      });
    }

    return summaries;
  }

  async appendCallNote(customerId: string, note: CallNote): Promise<CallNote> {
    const customer = await this.loadOrCreateCustomer(customerId);
    customer.notes.push(note);
    customer.updatedAt = new Date().toISOString();
    await this.saveCustomer(customer);
    return note;
  }

  async addTodos(customerId: string, todos: TodoItem[]): Promise<TodoItem[]> {
    const customer = await this.loadOrCreateCustomer(customerId);
    customer.todos.push(...todos);
    customer.updatedAt = new Date().toISOString();
    await this.saveCustomer(customer);
    return todos;
  }

  async addCallDoc(customerId: string, doc: CallDoc): Promise<CallDoc> {
    const customer = await this.loadOrCreateCustomer(customerId);
    customer.callDocs.push(doc);
    customer.updatedAt = new Date().toISOString();
    await this.saveCustomer(customer);
    return doc;
  }

  async getRecentNotes(customerId: string, count: number): Promise<CallNote[]> {
    const customer = await this.loadCustomer(customerId);
    if (!customer) {
      return [];
    }
    return customer.notes.slice(-count);
  }

  private async loadOrCreateCustomer(customerId: string): Promise<CustomerFile> {
    const existing = await this.loadCustomer(customerId);
    if (existing) {
      return existing;
    }
    const now = new Date().toISOString();
    const created = createEmptyCustomer(customerId, customerId, now);
    await this.saveCustomer(created);
    return created;
  }

  private customersDir(): string {
    return path.join(this.rootDir, "customers");
  }

  private customerFilePath(customerId: string): string {
    return path.join(this.customersDir(), `${customerId}.json`);
  }

  private async ensureCustomersDir(): Promise<void> {
    await fs.mkdir(this.customersDir(), { recursive: true });
  }
}
