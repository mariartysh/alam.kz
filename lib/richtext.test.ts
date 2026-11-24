import { describe, expect, it } from "vitest";
import { splitMath } from "./richtext";

describe("splitMath", () => {
  it("splits inline and display math", () => {
    expect(splitMath("Цена $x+1$ тг $$\\frac{a}{b}$$!")).toEqual([
      { kind: "text", value: "Цена " },
      { kind: "math", value: "x+1", display: false },
      { kind: "text", value: " тг " },
      { kind: "math", value: "\\frac{a}{b}", display: true },
      { kind: "text", value: "!" },
    ]);
  });
  it("returns plain text as is", () => {
    expect(splitMath("без формул")).toEqual([{ kind: "text", value: "без формул" }]);
  });
});
