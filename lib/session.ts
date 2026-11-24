import "server-only";
import { SignJWT, jwtVerify } from "jose";
import { cookies } from "next/headers";

export const SESSION_COOKIE = "alam_session";
const MAX_AGE = 60 * 60 * 24 * 30;

export type Session = { uid: number; name: string };

function key() {
  const s = process.env.SESSION_SECRET;
  if (!s || s.length < 32) throw new Error("SESSION_SECRET должен быть не короче 32 символов");
  return new TextEncoder().encode(s);
}

export async function createSessionToken(s: Session) {
  return new SignJWT({ name: s.name })
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(String(s.uid))
    .setIssuedAt()
    .setExpirationTime(`${MAX_AGE}s`)
    .sign(key());
}

export async function readSessionToken(token: string | undefined): Promise<Session | null> {
  if (!token) return null;
  try {
    const { payload } = await jwtVerify(token, key(), { algorithms: ["HS256"] });
    const uid = Number(payload.sub);
    return Number.isSafeInteger(uid) ? { uid, name: String(payload.name ?? "") } : null;
  } catch {
    return null;
  }
}

/** Сессия текущего запроса (server components / route handlers). */
export async function getSession() {
  return readSessionToken((await cookies()).get(SESSION_COOKIE)?.value);
}

export async function setSessionCookie(s: Session) {
  (await cookies()).set(SESSION_COOKIE, await createSessionToken(s), {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    // Mini App открывается во фрейме Telegram Web, поэтому в production нужен SameSite=None.
    sameSite: process.env.NODE_ENV === "production" ? "none" : "lax",
    path: "/",
    maxAge: MAX_AGE,
  });
}

export async function clearSessionCookie() {
  (await cookies()).delete(SESSION_COOKIE);
}
