import { NextResponse } from "next/server";
import { listAdminQuestions, requireAdminApi } from "@/lib/admin";

/** Выгрузка банка из БД в формате content/questions/*.json, сгруппированная по темам. */
export async function GET() {
  const s = await requireAdminApi();
  if (s instanceof NextResponse) return s;
  const byTopic: Record<string, unknown[]> = {};
  for (const { status, ...q } of await listAdminQuestions()) {
    (byTopic[q.topic] ??= []).push(status === "draft" ? { ...q, _draft: true } : q);
  }
  return new NextResponse(JSON.stringify(byTopic, null, 2), {
    headers: { "content-type": "application/json; charset=utf-8", "content-disposition": 'attachment; filename="alam-questions.json"' },
  });
}
