import { getT } from "@/lib/i18n-server";
import { fmt } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { activity, leaderboard, totals } from "@/lib/stats";
import { lastDays } from "@/lib/streak";
import { topicProgress } from "@/lib/questions";
import { TOPICS } from "@/content/topics";
import { EXAM } from "@/content/exam-config";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";

function Tile({ label, value }: { label: string; value: string }) {
  return (
    <div className="rounded-2xl bg-card p-4">
      <p className="text-2xl font-extrabold tabular-nums">{value}</p>
      <p className="text-xs text-hint">{label}</p>
    </div>
  );
}

function H2({ children, hint }: { children: React.ReactNode; hint?: string }) {
  return (
    <div className="mb-2 px-1">
      <h2 className="text-xs font-semibold uppercase tracking-wide text-hint">{children}</h2>
      {hint && <p className="text-xs text-hint">{hint}</p>}
    </div>
  );
}

export default async function StatsPage() {
  const { t, lang } = await getT();
  const session = await getSession();
  if (!session) return <div className="space-y-4"><PageTitle title={t("stats.title")} /><Login /></div>;
  const [act, tot, prog, lb] = await Promise.all([
    activity(session.uid), totals(session.uid), topicProgress(session.uid), leaderboard(session.uid),
  ]);
  const accuracy = tot.solved ? Math.round((tot.correct / tot.solved) * 100) : 0;
  const byDay = new Map(act.rows.map((r) => [r.day, r]));
  const week = lastDays(act.today, 7).map((day) => ({ day, solved: byDay.get(day)?.solved ?? 0 }));
  const maxDay = Math.max(1, ...week.map((d) => d.solved));
  // Свои сокращения: ICU для kk даёт нестандартные формы.
  const WD = { ru: ["Вс", "Пн", "Вт", "Ср", "Чт", "Пт", "Сб"], kz: ["Жс", "Дс", "Сс", "Ср", "Бс", "Жм", "Сн"] }[lang];
  const progress = new Map(prog.map((p) => [p.topic_id, p]));
  const topics = TOPICS.map((tp) => {
    const p = progress.get(tp.id);
    const acc = p && p.attempts ? Math.round((p.correct / p.attempts) * 100) : null;
    return { tp, acc, attempts: p?.attempts ?? 0 };
  }).sort((a, b) => (a.acc ?? 101) - (b.acc ?? 101) || a.tp.num - b.tp.num);

  return (
    <div className="space-y-6">
      <PageTitle title={t("stats.title")} />
      <div className="grid grid-cols-2 gap-2">
        <Tile label={t("stats.streak")} value={`🔥 ${act.streak}`} />
        <Tile label={t("stats.solved")} value={String(tot.solved)} />
        <Tile label={t("stats.accuracy")} value={`${accuracy}%`} />
        <Tile label={t("stats.best")} value={tot.best === null ? "—" : `${tot.best} / ${EXAM.questions}`} />
      </div>

      <section>
        <H2>{t("stats.week")}</H2>
        <div className="flex h-36 items-end gap-2 rounded-2xl bg-card p-4" role="img" aria-label={t("stats.week")}>
          {week.map((d) => (
            <div
              key={d.day}
              className="flex h-full flex-1 flex-col items-center justify-end gap-1"
              title={`${d.day}: ${fmt(t("stats.tasksDay"), { n: d.solved })}`}
            >
              <span className="text-[10px] tabular-nums text-hint">{d.solved || ""}</span>
              <div
                className={`w-full max-w-7 rounded-t ${d.day === act.today ? "bg-btn" : "bg-btn/45"}`}
                style={{ height: `${(d.solved / maxDay) * 70}%`, minHeight: d.solved ? 4 : 2 }}
              />
              <span className="text-[10px] text-hint">{WD[new Date(`${d.day}T00:00:00Z`).getUTCDay()]}</span>
            </div>
          ))}
        </div>
      </section>

      <section>
        <H2>{t("stats.topics")}</H2>
        <ul className="space-y-3 rounded-2xl bg-card p-4">
          {topics.map(({ tp, acc, attempts }) => {
            const weak = acc !== null && acc < 50 && attempts >= 3;
            return (
              <li key={tp.id}>
                <div className="flex items-baseline justify-between gap-2 text-sm">
                  <span className="min-w-0 truncate">{tp.num}. {tp[lang]}</span>
                  <span className="shrink-0 tabular-nums text-hint">
                    {weak && <span className="mr-2 rounded-full bg-gold/25 px-1.5 py-0.5 text-[10px] font-semibold text-text">{t("stats.weak")}</span>}
                    {acc === null ? t("stats.noData") : `${acc}%`}
                  </span>
                </div>
                <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-bg-2">
                  <div className="h-full rounded-full bg-btn" style={{ width: `${acc ?? 0}%` }} />
                </div>
              </li>
            );
          })}
        </ul>
      </section>

      <section>
        <H2 hint={t("stats.leadersHint")}>{t("stats.leaders")}</H2>
        <p className="mb-2 px-1 text-sm font-semibold">
          {lb.me ? fmt(t("stats.yourPlace"), { rank: lb.me.rank }) : t("stats.notRanked")}
        </p>
        {lb.rows.length > 0 && (
          <ol className="divide-y divide-line overflow-hidden rounded-2xl bg-card">
            {lb.rows.map((r) => {
              const me = r.tg_id === session.uid;
              return (
                <li key={r.tg_id} className={`flex items-center gap-3 px-4 py-2.5 ${me ? "bg-btn/10" : ""}`}>
                  <span className="w-6 text-center font-bold tabular-nums text-hint">
                    {r.rank <= 3 ? ["🥇", "🥈", "🥉"][r.rank - 1] : r.rank}
                  </span>
                  <span className="min-w-0 flex-1 truncate">
                    {r.first_name}
                    {me && <span className="text-hint"> ({t("stats.you")})</span>}
                  </span>
                  <span className="font-semibold tabular-nums">{r.correct}</span>
                </li>
              );
            })}
          </ol>
        )}
      </section>
    </div>
  );
}
