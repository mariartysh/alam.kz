import Link from "next/link";
import { getT } from "@/lib/i18n-server";
import { fmt } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { examHistory, unfinishedExam } from "@/lib/exam-server";
import { passed } from "@/lib/exam";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";
import { StartExamButton } from "@/components/StartExamButton";

export default async function ExamPage() {
  const { t, lang } = await getT();
  const session = await getSession();
  if (!session) return <div className="space-y-4"><PageTitle title={t("exam.title")} /><Login /></div>;
  const [history, open] = await Promise.all([examHistory(session.uid), unfinishedExam(session.uid)]);
  const date = new Intl.DateTimeFormat(lang === "kz" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "short", hour: "2-digit", minute: "2-digit", timeZone: "Asia/Almaty" });

  return (
    <div className="space-y-4">
      <PageTitle title={t("exam.title")} />
      <section className="space-y-3 rounded-2xl bg-card p-5">
        <p className="leading-relaxed">{t("exam.rules")}</p>
        <ul className="space-y-1 text-sm text-hint">
          {(["exam.rule1", "exam.rule2", "exam.rule3"] as const).map((k) => <li key={k}>• {t(k)}</li>)}
        </ul>
      </section>
      {open
        ? <Link href={`/exam/${open}`} className="block w-full rounded-xl bg-btn py-3.5 text-center font-semibold text-btn-text">{t("exam.continue")}</Link>
        : <StartExamButton label={t("exam.start")} error={t("exam.noQuestions")} />}
      {history.length > 0 && (
        <section>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-hint">{t("exam.history")}</h2>
          <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card">
            {history.map((h) => (
              <li key={h.id}>
                <Link href={`/exam/${h.id}`} className="flex items-center justify-between px-4 py-3">
                  <span className="text-sm text-hint">{date.format(h.finished_at)}</span>
                  <span className={`font-bold ${passed(h.score) ? "text-ok" : "text-bad"}`}>{fmt("{s} / {n}", { s: h.score, n: h.total })}</span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
