import "server-only";
import { sql } from "./db";

/**
 * Следующая задача темы для практики. Приоритет: никогда не решённые верно,
 * затем остальные; внутри — от простых к сложным, случайно. Уже показанные в этой попытке пропускаются.
 */
export async function nextPracticeQuestion(userId: number, topic: string, attemptId: string): Promise<string | null> {
  const [row] = await sql()<{ id: string }[]>`
    select q.id from questions q
    left join lateral (
      select bool_or(is_correct) as ok from answers a where a.user_id = ${userId} and a.question_id = q.id
    ) s on true
    where q.topic_id = ${topic} and q.status = 'published'
      and q.id not in (select question_id from answers where attempt_id = ${attemptId})
    order by coalesce(s.ok, false), q.difficulty, random()
    limit 1`;
  return row?.id ?? null;
}

export async function topicSize(topic: string) {
  const [r] = await sql()<{ n: number }[]>`select count(*)::int as n from questions where topic_id = ${topic} and status = 'published'`;
  return r.n;
}
