import { timingSafeEqual } from "crypto";
import { NextResponse } from "next/server";
import { getBot } from "@/lib/bot";
import { setupBot } from "@/lib/bot-setup";
import { appUrl } from "@/lib/app-url";

export const dynamic = "force-dynamic";

/**
 * Одноразовая настройка бота после деплоя: открыть в браузере /api/setup?key=<CRON_SECRET>.
 * Выставляет webhook, команды и кнопку меню; безопасно вызывать повторно.
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  const key = new URL(req.url).searchParams.get("key") ?? "";
  const ok = !!secret && key.length === secret.length && timingSafeEqual(Buffer.from(key), Buffer.from(secret));
  if (!ok) return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  if (!process.env.BOT_TOKEN || !process.env.WEBHOOK_SECRET) {
    return NextResponse.json({ error: "Задайте BOT_TOKEN и WEBHOOK_SECRET в настройках Vercel и сделайте Redeploy" }, { status: 500 });
  }
  try {
    const url = appUrl();
    const result = await setupBot(getBot().api, url, process.env.WEBHOOK_SECRET);
    return NextResponse.json({
      ok: true,
      ...result,
      next: `В @BotFather выполните /setdomain для ${result.bot} и укажите ${new URL(url).host} — это нужно для входа через браузер.`,
    });
  } catch (e) {
    return NextResponse.json({ error: (e as Error).message }, { status: 502 });
  }
}
