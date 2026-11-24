import { notFound } from "next/navigation";
import { getTopic } from "@/content/topics";
import { getT } from "@/lib/i18n-server";
import { getSession } from "@/lib/session";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";
import { PracticeSession } from "@/components/PracticeSession";

export default async function TopicPractice({ params }: { params: Promise<{ topic: string }> }) {
  const { topic } = await params;
  const tp = getTopic(topic);
  if (!tp) notFound();
  const { t, lang } = await getT();
  const session = await getSession();
  return (
    <div className="space-y-4">
      <PageTitle title={tp[lang]} back="/practice" />
      {session ? (
        <PracticeSession
          topic={tp.id}
          texts={{
            progress: t("practice.progress"), correct: t("practice.correct"), wrong: t("practice.wrong"),
            explanation: t("practice.explanation"), next: t("practice.next"), finish: t("practice.finish"),
            done: t("practice.done"), score: t("practice.score"), again: t("practice.again"),
            toTopics: t("practice.toTopics"), mistakesHint: t("practice.mistakesHint"),
            error: t("common.error"), loading: t("common.loading"),
            diffA: t("diff.A"), diffB: t("diff.B"), diffC: t("diff.C"),
          }}
        />
      ) : <Login />}
    </div>
  );
}
