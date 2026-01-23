export interface CustomerSummary {
  id: string;
  name: string;
  account: string;
  status: "open" | "in_progress" | "done";
  nextCall: string;
  notes: string[];
}

export const sampleCustomers: CustomerSummary[] = [
  {
    id: "acme-co",
    name: "Acme Co",
    account: "Enterprise",
    status: "in_progress",
    nextCall: "Thu 2:00 PM",
    notes: [
      "SOC2 timeline requested",
      "Security team wants integration demo",
      "Procurement asks for pricing clarity"
    ]
  },
  {
    id: "nimbus-io",
    name: "Nimbus IO",
    account: "Growth",
    status: "open",
    nextCall: "Wed 11:30 AM",
    notes: ["Enablement recap", "Trial conversion risks"]
  },
  {
    id: "cobalt-labs",
    name: "Cobalt Labs",
    account: "Enterprise",
    status: "done",
    nextCall: "Mon 9:00 AM",
    notes: ["Renewal confirmed", "Quarterly check-in"]
  }
];

export const sampleMarkdown = `# Acme Co - Q4 planning\n\n## Agenda\n- Security timeline review\n- Integration milestones\n- Pricing guardrails\n\n## Recent Notes\n- SOC2 timeline requested\n- Security team wants integration demo\n- Procurement asks for pricing clarity\n\n## Email Draft\nHi team,\n\nSharing a draft agenda for the Acme call. Add anything I missed.\n`;
