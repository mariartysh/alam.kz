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
  it("catches mixed scripts and unsafe svg", () => {
    const base = JSON.parse(JSON.stringify(loadQuestions().find((q) => q.id === "percent-001")));
    base.kz.stem = "Бруcок " + base.kz.stem; // латинская c
    base.figure = '<svg onload="x()"></svg>';
    const errs = validateContent({ percent: [base] }).join("\n");
    expect(errs).toContain("смешаны латиница и кириллица");
    expect(errs).toContain("недопустимое в SVG");
  });
  it("catches broken questions", () => {
    const errs = validateContent({ percent: [{ id: "bad", topic: "percent" }] });
    expect(errs.length).toBeGreaterThan(0);
  });
});
