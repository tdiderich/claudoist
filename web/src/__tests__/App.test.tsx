import { render, screen, fireEvent } from "@testing-library/react";
import { vi } from "vitest";
import App from "../App";

const mockFetch = (url: string, options?: RequestInit) => {
  if (url.endsWith("/api/customers") && (!options || options.method === "GET")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve([
          {
            customerId: "acme-co",
            customerName: "Acme Co",
            updatedAt: "2024-10-01T10:00:00Z",
            openTodoCount: 2,
            lastCallAt: "2024-10-01T10:00:00Z"
          }
        ])
    });
  }
  if (url.endsWith("/api/customers/acme-co") && (!options || options.method === "GET")) {
    return Promise.resolve({
      ok: true,
      json: () =>
        Promise.resolve({
          customerId: "acme-co",
          customerName: "Acme Co",
          updatedAt: "2024-10-01T10:00:00Z",
          todos: [],
          callDocs: []
        })
    });
  }
  if (url.includes("/agenda")) {
    return Promise.resolve({
      ok: true,
      json: () => Promise.resolve({ markdown: "# Acme Co - Call agenda" })
    });
  }
  return Promise.resolve({ ok: false, status: 404 });
};

describe("App", () => {
  it("updates agenda markdown when Make agenda is clicked", async () => {
    vi.stubGlobal("fetch", vi.fn(mockFetch));
    render(<App />);
    const button = await screen.findByRole("button", { name: /make agenda/i });
    fireEvent.click(button);
    expect(await screen.findByText(/call agenda/i)).toBeInTheDocument();
    vi.unstubAllGlobals();
  });
});
