import { getT } from "@/lib/i18n-server";
import { fmt } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { reviewCounts } from "@/lib/mistakes";
import { practiceTexts } from "@/lib/practice-texts";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";
import { PracticeSession } from "@/components/PracticeSession";

export default async function MistakesPage() {
  const { t, lang } = await getT();
  const session = await getSession();
  const title = <PageTitle title={t("mistakes.title")} subtitle={t("mistakes.hint")} />;
  if (!session) return <div className="space-y-4">{title}<Login /></div>;
  const c = await reviewCounts(session.uid);
  const date = new Intl.DateTimeFormat(lang === "kz" ? "kk-KZ" : "ru-RU", { day: "numeric", month: "long", timeZone: "Asia/Almaty" });

  return (
    <div className="space-y-4">
      {title}
      {c.due > 0 ? (
        <>
          <p className="px-1 text-sm text-hint">{fmt(t("mistakes.due"), { n: c.due })} · {fmt(t("mistakes.inQueue"), { n: c.total })}</p>
          <PracticeSession
            backHref="/"
            texts={practiceTexts(t, { done: "mistakes.done", again: "mistakes.again", toTopics: "exam.toHome" })}
          />
        </>
      ) : (
        <section className="rounded-2xl bg-card p-6 text-center">
          <p className="text-lg font-semibold">{t("mistakes.empty")}</p>
          <p className="mt-1 text-sm text-hint">{t("mistakes.emptyHint")}</p>
          {c.total > 0 && c.next_due && (
            <p className="mt-3 text-sm">{fmt(t("mistakes.nextDue"), { date: date.format(c.next_due) })} · {fmt(t("mistakes.inQueue"), { n: c.total })}</p>
          )}
        </section>
      )}
    </div>
  );
}
