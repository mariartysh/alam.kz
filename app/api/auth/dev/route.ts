import { NextResponse } from "next/server";
import { devLoginEnabled, loginAs } from "@/lib/login";

export async function POST() {
  if (!devLoginEnabled()) return NextResponse.json({ error: "disabled" }, { status: 404 });
  await loginAs({ id: 1000001, first_name: "Тест", username: "dev_user" });
  return NextResponse.json({ ok: true });
}
