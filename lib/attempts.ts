import "server-only";
import { sql } from "./db";
import { nextReview } from "./srs";
import { getQuestion } from "./questions";

export type Mode = "practice" | "exam" | "mistakes";
export type Attempt = {
  id: string; user_id: number; mode: Mode; topic_id: string | null; question_ids: string[];
  deadline_at: Date | null; finished_at: Date | null; score: number | null;
};

export async function createAttempt(userId: number, mode: Mode, opts: { topic?: string; questionIds?: string[]; deadline?: Date } = {}) {
  const [a] = await sql()<Attempt[]>`
    insert into attempts (user_id, mode, topic_id, question_ids, deadline_at)
    values (${userId}, ${mode}, ${opts.topic ?? null}, ${opts.questionIds ?? []}, ${opts.deadline ?? null})
    returning id, user_id::int, mode, topic_id, question_ids, deadline_at, finished_at, score`;
  return a;
}

export async function getAttempt(id: string, userId: number): Promise<Attempt | null> {
  if (!/^[0-9a-f-]{36}$/i.test(id)) return null;
  const [a] = await sql()<Attempt[]>`
    select id, user_id::int, mode, topic_id, question_ids, deadline_at, finished_at, score
    from attempts where id = ${id} and user_id = ${userId}`;
  return a ?? null;
}

export async function answeredIds(attemptId: string) {
  const rows = await sql()<{ question_id: string }[]>`select question_id from answers where attempt_id = ${attemptId}`;
  return new Set(rows.map((r) => r.question_id));
}

/** Обновляет очередь «работы над ошибками» после ответа. */
export async function updateReview(userId: number, questionId: string, correct: boolean) {
  const db = sql();
  const [prev] = await db<{ box: number; due_at: Date }[]>`
    select box, due_at from review_items where user_id = ${userId} and question_id = ${questionId}`;
  const next = nextReview(prev ? { box: prev.box, dueAt: prev.due_at } : null, correct);
  if (!next) {
    if (prev) await db`delete from review_items where user_id = ${userId} and question_id = ${questionId}`;
    return;
  }
  await db`
    insert into review_items (user_id, question_id, box, due_at) values (${userId}, ${questionId}, ${next.box}, ${next.dueAt})
    on conflict (user_id, question_id) do update set box = excluded.box, due_at = excluded.due_at, updated_at = now()`;
}

/**
 * Ответ в режиме практики или ошибок: проверка, запись, стрик, очередь повторения.
 * Повторный ответ на ту же задачу в попытке не пересчитывается.
 */
export async function answerInstant(a: Attempt, questionId: string, chosen: number, timeMs: number | null) {
  const q = await getQuestion(questionId);
  if (!q) return null;
  const correct = chosen === q.answer;
  const db = sql();
  const res = await db`
    insert into answers (attempt_id, question_id, user_id, chosen, is_correct, time_ms)
    values (${a.id}, ${questionId}, ${a.user_id}, ${chosen}, ${correct}, ${timeMs})
    on conflict do nothing`;
  if (res.count === 0) {
    const [prev] = await db<{ chosen: number; is_correct: boolean }[]>`
      select chosen, is_correct from answers where attempt_id = ${a.id} and question_id = ${questionId}`;
    return { q, correct: prev.is_correct, chosen: prev.chosen };
  }
  await db`select bump_activity(${a.user_id}, ${correct})`;
  await updateReview(a.user_id, questionId, correct);
  return { q, correct, chosen };
}
