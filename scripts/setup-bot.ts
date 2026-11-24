/**
 * Настраивает бота: webhook, команды (RU/KZ), кнопку меню Mini App.
 *   BOT_TOKEN=... WEBHOOK_SECRET=... NEXT_PUBLIC_APP_URL=https://alam.kz npm run setup-bot
 */
import { Api } from "grammy";
import { BOT } from "@/lib/bot-texts";

async function main() {
  const token = process.env.BOT_TOKEN, secret = process.env.WEBHOOK_SECRET;
  const url = process.env.NEXT_PUBLIC_APP_URL ?? "https://alam.kz";
  if (!token || !secret) throw new Error("Нужны BOT_TOKEN и WEBHOOK_SECRET");
  const api = new Api(token);
  await api.setWebhook(`${url}/api/bot`, { secret_token: secret, allowed_updates: ["message", "callback_query"], drop_pending_updates: true });
  for (const [lang, code] of [["ru", undefined], ["kz", "kk"]] as const) {
    const tx = BOT[lang];
    await api.setMyCommands(
      [{ command: "start", description: tx.cmdStart }, { command: "lang", description: tx.cmdLang }, { command: "reminders", description: tx.cmdReminders }],
      code ? { language_code: code } : {},
    );
  }
  await api.setChatMenuButton({ menu_button: { type: "web_app", text: "alam", web_app: { url } } });
  console.log("Webhook:", (await api.getWebhookInfo()).url);
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
