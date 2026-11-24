import type postgres from "postgres";
import { TOPICS } from "@/content/topics";
import { loadQuestions } from "@/content/questions";

/** Загружает темы и задачи. force=false не трогает уже существующие задачи. */
export async function seed(sql: ReturnType<typeof postgres>, force = false) {
  for (const t of TOPICS) {
    await sql`insert into topics (id, num, section, title_ru, title_kz)
      values (${t.id}, ${t.num}, ${t.section}, ${t.ru}, ${t.kz})
      on conflict (id) do update set num = excluded.num, section = excluded.section,
        title_ru = excluded.title_ru, title_kz = excluded.title_kz`;
  }
  const qs = loadQuestions();
  let inserted = 0;
  for (const q of qs) {
    const content = sql.json({ ru: q.ru, kz: q.kz } as unknown as postgres.JSONValue);
    const res = force
      ? await sql`insert into questions (id, topic_id, difficulty, answer, figure, content, source)
          values (${q.id}, ${q.topic}, ${q.difficulty}, ${q.answer}, ${q.figure ?? null}, ${content}, 'bank')
          on conflict (id) do update set topic_id = excluded.topic_id, difficulty = excluded.difficulty,
            answer = excluded.answer, figure = excluded.figure, content = excluded.content, updated_at = now()`
      : await sql`insert into questions (id, topic_id, difficulty, answer, figure, content, source)
          values (${q.id}, ${q.topic}, ${q.difficulty}, ${q.answer}, ${q.figure ?? null}, ${content}, 'bank')
          on conflict (id) do nothing`;
    inserted += res.count;
  }
  return { topics: TOPICS.length, questions: qs.length, written: inserted };
}
