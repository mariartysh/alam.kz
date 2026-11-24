import { NextResponse } from "next/server";
import { body, json, requireApiSession } from "@/lib/api";
import { getAttempt } from "@/lib/attempts";
import { saveExamAnswer } from "@/lib/exam-server";

export async function POST(req: Request) {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const b = await body<{ attemptId: string; questionId: string; chosen: number | null }>(req);
  const a = b.attemptId ? await getAttempt(b.attemptId, s.uid) : null;
  if (!a || a.mode !== "exam" || !b.questionId) return json({ error: "not found" }, 404);
  const chosen = b.chosen === null ? null : Number.isInteger(b.chosen) ? b.chosen! : undefined;
  if (chosen === undefined) return json({ error: "bad request" }, 400);
  const ok = await saveExamAnswer(a, b.questionId, chosen);
  return ok ? json({ ok: true }) : json({ error: "closed" }, 409);
}
