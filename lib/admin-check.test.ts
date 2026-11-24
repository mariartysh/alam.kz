import { describe, expect, it } from "vitest";
import { isAdmin } from "./admin-check";

describe("isAdmin", () => {
  it("matches numeric ids and @usernames", () => {
    const list = "123, @Gaucho_Bro";
    expect(isAdmin({ uid: 123 }, list)).toBe(true);
    expect(isAdmin({ uid: 5, username: "gaucho_bro" }, list)).toBe(true);
    expect(isAdmin({ uid: 5, username: "other" }, list)).toBe(false);
    expect(isAdmin({ uid: 5 }, list)).toBe(false);
    expect(isAdmin({ uid: 5, username: "gaucho_bro" }, "")).toBe(false);
  });
});
