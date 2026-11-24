import { describe, expect, it } from "vitest";
import ru from "@/messages/ru.json";
import kz from "@/messages/kz.json";
import { isLang, translator } from "./i18n";

describe("i18n", () => {
  it("has the same keys in ru and kz", () => {
    expect(Object.keys(kz).sort()).toEqual(Object.keys(ru).sort());
  });
  it("translates and validates langs", () => {
    expect(translator("kz")("common.back")).toBe("Артқа");
    expect(isLang("kz")).toBe(true);
    expect(isLang("en")).toBe(false);
  });
});
