#!/usr/bin/env node
import { Command } from "commander";
import { promises as fs } from "node:fs";
import path from "node:path";
import { FileStorageAdapter, createEmptyCustomer, type CallDoc, type CallNote } from "@claudoist/core";
import { runCallPlanner } from "./agentRuntime.js";
import { generateId, parseTags } from "./parse.js";
import { createServer } from "./server.js";
import { createTodo } from "./todo.js";

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

program
  .command("customer")
  .description("Manage customers")
  .command("create")
  .requiredOption("--id <id>", "Customer ID")
  .requiredOption("--name <name>", "Customer name")
  .option("--data-dir <path>", "Data directory")
  .action(async (options) => {
    const adapter = new FileStorageAdapter(resolveDataDir(options.dataDir));
    const existing = await adapter.loadCustomer(options.id);
    if (existing) {
      console.log(`Customer ${options.id} already exists`);
      return;
    }
    const now = new Date().toISOString();
    const customer = createEmptyCustomer(options.id, options.name, now);
    await adapter.saveCustomer(customer);
    console.log(`Created customer ${options.id}`);
  });

program
  .command("todo")
  .description("Manage todos")
  .command("add")
  .requiredOption("--customer <id>", "Customer ID")
  .requiredOption("--title <title>", "Todo title")
  .option("--details <details>", "Todo details")
  .option("--data-dir <path>", "Data directory")
  .action(async (options) => {
    const adapter = new FileStorageAdapter(resolveDataDir(options.dataDir));
    const todo = createTodo(options.title, options.details ?? null);
    await adapter.addTodos(options.customer, [todo]);
    console.log(`Added todo ${todo.id}`);
  });

program
  .command("todo")
  .description("Manage todos")
  .command("status")
  .requiredOption("--customer <id>", "Customer ID")
  .requiredOption("--todo <id>", "Todo ID")
  .requiredOption("--status <status>", "Todo status")
  .option("--data-dir <path>", "Data directory")
  .action(async (options) => {
    const adapter = new FileStorageAdapter(resolveDataDir(options.dataDir));
    const customer = await adapter.loadCustomer(options.customer);
    if (!customer) {
      throw new Error("Customer not found");
    }
    const todo = customer.todos.find((item) => item.id === options.todo);
    if (!todo) {
      throw new Error("Todo not found");
    }
    todo.status = options.status;
    todo.updatedAt = new Date().toISOString();
    await adapter.saveCustomer(customer);
    console.log(`Updated todo ${todo.id} to ${todo.status}`);
  });

program
  .command("serve")
  .description("Run a local API server for the web UI")
  .option("--port <port>", "Port to listen on", "4310")
  .option("--data-dir <path>", "Data directory")
  .action(async (options) => {
    const port = Number.parseInt(options.port, 10);
    const server = createServer(resolveDataDir(options.dataDir));
    server.listen(port, () => {
      console.log(`Claudoist server listening on http://localhost:${port}`);
    });
  });

program.parseAsync(process.argv).catch((error) => {
  console.error(error.message);
  process.exit(1);
});
