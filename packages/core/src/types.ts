export type NoteSource = "manual" | "agent" | "import";
export type TodoStatus = "open" | "in_progress" | "done" | "blocked";

export interface CallNote {
  id: string;
  callId: string | null;
  createdAt: string;
  source: NoteSource;
  text: string;
  tags: string[];
}

export interface TodoItem {
  id: string;
  createdAt: string;
  updatedAt: string;
  status: TodoStatus;
  title: string;
  details?: string | null;
  dueAt?: string | null;
  sourceNoteIds: string[];
}

export interface CallDoc {
  id: string;
  callId: string | null;
  title: string;
  createdAt: string;
  updatedAt: string;
  markdown: string | null;
  emailDraft: string | null;
  markdownPath: string | null;
}

export interface CustomerFile {
  schemaVersion: 1;
  customerId: string;
  customerName: string;
  updatedAt: string;
  notes: CallNote[];
  todos: TodoItem[];
  callDocs: CallDoc[];
}

export interface CustomerSummary {
  customerId: string;
  customerName: string;
  updatedAt: string;
  openTodoCount: number;
  lastCallAt: string | null;
}
