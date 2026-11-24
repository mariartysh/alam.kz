import "server-only";
import { sql } from "./db";
import { almatyDay, currentStreak } from "./streak";

export async function activity(userId: number) {
  const rows = await sql()<{ day: string; solved: number; correct: number }[]>`
    select to_char(day, 'YYYY-MM-DD') as day, solved, correct from daily_activity
    where user_id = ${userId} order by day desc limit 400`;
  const today = almatyDay();
  return {
    rows,
    today,
    streak: currentStreak(rows.map((r) => r.day), today),
    solvedToday: rows.find((r) => r.day === today)?.solved ?? 0,
  };
}

export async function totals(userId: number) {
  const [r] = await sql()<{ solved: number; correct: number; exams: number; best: number | null }[]>`
    select (select count(*) from answers where user_id = ${userId})::int as solved,
           (select count(*) from answers where user_id = ${userId} and is_correct)::int as correct,
           (select count(*) from attempts where user_id = ${userId} and mode = 'exam' and finished_at is not null)::int as exams,
           (select max(score) from attempts where user_id = ${userId} and mode = 'exam' and finished_at is not null)::int as best`;
  return r;
}

export type LeaderRow = { tg_id: number; first_name: string; correct: number; rank: number };

export async function leaderboard(userId: number, limit = 50) {
  const rows = await sql()<LeaderRow[]>`
    select tg_id::int, first_name, correct, (rank() over (order by correct desc))::int as rank
    from leaderboard_weekly order by correct desc, tg_id limit ${limit}`;
  let me = rows.find((r) => r.tg_id === userId) ?? null;
  if (!me) {
    const [r] = await sql()<LeaderRow[]>`
      select * from (
        select tg_id::int, first_name, correct, (rank() over (order by correct desc))::int as rank from leaderboard_weekly
      ) x where tg_id = ${userId}`;
    me = r ?? null;
  }
  return { rows, me };
}
