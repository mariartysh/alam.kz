import "server-only";
import { NextResponse } from "next/server";
import { getSession, type Session } from "./session";

export function json(data: unknown, status = 200) {
  return NextResponse.json(data, { status });
}

/** Сессия или ответ 401 для route handlers. */
export async function requireApiSession(): Promise<Session | NextResponse> {
  const s = await getSession();
  return s ?? json({ error: "unauthorized" }, 401);
}

export async function body<T>(req: Request): Promise<Partial<T>> {
  return ((await req.json().catch(() => null)) ?? {}) as Partial<T>;
}
