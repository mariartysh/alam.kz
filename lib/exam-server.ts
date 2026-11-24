import "server-only";
import { randomUUID } from "crypto";
import { sql } from "./db";
import { EXAM } from "@/content/exam-config";
import { buildVariant, type Candidate } from "./exam";
import { createAttempt, updateReview, type Attempt } from "./attempts";
import { getQuestions } from "./questions";

/** Запас по времени на сетевые задержки при автозавершении. */
const GRACE_MS = 30_000;

export async function startExam(userId: number) {
  const pool = await sql()<Candidate[]>`
    select q.id, q.topic_id as topic, q.difficulty,
           exists (select 1 from answers a where a.user_id = ${userId} and a.question_id = q.id) as seen
    from questions q where q.status = 'published'`;
  const ids = buildVariant(pool, randomUUID());
  if (!ids.length) return null;
  const deadline = new Date(Date.now() + EXAM.minutes * 60_000);
  return createAttempt(userId, "exam", { questionIds: ids, deadline });
}

export function isExpired(a: Attempt, now = Date.now()) {
  return !!a.deadline_at && now > a.deadline_at.getTime() + GRACE_MS;
}

/** Сохраняет (или меняет) ответ. Правильность не раскрывается до завершения. */
export async function saveExamAnswer(a: Attempt, questionId: string, chosen: number | null) {
  if (a.finished_at || isExpired(a) || !a.question_ids.includes(questionId)) return false;
  const [q] = await getQuestions([questionId]);
  if (!q) return false;
  const db = sql();
  if (chosen === null) {
    await db`delete from answers where attempt_id = ${a.id} and question_id = ${questionId}`;
    return true;
  }
  await db`
    insert into answers (attempt_id, question_id, user_id, chosen, is_correct)
    values (${a.id}, ${questionId}, ${a.user_id}, ${chosen}, ${chosen === q.answer})
    on conflict (attempt_id, question_id) do update
      set chosen = excluded.chosen, is_correct = excluded.is_correct, answered_at = now()`;
  return true;
}

/** Завершает пробник: балл, статистика дня, очередь ошибок (включая пропущенные). Идемпотентно. */
export async function finishExam(a: Attempt) {
  if (a.finished_at) return a.score ?? 0;
  const db = sql();
  const rows = await db<{ question_id: string; is_correct: boolean }[]>`
    select question_id, is_correct from answers where attempt_id = ${a.id}`;
  const score = rows.filter((r) => r.is_correct).length;
  const done = await db`
    update attempts set finished_at = now(), score = ${score}
    where id = ${a.id} and finished_at is null`;
  if (done.count === 0) return score; // уже завершён параллельным запросом
  const correct = new Map(rows.map((r) => [r.question_id, r.is_correct]));
  for (const qid of a.question_ids) {
    const ok = correct.get(qid) ?? false;
    await db`select bump_activity(${a.user_id}, ${ok})`;
    await updateReview(a.user_id, qid, ok);
  }
  return score;
}

export async function examAnswers(attemptId: string) {
  return sql()<{ question_id: string; chosen: number; is_correct: boolean }[]>`
    select question_id, chosen, is_correct from answers where attempt_id = ${attemptId}`;
}

export async function examHistory(userId: number, limit = 5) {
  return sql()<{ id: string; score: number; total: number; finished_at: Date }[]>`
    select id, score, cardinality(question_ids) as total, finished_at
    from attempts where user_id = ${userId} and mode = 'exam' and finished_at is not null
    order by finished_at desc limit ${limit}`;
}

export async function unfinishedExam(userId: number) {
  const [a] = await sql()<{ id: string }[]>`
    select id from attempts where user_id = ${userId} and mode = 'exam' and finished_at is null
      and deadline_at > now() order by started_at desc limit 1`;
  return a?.id ?? null;
}
