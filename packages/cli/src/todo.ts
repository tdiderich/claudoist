import type { TodoItem } from "@claudoist/core";
import { generateId } from "./parse.js";

export const createTodo = (title: string, details?: string | null): TodoItem => {
  const now = new Date().toISOString();
  return {
    id: generateId("todo"),
    createdAt: now,
    updatedAt: now,
    status: "open",
    title,
    details: details ?? null,
    dueAt: null,
    sourceNoteIds: []
  };
};
