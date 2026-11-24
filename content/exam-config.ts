/** Параметры формата ЕНТ по математической грамотности. */
export const EXAM = {
  questions: 10,
  minutes: 20,
  threshold: 3,
  optionsCount: 4,
  /** Желаемое распределение сложности в варианте. */
  difficultyMix: { A: 3, B: 4, C: 3 },
} as const;
