import { describe, it } from "node:test";
import assert from "node:assert/strict";
import { cn } from "../src/lib/utils.ts";

describe("cn utility", () => {
  it("should merge class names correctly", () => {
    const result = cn("text-sm", "font-bold");
    assert.equal(result, "text-sm font-bold");
  });

  it("should handle conditional and falsy classes", () => {
    const isPrimary = false;
    const isBold = true;
    const result = cn(
      "base-class",
      isPrimary && "text-primary",
      isBold && "font-bold",
      undefined,
      null,
    );
    assert.equal(result, "base-class font-bold");
  });

  it("should resolve Tailwind conflicts via tailwind-merge", () => {
    const result = cn("p-4", "p-2");
    assert.equal(result, "p-2");
  });
});
