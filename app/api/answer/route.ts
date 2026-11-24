import { NextResponse } from "next/server";
import { body, json, requireApiSession } from "@/lib/api";
import { answerInstant, getAttempt } from "@/lib/attempts";
import { explanationOf, getQuestion } from "@/lib/questions";
import { getLang } from "@/lib/i18n-server";

/** Мгновенная проверка ответа (практика и работа над ошибками). */
export async function POST(req: Request) {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const b = await body<{ attemptId: string; questionId: string; chosen: number; timeMs: number }>(req);
  if (!b.attemptId || !b.questionId || !Number.isInteger(b.chosen)) return json({ error: "bad request" }, 400);
  const a = await getAttempt(b.attemptId, s.uid);
  if (!a || a.mode === "exam" || a.finished_at) return json({ error: "not found" }, 404);
  if (a.mode === "mistakes" && !a.question_ids.includes(b.questionId)) return json({ error: "not in attempt" }, 400);
  if (a.mode === "practice") {
    const ok = await getQuestion(b.questionId);
    if (!ok || ok.topic_id !== a.topic_id) return json({ error: "not in topic" }, 400);
  }
  const timeMs = Number.isFinite(b.timeMs) ? Math.min(Math.max(0, Math.round(b.timeMs!)), 3_600_000) : null;
  const r = await answerInstant(a, b.questionId, b.chosen!, timeMs);
  if (!r) return json({ error: "not found" }, 404);
  return json({ correct: r.correct, answer: r.q.answer, chosen: r.chosen, explanation: explanationOf(r.q, await getLang()) });
}
