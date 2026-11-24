import "server-only";
import { Bot, GrammyError, InlineKeyboard, type BotConfig, type Context } from "grammy";
import { sql } from "./db";
import { fmt, type Lang } from "./i18n";
import { BOT, type BotKey } from "./bot-texts";
import { upsertUser } from "./users";
import { appUrl } from "./app-url";

export { appUrl };

let botUsername: string | null = null;

/** Username бота: из NEXT_PUBLIC_BOT_USERNAME или через getMe (кэшируется в памяти процесса). */
export async function getBotUsername(): Promise<string> {
  const fromEnv = process.env.NEXT_PUBLIC_BOT_USERNAME?.trim();
  if (fromEnv) return fromEnv.replace(/^@/, "");
  if (botUsername) return botUsername;
  if (!process.env.BOT_TOKEN) return "";
  try {
    botUsername = (await getBot().api.getMe()).username;
  } catch (e) {
    console.error("getMe failed", e);
    return "";
  }
  return botUsername;
}

export function openKeyboard(lang: Lang) {
  return new InlineKeyboard().webApp(BOT[lang].open, appUrl());
}

async function userLang(ctx: Context): Promise<Lang> {
  if (!ctx.from) return "ru";
  const [r] = await sql()<{ lang: Lang }[]>`select lang from users where tg_id = ${ctx.from.id}`;
  return r?.lang ?? (ctx.from.language_code === "kk" ? "kz" : "ru");
}

function remindersKeyboard(lang: Lang, on: boolean) {
  return new InlineKeyboard().text(on ? `🔕 ${BOT[lang].btnOff}` : `🔔 ${BOT[lang].btnOn}`, on ? "rem:off" : "rem:on");
}

let bot: Bot | null = null;

export function getBot(): Bot {
  if (bot) return bot;
  const token = process.env.BOT_TOKEN;
  if (!token) throw new Error("BOT_TOKEN не задан");
  bot = createBot(token);
  return bot;
}

export function createBot(token: string, config?: BotConfig<Context>): Bot {
  const b = new Bot(token, config);
  const t = (lang: Lang, k: BotKey, vars: Record<string, string | number> = {}) => fmt(BOT[lang][k], vars);

  b.command("start", async (ctx) => {
    if (!ctx.from) return;
    await upsertUser({ ...ctx.from, photo_url: undefined });
    await sql()`update users set bot_started = true where tg_id = ${ctx.from.id}`;
    const lang = await userLang(ctx);
    await ctx.reply(t(lang, "start", { name: ctx.from.first_name }), { reply_markup: openKeyboard(lang) });
  });

  b.command("help", async (ctx) => ctx.reply(t(await userLang(ctx), "help")));

  b.command("lang", async (ctx) => {
    const lang = await userLang(ctx);
    await ctx.reply(t(lang, "langChoose"), {
      reply_markup: new InlineKeyboard().text("Русский", "lang:ru").text("Қазақша", "lang:kz"),
    });
  });

  b.callbackQuery(/^lang:(ru|kz)$/, async (ctx) => {
    const lang = ctx.match[1] as Lang;
    await sql()`update users set lang = ${lang} where tg_id = ${ctx.from.id}`;
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(lang, "langSet"));
  });

  b.command("reminders", async (ctx) => {
    if (!ctx.from) return;
    const lang = await userLang(ctx);
    const [u] = await sql()<{ reminders_on: boolean }[]>`select reminders_on from users where tg_id = ${ctx.from.id}`;
    const on = u?.reminders_on ?? false;
    await ctx.reply(t(lang, on ? "remOn" : "remOff"), { reply_markup: remindersKeyboard(lang, on) });
  });

  b.callbackQuery(/^rem:(on|off)$/, async (ctx) => {
    const on = ctx.match[1] === "on";
    await sql()`update users set reminders_on = ${on}, bot_started = true where tg_id = ${ctx.from.id}`;
    const lang = await userLang(ctx);
    await ctx.answerCallbackQuery();
    await ctx.editMessageText(t(lang, on ? "remOn" : "remOff"), { reply_markup: remindersKeyboard(lang, on) });
  });

  // Любое другое сообщение: подсказка и кнопка открытия.
  b.on("message", async (ctx) => {
    const lang = await userLang(ctx);
    await ctx.reply(t(lang, "help"), { reply_markup: openKeyboard(lang) });
  });

  b.catch((err) => console.error("bot error", err.error));
  return b;
}

/** true — пользователь заблокировал бота или удалил аккаунт: писать ему больше нельзя. */
export function isBlocked(e: unknown) {
  return e instanceof GrammyError && (e.error_code === 403 || /chat not found/i.test(e.description));
}
