import "server-only";
import { sql } from "./db";
import { shuffled } from "./shuffle";
import type { Lang } from "./i18n";
import type { LocalizedQuestion } from "./question-schema";

export type QuestionRow = {
  id: string; topic_id: string; difficulty: "A" | "B" | "C"; answer: number;
  figure: string | null; content: { ru: LocalizedQuestion; kz: LocalizedQuestion };
};

/** Задача для клиента: без правильного ответа и разбора, варианты перемешаны. */
export type PublicQuestion = {
  id: string; topic: string; difficulty: "A" | "B" | "C"; figure: string | null;
  stem: string; table?: LocalizedQuestion["table"];
  options: { idx: number; text: string }[];
};

export async function getQuestions(ids: string[]): Promise<QuestionRow[]> {
  if (!ids.length) return [];
  const rows = await sql()<QuestionRow[]>`
    select id, topic_id, difficulty, answer, figure, content from questions where id in ${sql()(ids)}`;
  const byId = new Map(rows.map((r) => [r.id, r]));
  return ids.map((id) => byId.get(id)).filter((r): r is QuestionRow => !!r);
}

export async function getQuestion(id: string) {
  return (await getQuestions([id]))[0] ?? null;
}

export function toPublic(q: QuestionRow, lang: Lang, seed: string): PublicQuestion {
  const c = q.content[lang] ?? q.content.ru;
  return {
    id: q.id, topic: q.topic_id, difficulty: q.difficulty, figure: c.figure ?? q.figure,
    stem: c.stem, table: c.table,
    options: shuffled(c.options.map((text, idx) => ({ idx, text })), seed),
  };
}

export function explanationOf(q: QuestionRow, lang: Lang) {
  return (q.content[lang] ?? q.content.ru).explanation;
}

/** Прогресс пользователя по темам: сколько задач всего, сколько решено верно хотя бы раз, точность. */
export async function topicProgress(userId: number) {
  return sql()<{ topic_id: string; total: number; solved: number; attempts: number; correct: number }[]>`
    select q.topic_id,
           count(*)::int as total,
           count(*) filter (where s.ever_correct)::int as solved,
           coalesce(sum(s.n), 0)::int as attempts,
           coalesce(sum(s.c), 0)::int as correct
    from questions q
    left join (
      select question_id, count(*) as n, count(*) filter (where is_correct) as c, bool_or(is_correct) as ever_correct
      from answers where user_id = ${userId} group by question_id
    ) s on s.question_id = q.id
    where q.status = 'published'
    group by q.topic_id`;
}
