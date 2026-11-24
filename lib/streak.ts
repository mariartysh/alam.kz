/** Дата в Алматы в формате YYYY-MM-DD. */
export function almatyDay(d = new Date()) {
  return new Intl.DateTimeFormat("en-CA", { timeZone: "Asia/Almaty" }).format(d);
}

function prevDay(day: string) {
  const d = new Date(`${day}T00:00:00Z`);
  d.setUTCDate(d.getUTCDate() - 1);
  return d.toISOString().slice(0, 10);
}

/**
 * Текущий стрик: дни подряд с активностью, заканчивающиеся сегодня или вчера
 * (если сегодня ещё не занимался, стрик не сгорает до конца дня).
 */
export function currentStreak(days: Iterable<string>, today: string) {
  const set = new Set(days);
  let day = set.has(today) ? today : prevDay(today);
  let n = 0;
  while (set.has(day)) { n++; day = prevDay(day); }
  return n;
}

/** Последние n дней, от старых к новым. */
export function lastDays(today: string, n: number) {
  const out = [today];
  while (out.length < n) out.unshift(prevDay(out[0]));
  return out;
}
