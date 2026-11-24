import { describe, expect, it } from "vitest";
import { createHash, createHmac } from "crypto";
import { verifyLoginWidget, verifyWebAppInitData } from "./telegram-auth";

const TOKEN = "123456:TEST-token";
const NOW = 1_800_000_000;

function signWebApp(fields: Record<string, string>) {
  const dcs = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join("\n");
  const secret = createHmac("sha256", "WebAppData").update(TOKEN).digest();
  const hash = createHmac("sha256", secret).update(dcs).digest("hex");
  return new URLSearchParams({ ...fields, hash }).toString();
}

function signWidget(fields: Record<string, string | number>) {
  const dcs = Object.keys(fields).sort().map((k) => `${k}=${fields[k]}`).join("\n");
  const hash = createHmac("sha256", createHash("sha256").update(TOKEN).digest()).update(dcs).digest("hex");
  return { ...fields, hash };
}

describe("verifyWebAppInitData", () => {
  const user = JSON.stringify({ id: 42, first_name: "Айгерим", username: "aigerim" });
  it("accepts a valid signature", () => {
    const init = signWebApp({ auth_date: String(NOW - 10), query_id: "q", user });
    expect(verifyWebAppInitData(init, TOKEN, 86400, NOW)?.id).toBe(42);
  });
  it("rejects a tampered payload", () => {
    const init = signWebApp({ auth_date: String(NOW - 10), user }).replace("42", "43");
    expect(verifyWebAppInitData(init, TOKEN, 86400, NOW)).toBeNull();
  });
  it("rejects a wrong token and stale data", () => {
    const init = signWebApp({ auth_date: String(NOW - 10), user });
    expect(verifyWebAppInitData(init, "other", 86400, NOW)).toBeNull();
    const old = signWebApp({ auth_date: String(NOW - 2 * 86400), user });
    expect(verifyWebAppInitData(old, TOKEN, 86400, NOW)).toBeNull();
  });
});

describe("verifyLoginWidget", () => {
  it("accepts a valid widget payload", () => {
    const data = signWidget({ id: 7, first_name: "Ерлан", auth_date: NOW - 5 });
    expect(verifyLoginWidget(data, TOKEN, 86400, NOW)).toMatchObject({ id: 7, first_name: "Ерлан" });
  });
  it("rejects tampering", () => {
    const data = signWidget({ id: 7, first_name: "Ерлан", auth_date: NOW - 5 });
    expect(verifyLoginWidget({ ...data, id: 8 }, TOKEN, 86400, NOW)).toBeNull();
  });
});
