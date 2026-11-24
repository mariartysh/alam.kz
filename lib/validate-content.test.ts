import { describe, expect, it } from "vitest";
import { validateContent } from "./validate-content";
import { loadQuestions } from "@/content/questions";

describe("content bank", () => {
  it("is valid", () => {
    expect(validateContent()).toEqual([]);
  });
  it("loads", () => {
    expect(loadQuestions().length).toBeGreaterThan(0);
  });
  it("catches broken questions", () => {
    const errs = validateContent({ percent: [{ id: "bad", topic: "percent" }] });
    expect(errs.length).toBeGreaterThan(0);
  });
});
