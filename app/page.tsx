import { ModeCard } from "@/components/ModeCard";
import { getT } from "@/lib/i18n-server";
import { getSession } from "@/lib/session";
import { Login } from "@/components/Login";

export default async function Home() {
  const { t } = await getT();
  const session = await getSession();
  return (
    <div className="space-y-5">
      <section className="rounded-2xl bg-btn p-5 text-btn-text">
        <p className="text-lg font-bold">{t("home.greeting")}</p>
        <p className="mt-1 text-sm opacity-90">{t("app.tagline")}</p>
      </section>
      {!session && <Login />}
      <nav className="grid gap-3">
        <ModeCard href="/practice" icon="📚" title={t("mode.practice")} desc={t("mode.practice.desc")} />
        <ModeCard href="/exam" icon="⏱️" title={t("mode.exam")} desc={t("mode.exam.desc")} />
        <ModeCard href="/mistakes" icon="🔁" title={t("mode.mistakes")} desc={t("mode.mistakes.desc")} />
        <ModeCard href="/stats" icon="📊" title={t("mode.stats")} desc={t("mode.stats.desc")} />
      </nav>
    </div>
  );
}
