/**
 * Настраивает бота из командной строки (альтернатива GET /api/setup?key=CRON_SECRET).
 *   BOT_TOKEN=... WEBHOOK_SECRET=... NEXT_PUBLIC_APP_URL=https://alam.kz npm run setup-bot
 */
import { Api } from "grammy";
import { setupBot } from "@/lib/bot-setup";
import { appUrl } from "@/lib/app-url";

async function main() {
  const token = process.env.BOT_TOKEN, secret = process.env.WEBHOOK_SECRET;
  if (!token || !secret) throw new Error("Нужны BOT_TOKEN и WEBHOOK_SECRET");
  console.log(await setupBot(new Api(token), appUrl(), secret));
}

main().catch((e) => { console.error(e.message ?? e); process.exit(1); });
