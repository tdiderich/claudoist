import { buildAgenda, type CallDoc, type CallNote, type TodoItem } from "@claudoist/core";

export interface CallPlannerInput {
  customerId: string;
  customerName?: string;
  recentNotes?: string[];
  agendaTitle?: string;
  contextMarkdown?: string | null;
}

export interface CallPlannerOutput {
  callDoc: Pick<CallDoc, "title" | "markdown" | "emailDraft">;
  todos: Array<Pick<TodoItem, "title" | "details">>;
}

export const runCallPlanner = (input: CallPlannerInput, notes: CallNote[]): CallPlannerOutput => {
  const name = input.customerName ?? input.customerId;
  const agenda = buildAgenda(name, notes, input.agendaTitle);

  return {
    callDoc: {
      title: agenda.title,
      markdown: agenda.markdown,
      emailDraft: agenda.emailDraft
    },
    todos: []
  };
};
