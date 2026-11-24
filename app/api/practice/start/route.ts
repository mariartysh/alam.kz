import { NextResponse } from "next/server";
import { body, json, requireApiSession } from "@/lib/api";
import { createAttempt } from "@/lib/attempts";
import { topicSize } from "@/lib/practice";
import { getTopic } from "@/content/topics";

export async function POST(req: Request) {
  const s = await requireApiSession();
  if (s instanceof NextResponse) return s;
  const { topic } = await body<{ topic: string }>(req);
  if (!topic || !getTopic(topic)) return json({ error: "bad topic" }, 400);
  const a = await createAttempt(s.uid, "practice", { topic });
  return json({ attemptId: a.id, total: await topicSize(topic) });
}
