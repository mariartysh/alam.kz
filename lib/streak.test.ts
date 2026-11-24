import { describe, expect, it } from "vitest";
import { almatyDay, currentStreak, lastDays } from "./streak";

describe("streak", () => {
  it("counts consecutive days ending today", () => {
    expect(currentStreak(["2026-11-24", "2026-11-23", "2026-11-22", "2026-11-20"], "2026-11-24")).toBe(3);
  });
  it("keeps the streak alive until the day ends", () => {
    expect(currentStreak(["2026-11-23", "2026-11-22"], "2026-11-24")).toBe(2);
  });
  it("resets after a missed day", () => {
    expect(currentStreak(["2026-11-22"], "2026-11-24")).toBe(0);
  });
  it("crosses month borders", () => {
    expect(currentStreak(["2026-12-01", "2026-11-30"], "2026-12-01")).toBe(2);
  });
  it("lists last days", () => {
    expect(lastDays("2026-03-01", 3)).toEqual(["2026-02-27", "2026-02-28", "2026-03-01"]);
  });
  it("uses Almaty time", () => {
    expect(almatyDay(new Date("2026-11-24T20:00:00Z"))).toBe("2026-11-25");
  });
});
