import "server-only";
import { cookies } from "next/headers";
import { upsertUser } from "./users";
import { setSessionCookie } from "./session";
import { LANG_COOKIE } from "./i18n";
import type { TgUser } from "./telegram-auth";

/** Создаёт/обновляет пользователя и выставляет cookie сессии (и языка при первом входе). */
export async function loginAs(u: TgUser) {
  const user = await upsertUser(u);
  await setSessionCookie({ uid: user.tg_id, name: user.first_name, username: user.username ?? undefined });
  const jar = await cookies();
  if (!jar.get(LANG_COOKIE)) jar.set(LANG_COOKIE, user.lang, { path: "/", maxAge: 31536000, sameSite: "lax" });
  return user;
}

/** Вход без Telegram для локальной разработки. В production выключен всегда. */
export function devLoginEnabled() {
  return process.env.NODE_ENV !== "production" && process.env.ALLOW_DEV_LOGIN === "1";
}
