import { NextResponse } from "next/server";
import { json, requireApiSession } from "@/lib/api";
import { createAttempt } from "@/lib/attempts";
import { dueQuestionIds } from "@/lib/mistakes";

export async function POST() {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const ids = await dueQuestionIds(s.uid);
  if (!ids.length) return json({ attemptId: null, total: 0 });
  const a = await createAttempt(s.uid, "mistakes", { questionIds: ids });
  return json({ attemptId: a.id, total: ids.length });
}
