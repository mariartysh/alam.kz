import { describe, expect, it } from "vitest";
import { appUrl } from "./app-url";

describe("appUrl", () => {
  it("prefers explicit url, then vercel domain, then alam.kz", () => {
    expect(appUrl({ NEXT_PUBLIC_APP_URL: "https://alam.kz/", VERCEL_PROJECT_PRODUCTION_URL: "x.vercel.app" })).toBe("https://alam.kz");
    expect(appUrl({ VERCEL_PROJECT_PRODUCTION_URL: "alam-kz.vercel.app" })).toBe("https://alam-kz.vercel.app");
    expect(appUrl({})).toBe("https://alam.kz");
  });
});
