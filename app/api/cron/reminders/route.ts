import { NextResponse } from "next/server";
import { getBot, isBlocked, openKeyboard } from "@/lib/bot";
import { almatyHour, reminderTargets, reminderText } from "@/lib/reminders";
import { sql } from "@/lib/db";

export const dynamic = "force-dynamic";
export const maxDuration = 60;

/**
 * Рассылка напоминаний. Vercel Cron вызывает GET с заголовком Authorization: Bearer CRON_SECRET.
 * ?hour=19 — разослать для указанного часа (для ручного запуска).
 */
export async function GET(req: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || req.headers.get("authorization") !== `Bearer ${secret}`) {
    return NextResponse.json({ error: "unauthorized" }, { status: 401 });
  }
  const param = new URL(req.url).searchParams.get("hour");
  const hour = param !== null && /^\d{1,2}$/.test(param) ? Number(param) : almatyHour();
  const targets = await reminderTargets(hour);
  const bot = getBot();
  let sent = 0, blocked = 0, failed = 0;
  const started = Date.now();
  for (const u of targets) {
    if (Date.now() - started > 50_000) break; // не выходим за maxDuration
    try {
      await bot.api.sendMessage(u.tg_id, await reminderText(u), { reply_markup: openKeyboard(u.lang) });
      sent++;
    } catch (e) {
      if (isBlocked(e)) { blocked++; await sql()`update users set bot_started = false where tg_id = ${u.tg_id}`; }
      else failed++;
    }
    await new Promise((r) => setTimeout(r, 40)); // ≤ 25 сообщений в секунду
  }
  return NextResponse.json({ hour, targets: targets.length, sent, blocked, failed });
}
