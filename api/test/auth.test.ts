import { describe, it } from "node:test";
import assert from "node:assert/strict";
import bcrypt from "bcryptjs";

describe("Auth & Security Utilities", () => {
  it("should securely hash and verify passwords", async () => {
    const password = "strong-password-123";
    const hash = await bcrypt.hash(password, 10);

    assert.notEqual(hash, password);
    assert.ok(hash.startsWith("$2"));

    const isMatch = await bcrypt.compare(password, hash);
    assert.equal(isMatch, true);

    const isWrongMatch = await bcrypt.compare("wrong-password", hash);
    assert.equal(isWrongMatch, false);
  });

  it("should validate email format using standard regex/zod rules", () => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    assert.ok(emailRegex.test("user@example.com"));
    assert.ok(emailRegex.test("worker.dev@domain.co"));
    assert.equal(emailRegex.test("invalid-email"), false);
    assert.equal(emailRegex.test("@missing-user.com"), false);
  });
});
