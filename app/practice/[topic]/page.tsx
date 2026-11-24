import { notFound } from "next/navigation";
import { getTopic } from "@/content/topics";
import { getT } from "@/lib/i18n-server";
import { getSession } from "@/lib/session";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";
import { PracticeSession } from "@/components/PracticeSession";
import { practiceTexts } from "@/lib/practice-texts";

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
          texts={practiceTexts(t)}
        />
      ) : <Login />}
    </div>
  );
}
