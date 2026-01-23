import { describe, expect, it } from "vitest";
import { generateId, parseTags } from "../parse.js";

describe("parseTags", () => {
  it("splits and trims tags", () => {
    expect(parseTags("one, two,three")).toEqual(["one", "two", "three"]);
    expect(parseTags(" ")).toEqual([]);
  });
});

describe("generateId", () => {
  it("creates deterministic ids with prefix", () => {
    const now = new Date("2024-10-01T12:00:00Z");
    expect(generateId("note", now)).toBe("note-2024-10-01T12-00-00-000Z");
  });
});
