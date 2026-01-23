import { promises as fs } from "node:fs";
import path from "node:path";
import type { CallDoc, CallNote, CustomerFile, TodoItem } from "@claudoist/core";

export interface ContextBundle {
  customerId: string;
  customerName: string;
  generatedAt: string;
  recentNotes: CallNote[];
  openTodos: TodoItem[];
  recentCallDocs: CallDoc[];
}

const promptHeader = `You are an assistant helping prepare and summarize customer calls.
Return ONLY strict JSON that matches this schema:
{
  "callDoc": { "title": string, "markdown": string, "emailDraft": string },
  "todos": [ { "title": string, "details": string } ]
}
No prose. No markdown fences. JSON only.`;

export const buildContextBundle = (
  customer: CustomerFile,
  recentNotes: CallNote[],
  recentCallDocs: CallDoc[]
): ContextBundle => {
  const openTodos = customer.todos.filter((todo) => todo.status !== "done");
  return {
    customerId: customer.customerId,
    customerName: customer.customerName,
    generatedAt: new Date().toISOString(),
    recentNotes,
    openTodos,
    recentCallDocs
  };
};

export const buildPrompt = (bundle: ContextBundle): string => {
  const context = JSON.stringify(bundle, null, 2);
  return `${promptHeader}\n\nContext:\n${context}\n`;
};

export const writeContextFiles = async (
  rootDir: string,
  customerId: string,
  bundle: ContextBundle,
  prompt: string
): Promise<{ contextPath: string; promptPath: string }> => {
  const contextDir = path.join(rootDir, "contexts", customerId);
  await fs.mkdir(contextDir, { recursive: true });
  const timestamp = bundle.generatedAt.replace(/[:.]/g, "-");
  const contextPath = path.join(contextDir, `context-${timestamp}.json`);
  const promptPath = path.join(contextDir, `prompt-${timestamp}.md`);
  await fs.writeFile(contextPath, JSON.stringify(bundle, null, 2), "utf8");
  await fs.writeFile(promptPath, prompt, "utf8");
  return { contextPath, promptPath };
};
