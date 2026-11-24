/** Работа над ошибками по системе Лейтнера: коробки 1..5, интервалы повторения в днях. */
export const BOX_INTERVAL_DAYS = [0, 1, 3, 7, 14, 30] as const; // индекс = номер коробки
export const MAX_BOX = 5;
const DAY_MS = 86_400_000;

export type ReviewState = { box: number; dueAt: Date };

/**
 * Следующее состояние карточки после ответа.
 * Ошибка: коробка 1, повтор доступен сразу. Верно: следующая коробка, повтор через её интервал.
 * null — задача выучена (верно в 5-й коробке), её можно убрать из очереди.
 */
export function nextReview(prev: ReviewState | null, correct: boolean, now = new Date()): ReviewState | null {
  if (!correct) return { box: 1, dueAt: now };
  if (!prev) return null; // верно с первого раза: в очередь не попадает
  const box = prev.box + 1;
  if (box > MAX_BOX) return null;
  return { box, dueAt: new Date(now.getTime() + BOX_INTERVAL_DAYS[box] * DAY_MS) };
}
