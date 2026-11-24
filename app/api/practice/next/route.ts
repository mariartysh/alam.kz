import { NextResponse } from "next/server";
import { body, json, requireApiSession } from "@/lib/api";
import { answeredIds, getAttempt } from "@/lib/attempts";
import { nextPracticeQuestion } from "@/lib/practice";
import { getQuestion, toPublic } from "@/lib/questions";
import { getLang } from "@/lib/i18n-server";

export async function POST(req: Request) {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const { attemptId } = await body<{ attemptId: string }>(req);
  const a = attemptId ? await getAttempt(attemptId, s.uid) : null;
  if (!a || a.mode !== "practice" || !a.topic_id) return json({ error: "not found" }, 404);
  const done = (await answeredIds(a.id)).size;
  const id = await nextPracticeQuestion(s.uid, a.topic_id, a.id);
  const q = id ? await getQuestion(id) : null;
  return json({ index: done + 1, question: q ? toPublic(q, await getLang(), `${a.id}:${q.id}`) : null });
}
