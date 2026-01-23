#!/usr/bin/env node
import { Command } from "commander";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FileStorageAdapter, type CallDoc, type CallNote, type TodoItem } from "@claudoist/core";
import { runCallPlanner } from "./agentRuntime.js";
import { generateId, parseTags } from "./parse.js";

const program = new Command();

const readStdin = async (): Promise<string> => {
  const chunks: Buffer[] = [];
  for await (const chunk of process.stdin) {
    chunks.push(Buffer.from(chunk));
  }
  return Buffer.concat(chunks).toString("utf8").trim();
};

const resolveDataDir = (dataDir?: string): string => {
  if (dataDir) {
    return dataDir;
  }
  return path.join(process.cwd(), "data");
};

program
  .name("claudoist")
  .description("Local-first CLI for call-heavy workflows")
  .version("0.1.0");

program
  .command("note")
  .description("Capture a quick call note")
  .requiredOption("--customer <id>", "Customer ID")
  .option("--customer-name <name>", "Customer display name")
  .option("--call <id>", "Call ID")
  .option("--text <text>", "Note text")
  .option("--tags <csv>", "Comma-separated tags")
  .option("--data-dir <path>", "Data directory")
  .action(async (options) => {
    const text = options.text ?? (await readStdin());
    if (!text) {
      throw new Error("Note text is required via --text or stdin");
    }

    const adapter = new FileStorageAdapter(resolveDataDir(options.dataDir));
    const now = new Date().toISOString();
    const note: CallNote = {
      id: generateId("note"),
      callId: options.call ?? null,
      createdAt: now,
      source: "manual",
      text,
      tags: parseTags(options.tags)
    };

    await adapter.appendCallNote(options.customer, note);
    console.log(`Saved note ${note.id} for ${options.customer}`);
  });

program
  .command("agenda")
  .description("Generate an agenda + email draft from recent notes")
  .requiredOption("--customer <id>", "Customer ID")
  .option("--title <title>", "Agenda title")
  .option("--recent <count>", "Number of recent notes", "3")
  .option("--output <path>", "Write markdown output to file")
  .option("--data-dir <path>", "Data directory")
  .action(async (options) => {
    const adapter = new FileStorageAdapter(resolveDataDir(options.dataDir));
    const count = Number.parseInt(options.recent, 10);
    const notes = await adapter.getRecentNotes(options.customer, count);

    const input = {
      customerId: options.customer,
      agendaTitle: options.title
    };
    const result = runCallPlanner(input, notes);
    const now = new Date().toISOString();

    let markdownPath: string | null = null;
    if (options.output) {
      markdownPath = options.output;
      await fs.mkdir(path.dirname(options.output), { recursive: true });
      await fs.writeFile(options.output, result.callDoc.markdown ?? "", "utf8");
    }

    const doc: CallDoc = {
      id: generateId("call-doc"),
      callId: null,
      title: result.callDoc.title,
      createdAt: now,
      updatedAt: now,
      markdown: result.callDoc.markdown ?? null,
      emailDraft: result.callDoc.emailDraft ?? null,
      markdownPath
    };

    await adapter.addCallDoc(options.customer, doc);
    console.log(result.callDoc.markdown ?? "");
  });

program
  .command("agent")
  .description("Run an agent")
  .command("run <name>")
  .description("Run a named agent")
  .option("--input <path>", "Path to JSON input")
  .option("--customer <id>", "Customer ID")
  .option("--recent <count>", "Number of recent notes", "3")
  .option("--data-dir <path>", "Data directory")
  .action(async (name, options) => {
    if (name !== "call-planner") {
      throw new Error(`Unknown agent: ${name}`);
    }

    let input: { customerId: string; agendaTitle?: string };
    if (options.input) {
      const raw = await fs.readFile(options.input, "utf8");
      input = JSON.parse(raw) as { customerId: string; agendaTitle?: string };
    } else if (options.customer) {
      input = { customerId: options.customer };
    } else {
      throw new Error("Provide --input or --customer for call-planner");
    }

    const adapter = new FileStorageAdapter(resolveDataDir(options.dataDir));
    const count = Number.parseInt(options.recent, 10);
    const notes = await adapter.getRecentNotes(input.customerId, count);
    const output = runCallPlanner({ customerId: input.customerId, agendaTitle: input.agendaTitle }, notes);

    console.log(JSON.stringify(output, null, 2));
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
