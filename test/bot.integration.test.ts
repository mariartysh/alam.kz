/**
 * Интеграционный тест бота и напоминаний на реальной БД.
 * Запускается, только если задан TEST_DATABASE_URL (пустая/тестовая база — таблицы users и т.д. будут изменены).
 */
import { afterAll, beforeAll, describe, expect, it } from "vitest";
import type { Update, UserFromGetMe } from "grammy/types";

const url = process.env.TEST_DATABASE_URL;
const d = url ? describe : describe.skip;
const UID = 990001;

d("bot + reminders", async () => {
  process.env.DATABASE_URL = url;
  const { createBot } = await import("@/lib/bot");
  const { sql } = await import("@/lib/db");
  const { reminderTargets, reminderText } = await import("@/lib/reminders");

  const calls: { method: string; payload: Record<string, unknown> }[] = [];
  const botInfo = { id: 1, is_bot: true, first_name: "alam", username: "alam_kz_bot" } as UserFromGetMe;
  const bot = createBot("1:test", { botInfo });
  bot.api.config.use(async (_prev, method, payload) => {
    calls.push({ method, payload: payload as Record<string, unknown> });
    return { ok: true, result: true } as never;
  });
  let updateId = 1;
  const msg = (text: string, language_code = "kk"): Update => ({
    update_id: updateId++,
    message: {
      message_id: updateId, date: 0, text, chat: { id: UID, type: "private", first_name: "Дана" },
      from: { id: UID, is_bot: false, first_name: "Дана", language_code },
      entities: text.startsWith("/") ? [{ type: "bot_command", offset: 0, length: text.split(" ")[0].length }] : [],
    },
  });
  const cb = (data: string): Update => ({
    update_id: updateId++,
    callback_query: {
      id: String(updateId), chat_instance: "x", data,
      from: { id: UID, is_bot: false, first_name: "Дана" },
      message: { message_id: 5, date: 0, chat: { id: UID, type: "private", first_name: "Дана" }, text: "x" },
    },
  });

  beforeAll(async () => { await sql()`delete from users where tg_id = ${UID}`; });
  afterAll(async () => { await sql()`delete from users where tg_id = ${UID}`; await sql().end(); });

  it("/start registers the user in Kazakh and shows the Mini App button", async () => {
    await bot.handleUpdate(msg("/start"));
    const reply = calls.at(-1)!;
    expect(reply.method).toBe("sendMessage");
    expect(String(reply.payload.text)).toContain("Сәлем, Дана!");
    expect(String(reply.payload.text)).toContain("жаттықтырғышпын");
    expect(JSON.stringify(reply.payload.reply_markup)).toContain("web_app");
    const [u] = await sql()`select lang, bot_started from users where tg_id = ${UID}`;
    expect(u).toMatchObject({ lang: "kz", bot_started: true });
  });

  it("/lang switches language", async () => {
    await bot.handleUpdate(cb("lang:ru"));
    expect(calls.at(-1)!.payload.text).toBe("Язык: русский ✅");
    const [u] = await sql()`select lang from users where tg_id = ${UID}`;
    expect(u.lang).toBe("ru");
  });

  it("toggles reminders", async () => {
    await bot.handleUpdate(cb("rem:off"));
    expect(String(calls.at(-1)!.payload.text)).toContain("выключены");
    expect((await reminderTargets(19)).some((t) => t.tg_id === UID)).toBe(false);
    await bot.handleUpdate(cb("rem:on"));
  });

  it("targets inactive users at their hour and skips active ones", async () => {
    const targets = await reminderTargets(19);
    const me = targets.find((t) => t.tg_id === UID)!;
    expect(me).toBeTruthy();
    expect(await reminderText(me)).toContain("Привет, Дана!");
    expect((await reminderTargets(8)).some((t) => t.tg_id === UID)).toBe(false);
    await sql()`select bump_activity(${UID}, true)`;
    expect((await reminderTargets(19)).some((t) => t.tg_id === UID)).toBe(false);
  });
});
