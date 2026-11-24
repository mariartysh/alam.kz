import { describe, expect, it } from "vitest";
import { nextReview } from "./srs";

const now = new Date("2026-11-24T10:00:00Z");
const days = (d: Date) => (d.getTime() - now.getTime()) / 86_400_000;

describe("nextReview", () => {
  it("wrong answer resets to box 1, due now", () => {
    expect(nextReview({ box: 4, dueAt: now }, false, now)).toEqual({ box: 1, dueAt: now });
    expect(nextReview(null, false, now)).toEqual({ box: 1, dueAt: now });
  });
  it("correct answer without card stays out of the queue", () => {
    expect(nextReview(null, true, now)).toBeNull();
  });
  it("correct answer moves to the next box with growing intervals", () => {
    const s2 = nextReview({ box: 1, dueAt: now }, true, now)!;
    expect(s2.box).toBe(2);
    expect(days(s2.dueAt)).toBe(3);
    expect(days(nextReview({ box: 4, dueAt: now }, true, now)!.dueAt)).toBe(30);
  });
  it("box 5 correct means learned", () => {
    expect(nextReview({ box: 5, dueAt: now }, true, now)).toBeNull();
  });
});
