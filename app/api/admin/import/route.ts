import { NextResponse } from "next/server";
import { checkQuestion, requireAdminApi, saveQuestion, type AdminQuestion } from "@/lib/admin";

/** Импорт массива задач (формат банка). Всё или ничего: при любой ошибке ничего не сохраняется. */
export async function POST(req: Request) {
  const s = await requireAdminApi();
  if (s instanceof NextResponse) return s;
  const data = await req.json().catch(() => null);
  const list = Array.isArray(data) ? data : null;
  if (!list) return NextResponse.json({ errors: ["ожидается JSON-массив задач"] }, { status: 400 });
  const errors = list.flatMap((q, i) => checkQuestion(q).map((e) => `#${i}: ${e}`));
  const ids = list.map((q) => q?.id);
  if (new Set(ids).size !== ids.length) errors.push("повторяющиеся id в импорте");
  if (errors.length) return NextResponse.json({ errors }, { status: 422 });
  for (const q of list) await saveQuestion({ ...q, status: "published" } as AdminQuestion);
  return NextResponse.json({ ok: true, count: list.length });
}
