import http, { type IncomingMessage, type ServerResponse } from "node:http";
import { URL } from "node:url";
import { addNote, addTodo, createCustomer, generateAgenda, getCustomer, listCustomers, updateTodoStatus } from "./api.js";

const jsonResponse = (res: ServerResponse, status: number, payload: unknown) => {
  res.writeHead(status, {
    "Content-Type": "application/json",
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type"
  });
  res.end(JSON.stringify(payload));
};

const notFound = (res: ServerResponse) => {
  jsonResponse(res, 404, { error: "Not found" });
};

const parseJsonBody = async (req: IncomingMessage): Promise<unknown> => {
  const chunks: Buffer[] = [];
  for await (const chunk of req) {
    chunks.push(Buffer.from(chunk));
  }
  const raw = Buffer.concat(chunks).toString("utf8");
  if (!raw) {
    return {};
  }
  return JSON.parse(raw);
};

export const createServer = (dataDir: string) => {
  return http.createServer(async (req, res) => {
    if (!req.url) {
      return notFound(res);
    }

    if (req.method === "OPTIONS") {
      res.writeHead(204, {
        "Access-Control-Allow-Origin": "*",
        "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
        "Access-Control-Allow-Headers": "Content-Type"
      });
      return res.end();
    }

    const url = new URL(req.url, `http://${req.headers.host ?? "localhost"}`);

    if (req.method === "GET" && url.pathname === "/api/customers") {
      const customers = await listCustomers(dataDir);
      return jsonResponse(res, 200, customers);
    }

    if (req.method === "POST" && url.pathname === "/api/customers") {
      const body = (await parseJsonBody(req)) as { customerId?: string; customerName?: string };
      if (!body.customerId || !body.customerName) {
        return jsonResponse(res, 400, { error: "customerId and customerName are required" });
      }
      const customer = await createCustomer(dataDir, {
        customerId: body.customerId,
        customerName: body.customerName
      });
      return jsonResponse(res, 200, customer);
    }

    const customerMatch = url.pathname.match(/^\/api\/customers\/([^/]+)$/);
    if (req.method === "GET" && customerMatch) {
      const customerId = customerMatch[1];
      const customer = await getCustomer(dataDir, customerId);
      if (!customer) {
        return jsonResponse(res, 404, { error: "Customer not found" });
      }
      return jsonResponse(res, 200, customer);
    }

    const noteMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/notes$/);
    if (req.method === "POST" && noteMatch) {
      const customerId = noteMatch[1];
      const body = (await parseJsonBody(req)) as { text?: string; tags?: string[]; callId?: string | null };
      if (!body.text) {
        return jsonResponse(res, 400, { error: "Note text is required" });
      }
      const note = await addNote(dataDir, customerId, {
        text: body.text,
        tags: body.tags,
        callId: body.callId
      });
      return jsonResponse(res, 200, note);
    }

    const agendaMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/agenda$/);
    if (req.method === "POST" && agendaMatch) {
      const customerId = agendaMatch[1];
      const body = (await parseJsonBody(req)) as { recent?: number; title?: string };
      const agenda = await generateAgenda(dataDir, customerId, { recent: body.recent, title: body.title });
      return jsonResponse(res, 200, agenda);
    }

    const todoMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/todos$/);
    if (req.method === "POST" && todoMatch) {
      const customerId = todoMatch[1];
      const body = (await parseJsonBody(req)) as { title?: string; details?: string | null };
      if (!body.title) {
        return jsonResponse(res, 400, { error: "Todo title is required" });
      }
      const todo = await addTodo(dataDir, customerId, { title: body.title, details: body.details ?? null });
      return jsonResponse(res, 200, todo);
    }

    const todoStatusMatch = url.pathname.match(/^\/api\/customers\/([^/]+)\/todos\/([^/]+)$/);
    if (req.method === "POST" && todoStatusMatch) {
      const customerId = todoStatusMatch[1];
      const todoId = todoStatusMatch[2];
      const body = (await parseJsonBody(req)) as { status?: "open" | "in_progress" | "done" | "blocked" };
      if (!body.status) {
        return jsonResponse(res, 400, { error: "Todo status is required" });
      }
      const todo = await updateTodoStatus(dataDir, customerId, todoId, body.status);
      if (!todo) {
        return jsonResponse(res, 404, { error: "Todo not found" });
      }
      return jsonResponse(res, 200, todo);
    }

    return notFound(res);
  });
};
