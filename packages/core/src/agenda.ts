import type { CallNote } from "./types.js";

export interface AgendaResult {
  title: string;
  markdown: string;
  emailDraft: string;
}

export const buildAgenda = (customerName: string, notes: CallNote[], agendaTitle?: string): AgendaResult => {
  const title = agendaTitle ?? `${customerName} - Call agenda`;
  const bullets = notes.map((note) => `- ${note.text}`);
  const agendaSection = ["# Agenda", "", "- Review last action items", "- Open questions", "- Next steps", "", "# Recent Notes", "", ...bullets].join("\n");
  const emailDraft = `Hi team,\n\nHere is a draft agenda for our upcoming ${customerName} call:\n\n${agendaSection}\n\nPlease add anything I missed.\n`;

  return {
    title,
    markdown: agendaSection + "\n",
    emailDraft
  };
};
