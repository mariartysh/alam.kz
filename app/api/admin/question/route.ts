import { NextResponse } from "next/server";
import { checkQuestion, requireAdminApi, saveQuestion, type AdminQuestion } from "@/lib/admin";
import { sql } from "@/lib/db";

/** Создание/правка задачи. Тело — задача в формате банка + status. */
export async function PUT(req: Request) {
  const s = await requireAdminApi();
  if (s instanceof NextResponse) return s;
  const raw = (await req.json().catch(() => null)) as (AdminQuestion & { status?: string }) | null;
  if (!raw) return NextResponse.json({ errors: ["пустой запрос"] }, { status: 400 });
  const { status, ...q } = raw;
  if (q.figure === "") delete q.figure;
  for (const lang of ["ru", "kz"] as const) if (q[lang] && !q[lang].table) delete q[lang].table;
  const errors = checkQuestion(q);
  if (status !== "draft" && status !== "published") errors.push("status: draft или published");
  if (errors.length) return NextResponse.json({ errors }, { status: 422 });
  await saveQuestion({ ...q, status } as AdminQuestion);
  return NextResponse.json({ ok: true });
}

export async function DELETE(req: Request) {
  const s = await requireAdminApi();
  if (s instanceof NextResponse) return s;
  const id = new URL(req.url).searchParams.get("id");
  if (!id) return NextResponse.json({ error: "id" }, { status: 400 });
  // Ответы пользователей ссылаются на задачу, поэтому удаление = снятие с публикации.
  await sql()`update questions set status = 'draft', updated_at = now() where id = ${id}`;
  return NextResponse.json({ ok: true });
}
