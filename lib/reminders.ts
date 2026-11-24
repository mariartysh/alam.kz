import "server-only";
import { sql } from "./db";
import { almatyDay } from "./streak";
import { activity } from "./stats";
import { fmt, type Lang } from "./i18n";
import { BOT } from "./bot-texts";

export type ReminderTarget = { tg_id: number; first_name: string; lang: Lang; due: number };

/** Кому напомнить в этот час: напоминания включены, бот запущен, сегодня занятий не было. */
export async function reminderTargets(hour: number, limit = 1000) {
  const today = almatyDay();
  return sql()<ReminderTarget[]>`
    select u.tg_id::int, u.first_name, u.lang,
      (select count(*) from review_items r where r.user_id = u.tg_id and r.due_at <= now())::int as due
    from users u
    where u.reminders_on and u.bot_started and u.reminder_hour = ${hour}
      and not exists (select 1 from daily_activity d where d.user_id = u.tg_id and d.day = ${today}::date and d.solved > 0)
    order by u.tg_id limit ${limit}`;
}

export async function reminderText(u: ReminderTarget) {
  const tx = BOT[u.lang];
  const { streak } = await activity(u.tg_id);
  return fmt(tx.remind, {
    name: u.first_name,
    streak: streak > 0 ? fmt(tx.remindStreak, { n: streak }) : "",
    due: u.due > 0 ? fmt(tx.remindDue, { n: u.due }) : "",
  });
}

export function almatyHour(d = new Date()) {
  return Number(new Intl.DateTimeFormat("en-GB", { timeZone: "Asia/Almaty", hour: "2-digit", hour12: false }).format(d)) % 24;
}
