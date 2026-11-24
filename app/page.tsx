import { ModeCard } from "@/components/ModeCard";
import { getT } from "@/lib/i18n-server";
import { fmt } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { activity } from "@/lib/stats";
import { reviewCounts } from "@/lib/mistakes";
import { Login } from "@/components/Login";

export default async function Home() {
  const { t } = await getT();
  const session = await getSession();
  const [act, review] = session ? await Promise.all([activity(session.uid), reviewCounts(session.uid)]) : [null, null];

  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-btn p-5 text-btn-text">
        <p className="text-lg font-bold">{t("home.greeting")}</p>
        <p className="mt-1 text-sm opacity-90">{t("app.tagline")}</p>
        {act && (
          <div className="mt-4 flex gap-4 text-sm">
            <span><b className="text-lg">🔥 {act.streak}</b> {t("home.streak")}</span>
            <span className="opacity-90">{fmt(t("home.today"), { n: act.solvedToday })}</span>
          </div>
        )}
      </section>
      {!session && <Login />}
      <nav className="grid gap-3">
        <ModeCard href="/practice" icon="📚" title={t("mode.practice")} desc={t("mode.practice.desc")} />
        <ModeCard href="/exam" icon="⏱️" title={t("mode.exam")} desc={t("mode.exam.desc")} />
        <ModeCard
          href="/mistakes" icon="🔁" title={t("mode.mistakes")} desc={t("mode.mistakes.desc")}
          badge={review && review.due > 0 ? String(review.due) : undefined}
        />
        <ModeCard href="/stats" icon="📊" title={t("mode.stats")} desc={t("mode.stats.desc")} />
      </nav>
    </div>
  );
}
