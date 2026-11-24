import { NextResponse } from "next/server";
import { json, requireApiSession } from "@/lib/api";
import { startExam, unfinishedExam } from "@/lib/exam-server";

export async function POST() {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const open = await unfinishedExam(s.uid);
  if (open) return json({ attemptId: open });
  const a = await startExam(s.uid);
  if (!a) return json({ error: "no questions" }, 409);
  return json({ attemptId: a.id });
}
