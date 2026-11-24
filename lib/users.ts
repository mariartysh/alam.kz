import "server-only";
import { sql } from "./db";
import type { TgUser } from "./telegram-auth";
import type { Lang } from "./i18n";

export type UserRow = {
  tg_id: number; first_name: string; last_name: string | null; username: string | null;
  photo_url: string | null; lang: Lang; is_premium: boolean; reminders_on: boolean; reminder_hour: number;
};

export async function upsertUser(u: TgUser): Promise<UserRow> {
  const lang: Lang = u.language_code === "kk" ? "kz" : "ru";
  const [row] = await sql()<UserRow[]>`
    insert into users (tg_id, first_name, last_name, username, photo_url, lang)
    values (${u.id}, ${u.first_name}, ${u.last_name ?? null}, ${u.username ?? null}, ${u.photo_url ?? null}, ${lang})
    on conflict (tg_id) do update set first_name = excluded.first_name, last_name = excluded.last_name,
      username = excluded.username, photo_url = coalesce(excluded.photo_url, users.photo_url), last_seen_at = now()
    returning tg_id::int, first_name, last_name, username, photo_url, lang, is_premium, reminders_on, reminder_hour`;
  return row;
}

export async function getUser(id: number): Promise<UserRow | null> {
  const [row] = await sql()<UserRow[]>`
    select tg_id::int, first_name, last_name, username, photo_url, lang, is_premium, reminders_on, reminder_hour
    from users where tg_id = ${id}`;
  return row ?? null;
}

export { isAdmin } from "./admin-check";
