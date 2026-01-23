import { describe, expect, it } from "vitest";
import { stableStringify } from "../serialize.js";

describe("stableStringify", () => {
  it("sorts object keys for stable output", () => {
    const value = { b: 1, a: 2, nested: { z: 1, y: 2 } };
    const output = stableStringify(value);
    expect(output).toBe("{\n  \"a\": 2,\n  \"b\": 1,\n  \"nested\": {\n    \"y\": 2,\n    \"z\": 1\n  }\n}\n");
  });
});
