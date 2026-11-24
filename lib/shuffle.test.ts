import { describe, expect, it } from "vitest";
import { shuffled } from "./shuffle";

describe("shuffled", () => {
  it("is deterministic and a permutation", () => {
    const a = shuffled([0, 1, 2, 3], "x");
    expect(shuffled([0, 1, 2, 3], "x")).toEqual(a);
    expect([...a].sort()).toEqual([0, 1, 2, 3]);
  });
  it("spreads the correct answer across positions", () => {
    const pos = new Set(Array.from({ length: 40 }, (_, i) => shuffled([0, 1, 2, 3], `q${i}`).indexOf(0)));
    expect(pos.size).toBe(4);
  });
});
