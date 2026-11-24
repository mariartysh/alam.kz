import { timingSafeEqual } from "crypto";
import { webhookCallback } from "grammy";
import { getBot } from "@/lib/bot";

export const dynamic = "force-dynamic";

function sameSecret(a: string | null, b: string) {
  const x = Buffer.from(a ?? ""), y = Buffer.from(b);
  return x.length === y.length && timingSafeEqual(x, y);
}

/**
 * Webhook Telegram. Секрет проверяется до обращения к grammY: иначе на каждый
 * посторонний запрос бот при холодном старте ходил бы в Telegram за getMe.
 */
export async function POST(req: Request) {
  const secret = process.env.WEBHOOK_SECRET;
  if (!secret) return new Response("WEBHOOK_SECRET не задан", { status: 500 });
  if (!sameSecret(req.headers.get("x-telegram-bot-api-secret-token"), secret)) return new Response("unauthorized", { status: 401 });
  return webhookCallback(getBot(), "std/http", { secretToken: secret })(req);
}
