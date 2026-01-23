import type { CallDoc, CallNote, CustomerFile, CustomerSummary, TodoItem } from "./types.js";

export interface StorageAdapter {
  loadCustomer(customerId: string): Promise<CustomerFile | null>;
  saveCustomer(customer: CustomerFile): Promise<void>;
  listCustomers(): Promise<CustomerSummary[]>;
  appendCallNote(customerId: string, note: CallNote): Promise<CallNote>;
  addTodos(customerId: string, todos: TodoItem[]): Promise<TodoItem[]>;
  addCallDoc(customerId: string, doc: CallDoc): Promise<CallDoc>;
  getRecentNotes(customerId: string, count: number): Promise<CallNote[]>;
}

export const createEmptyCustomer = (customerId: string, customerName: string, now: string): CustomerFile => ({
  schemaVersion: 1,
  customerId,
  customerName,
  updatedAt: now,
  notes: [],
  todos: [],
  callDocs: []
});
