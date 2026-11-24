import { describe, expect, it } from "vitest";
import { Api } from "grammy";
import { setupBot } from "./bot-setup";

describe("setupBot", () => {
  it("sets webhook with secret, commands in ru and kk, and menu button", async () => {
    const calls: { method: string; payload: Record<string, unknown> }[] = [];
    const api = new Api("1:test");
    api.config.use(async (_prev, method, payload) => {
      calls.push({ method, payload: payload as Record<string, unknown> });
      const result =
        method === "getMe" ? { id: 1, is_bot: true, first_name: "alam", username: "alam_test_bot" }
        : method === "getWebhookInfo" ? { url: "https://alam-kz.vercel.app/api/bot", has_custom_certificate: false, pending_update_count: 0 }
        : true;
      return { ok: true, result } as never;
    });
    const r = await setupBot(api, "https://alam-kz.vercel.app", "s3cret");
    expect(r).toEqual({ bot: "@alam_test_bot", webhook: "https://alam-kz.vercel.app/api/bot", app: "https://alam-kz.vercel.app" });
    const hook = calls.find((c) => c.method === "setWebhook")!;
    expect(hook.payload).toMatchObject({ url: "https://alam-kz.vercel.app/api/bot", secret_token: "s3cret" });
    const cmds = calls.filter((c) => c.method === "setMyCommands");
    expect(cmds).toHaveLength(2);
    expect(cmds[1].payload.language_code).toBe("kk");
    expect(JSON.stringify(calls.find((c) => c.method === "setChatMenuButton")!.payload)).toContain("alam-kz.vercel.app");
  });
});
