import { EXAM } from "@/content/exam-config";
import { TOPICS } from "@/content/topics";
import { shuffled } from "./shuffle";

export type Candidate = { id: string; topic: string; difficulty: "A" | "B" | "C"; seen: boolean };
const LEVELS = ["A", "B", "C"] as const;

/**
 * Собирает вариант: по одной задаче на тему, уровни A/B/C распределены по темам случайно
 * в пропорции спецификации (5/3/2). Если в теме нет задачи нужного уровня — берётся ближайший.
 * Предпочитаются задачи, которые пользователь ещё не видел. Порядок — по номеру темы.
 */
export function buildVariant(pool: Candidate[], seed: string): string[] {
  const levels = shuffled(
    LEVELS.flatMap((d) => Array<typeof d>(EXAM.difficultyMix[d]).fill(d)),
    `${seed}:levels`,
  );
  const ids: string[] = [];
  TOPICS.forEach((topic, i) => {
    const inTopic = shuffled(pool.filter((q) => q.topic === topic.id), `${seed}:${topic.id}`);
    if (!inTopic.length) return;
    const want = LEVELS.indexOf(levels[i % levels.length]);
    const score = (q: Candidate) => Math.abs(LEVELS.indexOf(q.difficulty) - want) * 2 + (q.seen ? 1 : 0);
    const best = inTopic.reduce((a, b) => (score(b) < score(a) ? b : a));
    ids.push(best.id);
  });
  return ids;
}

export function examScore(answers: { is_correct: boolean }[]) {
  return answers.filter((a) => a.is_correct).length;
}

export function passed(score: number) {
  return score >= EXAM.threshold;
}
