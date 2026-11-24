import { NextResponse } from "next/server";
import { verifyLoginWidget, verifyWebAppInitData } from "@/lib/telegram-auth";
import { loginAs } from "@/lib/login";

export async function POST(req: Request) {
  const token = process.env.BOT_TOKEN;
  if (!token) return NextResponse.json({ error: "BOT_TOKEN не задан" }, { status: 500 });
  const body = (await req.json().catch(() => null)) as { initData?: string; widget?: Record<string, string | number> } | null;
  const tgUser = body?.initData
    ? verifyWebAppInitData(body.initData, token)
    : body?.widget
      ? verifyLoginWidget(body.widget, token)
      : null;
  if (!tgUser) return NextResponse.json({ error: "invalid signature" }, { status: 401 });
  const user = await loginAs(tgUser);
  return NextResponse.json({ ok: true, user: { id: user.tg_id, name: user.first_name } });
}
