import { describe, expect, it } from "vitest";
import { buildVariant, type Candidate } from "./exam";
import { TOPICS } from "@/content/topics";

const pool: Candidate[] = TOPICS.flatMap((t) =>
  (["A", "B", "C"] as const).flatMap((d) => [0, 1].map((k) => ({ id: `${t.id}-${d}${k}`, topic: t.id, difficulty: d, seen: k === 0 }))),
);
const diffOf = (id: string) => id.split("-")[1][0];

describe("buildVariant", () => {
  it("takes one question per topic in topic order", () => {
    const v = buildVariant(pool, "s1");
    expect(v).toHaveLength(10);
    expect(v.map((id) => id.split("-")[0])).toEqual(TOPICS.map((t) => t.id));
  });
  it("follows the 5/3/2 difficulty mix", () => {
    for (const seed of ["a", "b", "c", "d"]) {
      const v = buildVariant(pool, seed);
      const count = (d: string) => v.filter((id) => diffOf(id) === d).length;
      expect([count("A"), count("B"), count("C")]).toEqual([5, 3, 2]);
    }
  });
  it("prefers unseen questions", () => {
    expect(buildVariant(pool, "x").every((id) => id.endsWith("1"))).toBe(true);
  });
  it("skips empty topics and falls back to nearest level", () => {
    const small: Candidate[] = [{ id: "percent-001", topic: "percent", difficulty: "C", seen: true }];
    expect(buildVariant(small, "z")).toEqual(["percent-001"]);
  });
  it("varies between seeds", () => {
    const set = new Set(["1", "2", "3", "4", "5"].map((s) => buildVariant(pool, s).map(diffOf).join("")));
    expect(set.size).toBeGreaterThan(1);
  });
});
