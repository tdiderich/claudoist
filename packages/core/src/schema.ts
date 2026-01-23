import { z } from "zod";

export const noteSourceSchema = z.union([
  z.literal("manual"),
  z.literal("agent"),
  z.literal("import")
]);

export const todoStatusSchema = z.union([
  z.literal("open"),
  z.literal("in_progress"),
  z.literal("done"),
  z.literal("blocked")
]);

export const callNoteSchema = z.object({
  id: z.string().min(1),
  callId: z.string().min(1).nullable(),
  createdAt: z.string().min(1),
  source: noteSourceSchema,
  text: z.string().min(1),
  tags: z.array(z.string())
});

export const todoItemSchema = z.object({
  id: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  status: todoStatusSchema,
  title: z.string().min(1),
  details: z.string().nullable().optional(),
  dueAt: z.string().nullable().optional(),
  sourceNoteIds: z.array(z.string())
});

export const callDocSchema = z.object({
  id: z.string().min(1),
  callId: z.string().min(1).nullable(),
  title: z.string().min(1),
  createdAt: z.string().min(1),
  updatedAt: z.string().min(1),
  markdown: z.string().nullable(),
  emailDraft: z.string().nullable(),
  markdownPath: z.string().nullable()
});

export const customerFileSchema = z.object({
  schemaVersion: z.literal(1),
  customerId: z.string().min(1),
  customerName: z.string().min(1),
  updatedAt: z.string().min(1),
  notes: z.array(callNoteSchema),
  todos: z.array(todoItemSchema),
  callDocs: z.array(callDocSchema)
});

export type CustomerFileInput = z.input<typeof customerFileSchema>;
