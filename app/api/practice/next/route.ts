import { NextResponse } from "next/server";
import { body, json, requireApiSession } from "@/lib/api";
import { answeredIds, getAttempt } from "@/lib/attempts";
import { nextPracticeQuestion } from "@/lib/practice";
import { getQuestion, toPublic } from "@/lib/questions";
import { getLang } from "@/lib/i18n-server";

/** Следующая задача для режимов с мгновенной проверкой: практика по теме и работа над ошибками. */
export async function POST(req: Request) {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const { attemptId } = await body<{ attemptId: string }>(req);
  const a = attemptId ? await getAttempt(attemptId, s.uid) : null;
  if (!a || a.mode === "exam") return json({ error: "not found" }, 404);
  const answered = await answeredIds(a.id);
  const id = a.mode === "practice"
    ? await nextPracticeQuestion(s.uid, a.topic_id!, a.id)
    : a.question_ids.find((q) => !answered.has(q)) ?? null;
  const q = id ? await getQuestion(id) : null;
  return json({ index: answered.size + 1, question: q ? toPublic(q, await getLang(), `${a.id}:${q.id}`) : null });
}
