import "server-only";
import { sql } from "./db";

export const MISTAKES_BATCH = 15;

export async function reviewCounts(userId: number) {
  const [r] = await sql()<{ due: number; total: number; next_due: Date | null }[]>`
    select count(*) filter (where due_at <= now())::int as due,
           count(*)::int as total,
           min(due_at) filter (where due_at > now()) as next_due
    from review_items ri join questions q on q.id = ri.question_id and q.status = 'published'
    where ri.user_id = ${userId}`;
  return r;
}

/** Задачи к повторению: сначала из младших коробок, затем самые «просроченные». */
export async function dueQuestionIds(userId: number, limit = MISTAKES_BATCH) {
  const rows = await sql()<{ question_id: string }[]>`
    select ri.question_id from review_items ri
    join questions q on q.id = ri.question_id and q.status = 'published'
    where ri.user_id = ${userId} and ri.due_at <= now()
    order by ri.box, ri.due_at limit ${limit}`;
  return rows.map((r) => r.question_id);
}
