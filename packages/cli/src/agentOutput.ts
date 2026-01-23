import { z } from "zod";

const callDocSchema = z.object({
  title: z.string().min(1),
  markdown: z.string().min(1),
  emailDraft: z.string().min(1)
});

const todoSchema = z.object({
  title: z.string().min(1),
  details: z.string().optional().nullable()
});

export const agentOutputSchema = z.object({
  callDoc: callDocSchema.optional(),
  todos: z.array(todoSchema).optional()
});

export type AgentOutput = z.infer<typeof agentOutputSchema>;
