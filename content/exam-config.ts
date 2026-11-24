/** Формат ЕНТ «Математическая грамотность» по спецификации НЦТ (с 2026 г.). */
export const EXAM = {
  questions: 10,
  /** 2 минуты на задание в среднем. */
  minutes: 20,
  threshold: 3,
  optionsCount: 4,
  /** A — 50%, B — 30%, C — 20%. */
  difficultyMix: { A: 5, B: 3, C: 2 },
} as const;
