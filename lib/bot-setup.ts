import type { Api } from "grammy";
import { BOT } from "./bot-texts";

/**
 * Настраивает бота: webhook на `${url}/api/bot` с секретом, команды на RU/KZ,
 * кнопку меню, открывающую Mini App. Идемпотентно — можно вызывать повторно.
 */
export async function setupBot(api: Api, url: string, secret: string) {
  await api.setWebhook(`${url}/api/bot`, {
    secret_token: secret,
    allowed_updates: ["message", "callback_query"],
    drop_pending_updates: true,
  });
  for (const [lang, code] of [["ru", undefined], ["kz", "kk"]] as const) {
    const tx = BOT[lang];
    await api.setMyCommands(
      [
        { command: "start", description: tx.cmdStart },
        { command: "lang", description: tx.cmdLang },
        { command: "reminders", description: tx.cmdReminders },
      ],
      code ? { language_code: code } : {},
    );
  }
  await api.setChatMenuButton({ menu_button: { type: "web_app", text: "alam", web_app: { url } } });
  const [me, info] = await Promise.all([api.getMe(), api.getWebhookInfo()]);
  return { bot: `@${me.username}`, webhook: info.url, app: url };
}
