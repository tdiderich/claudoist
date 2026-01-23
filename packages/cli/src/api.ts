import { FileStorageAdapter, buildAgenda, createEmptyCustomer, type CallDoc, type CallNote, type CustomerFile, type CustomerSummary, type TodoItem } from "@claudoist/core";
import { generateId } from "./parse.js";
import { createTodo } from "./todo.js";

export interface NoteInput {
  text: string;
  tags?: string[];
  callId?: string | null;
}

export interface AgendaInput {
  recent?: number;
  title?: string;
}

export interface CustomerInput {
  customerId: string;
  customerName: string;
}

export interface TodoInput {
  title: string;
  details?: string | null;
}

export interface AgendaResult {
  callDoc: CallDoc;
  markdown: string;
  emailDraft: string;
}

export const listCustomers = async (dataDir: string): Promise<CustomerSummary[]> => {
  const adapter = new FileStorageAdapter(dataDir);
  return adapter.listCustomers();
};

export const createCustomer = async (dataDir: string, input: CustomerInput): Promise<CustomerFile> => {
  const adapter = new FileStorageAdapter(dataDir);
  const now = new Date().toISOString();
  const existing = await adapter.loadCustomer(input.customerId);
  if (existing) {
    return existing;
  }
  const customer = createEmptyCustomer(input.customerId, input.customerName, now);
  await adapter.saveCustomer(customer);
  return customer;
};

export const getCustomer = async (dataDir: string, customerId: string): Promise<CustomerFile | null> => {
  const adapter = new FileStorageAdapter(dataDir);
  return adapter.loadCustomer(customerId);
};

export const addNote = async (
  dataDir: string,
  customerId: string,
  input: NoteInput
): Promise<CallNote> => {
  const adapter = new FileStorageAdapter(dataDir);
  const now = new Date().toISOString();
  const note: CallNote = {
    id: generateId("note"),
    callId: input.callId ?? null,
    createdAt: now,
    source: "manual",
    text: input.text,
    tags: input.tags ?? []
  };
  await adapter.appendCallNote(customerId, note);
  return note;
};

export const addTodo = async (dataDir: string, customerId: string, input: TodoInput): Promise<TodoItem> => {
  const adapter = new FileStorageAdapter(dataDir);
  const todo = createTodo(input.title, input.details ?? null);
  await adapter.addTodos(customerId, [todo]);
  return todo;
};

export const updateTodoStatus = async (
  dataDir: string,
  customerId: string,
  todoId: string,
  status: TodoItem["status"]
): Promise<TodoItem | null> => {
  const adapter = new FileStorageAdapter(dataDir);
  const customer = await adapter.loadCustomer(customerId);
  if (!customer) {
    return null;
  }
  const todo = customer.todos.find((item) => item.id === todoId);
  if (!todo) {
    return null;
  }
  todo.status = status;
  todo.updatedAt = new Date().toISOString();
  await adapter.saveCustomer(customer);
  return todo;
};

export const generateAgenda = async (
  dataDir: string,
  customerId: string,
  input: AgendaInput
): Promise<AgendaResult> => {
  const adapter = new FileStorageAdapter(dataDir);
  const recentCount = input.recent ?? 3;
  const notes = await adapter.getRecentNotes(customerId, recentCount);
  const customer = await adapter.loadCustomer(customerId);
  const name = customer?.customerName ?? customerId;
  const agenda = buildAgenda(name, notes, input.title);
  const now = new Date().toISOString();
  const doc: CallDoc = {
    id: generateId("call-doc"),
    callId: null,
    title: agenda.title,
    createdAt: now,
    updatedAt: now,
    markdown: agenda.markdown,
    emailDraft: agenda.emailDraft,
    markdownPath: null
  };
  await adapter.addCallDoc(customerId, doc);

  return {
    callDoc: doc,
    markdown: agenda.markdown,
    emailDraft: agenda.emailDraft
  };
};
