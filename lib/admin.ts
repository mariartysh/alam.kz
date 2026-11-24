import "server-only";
import { notFound } from "next/navigation";
import { NextResponse } from "next/server";
import { getSession } from "./session";
import { isAdmin } from "./users";
import { sql } from "./db";
import type postgres from "postgres";
import type { Question } from "./question-schema";
import { validateContent } from "./validate-content";

export async function requireAdminPage() {
  const s = await getSession();
  if (!s || !isAdmin(s.uid)) notFound();
  return s;
}

export async function requireAdminApi() {
  const s = await getSession();
  return s && isAdmin(s.uid) ? s : NextResponse.json({ error: "forbidden" }, { status: 403 });
}

export type AdminQuestion = Question & { status: "draft" | "published" };

type Row = { id: string; topic_id: string; difficulty: "A" | "B" | "C"; answer: number; figure: string | null;
  content: { ru: Question["ru"]; kz: Question["kz"] }; status: "draft" | "published" };

function fromRow(r: Row): AdminQuestion {
  return { id: r.id, topic: r.topic_id as Question["topic"], difficulty: r.difficulty, answer: r.answer,
    ...(r.figure ? { figure: r.figure } : {}), ru: r.content.ru, kz: r.content.kz, status: r.status };
}

export async function listAdminQuestions(): Promise<AdminQuestion[]> {
  const rows = await sql()<Row[]>`select id, topic_id, difficulty, answer, figure, content, status from questions order by id`;
  return rows.map(fromRow);
}

export async function getAdminQuestion(id: string) {
  const [r] = await sql()<Row[]>`select id, topic_id, difficulty, answer, figure, content, status from questions where id = ${id}`;
  return r ? fromRow(r) : null;
}

/** Проверяет задачу теми же правилами, что и банк в репозитории. */
export function checkQuestion(q: unknown): string[] {
  const topic = (q as { topic?: string })?.topic ?? "unknown";
  return validateContent({ [topic]: [q] });
}

export async function saveQuestion(q: AdminQuestion) {
  const { status, ...rest } = q;
  const content = sql().json({ ru: rest.ru, kz: rest.kz } as unknown as postgres.JSONValue);
  await sql()`
    insert into questions (id, topic_id, difficulty, answer, figure, content, status, source)
    values (${q.id}, ${q.topic}, ${q.difficulty}, ${q.answer}, ${q.figure ?? null}, ${content}, ${status}, 'admin')
    on conflict (id) do update set topic_id = excluded.topic_id, difficulty = excluded.difficulty, answer = excluded.answer,
      figure = excluded.figure, content = excluded.content, status = excluded.status, updated_at = now()`;
}
