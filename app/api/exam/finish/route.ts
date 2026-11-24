import { NextResponse } from "next/server";
import { body, json, requireApiSession } from "@/lib/api";
import { getAttempt } from "@/lib/attempts";
import { finishExam } from "@/lib/exam-server";

export async function POST(req: Request) {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const { attemptId } = await body<{ attemptId: string }>(req);
  const a = attemptId ? await getAttempt(attemptId, s.uid) : null;
  if (!a || a.mode !== "exam") return json({ error: "not found" }, 404);
  return json({ score: await finishExam(a) });
}
