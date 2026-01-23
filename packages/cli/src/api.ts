import { FileStorageAdapter, buildAgenda, type CallDoc, type CallNote, type CustomerFile, type CustomerSummary } from "@claudoist/core";
import { generateId } from "./parse.js";

export interface NoteInput {
  text: string;
  tags?: string[];
  callId?: string | null;
}

export interface AgendaInput {
  recent?: number;
  title?: string;
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
