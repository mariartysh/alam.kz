import Link from "next/link";
import { notFound } from "next/navigation";
import { getT } from "@/lib/i18n-server";
import { fmt } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { getAttempt } from "@/lib/attempts";
import { examAnswers, finishExam, isExpired } from "@/lib/exam-server";
import { passed } from "@/lib/exam";
import { explanationOf, getQuestions, toPublic } from "@/lib/questions";
import { getTopic } from "@/content/topics";
import { EXAM } from "@/content/exam-config";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";
import { ExamSession } from "@/components/ExamSession";
import { ExamReview } from "@/components/ExamReview";
import { StartExamButton } from "@/components/StartExamButton";

export default async function ExamAttemptPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const { t, lang } = await getT();
  const session = await getSession();
  if (!session) return <div className="space-y-4"><PageTitle title={t("exam.title")} back="/exam" /><Login /></div>;
  let a = await getAttempt(id, session.uid);
  if (!a || a.mode !== "exam") notFound();
  if (!a.finished_at && isExpired(a)) {
    await finishExam(a);
    a = (await getAttempt(id, session.uid))!;
  }
  const [questions, saved] = await Promise.all([getQuestions(a.question_ids), examAnswers(a.id)]);
  const chosen = Object.fromEntries(saved.map((s) => [s.question_id, s.chosen]));
  const pub = questions.map((q) => toPublic(q, lang, `${a.id}:${q.id}`));

  if (!a.finished_at) {
    return (
      <ExamSession
        attemptId={a.id}
        questions={pub}
        initial={chosen}
        deadline={a.deadline_at!.getTime()}
        texts={{
          question: t("exam.question"), prev: t("exam.prev"), next: t("exam.next"), finish: t("exam.finish"),
          confirm: t("exam.confirm"), timeUp: t("exam.timeUp"), error: t("common.error"),
        }}
      />
    );
  }

  const score = a.score ?? 0;
  const total = a.question_ids.length;
  const ok = passed(score);
  return (
    <div className="space-y-4">
      <PageTitle title={t("exam.result")} back="/exam" />
      <section className="rounded-2xl bg-card p-6 text-center">
        <p className="text-sm text-hint">{t("exam.points")}</p>
        <p className="mt-1 text-5xl font-extrabold tabular-nums">{score}<span className="text-2xl text-hint"> / {total}</span></p>
        <p className={`mt-3 inline-block rounded-full px-3 py-1 text-sm font-semibold ${ok ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"}`}>
          {ok ? t("exam.passed") : fmt(t("exam.failed"), { t: EXAM.threshold })}
        </p>
      </section>
      <h2 className="px-1 text-xs font-semibold uppercase tracking-wide text-hint">{t("exam.review")}</h2>
      <ExamReview
        items={questions.map((q, i) => ({
          q: pub[i], topic: getTopic(q.topic_id)?.[lang] ?? q.topic_id,
          chosen: chosen[q.id] ?? null, answer: q.answer, explanation: explanationOf(q, lang),
        }))}
        texts={{ explanation: t("practice.explanation"), skipped: t("exam.skipped") }}
      />
      <div className="flex gap-2">
        <Link href="/" className="flex-1 rounded-xl bg-card py-3.5 text-center font-semibold">{t("exam.toHome")}</Link>
        <div className="flex-1"><StartExamButton label={t("exam.again")} error={t("exam.noQuestions")} /></div>
      </div>
    </div>
  );
}
