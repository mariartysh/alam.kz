import Link from "next/link";
import { SECTIONS, TOPICS } from "@/content/topics";
import { getT } from "@/lib/i18n-server";
import { fmt } from "@/lib/i18n";
import { getSession } from "@/lib/session";
import { topicProgress } from "@/lib/questions";
import { Login } from "@/components/Login";
import { PageTitle } from "@/components/PageTitle";

export default async function PracticePage() {
  const { t, lang } = await getT();
  const session = await getSession();
  if (!session) return <><PageTitle title={t("practice.title")} /><Login /></>;
  const progress = new Map((await topicProgress(session.uid)).map((p) => [p.topic_id, p]));

  return (
    <div className="space-y-5">
      <PageTitle title={t("practice.title")} subtitle={t("practice.hint")} />
      {(Object.keys(SECTIONS) as (keyof typeof SECTIONS)[]).map((sec) => (
        <section key={sec}>
          <h2 className="mb-2 px-1 text-xs font-semibold uppercase tracking-wide text-hint">{SECTIONS[sec][lang]}</h2>
          <div className="grid gap-2">
            {TOPICS.filter((tp) => tp.section === sec).map((tp) => {
              const p = progress.get(tp.id);
              const total = p?.total ?? 0;
              const solved = p?.solved ?? 0;
              const pct = total ? Math.round((solved / total) * 100) : 0;
              return (
                <Link
                  key={tp.id}
                  href={total ? `/practice/${tp.id}` : "#"}
                  aria-disabled={!total}
                  className={`block rounded-2xl border border-line bg-card p-4 transition active:scale-[0.99] ${total ? "" : "pointer-events-none opacity-50"}`}
                >
                  <div className="flex items-center gap-3">
                    <span className="text-2xl" aria-hidden>{tp.icon}</span>
                    <div className="min-w-0 flex-1">
                      <p className="font-semibold"><span className="text-hint">{tp.num}.</span> {tp[lang]}</p>
                      <p className="text-xs text-hint">{total ? fmt(t("practice.solved"), { solved, total }) : t("practice.empty")}</p>
                    </div>
                  </div>
                  {total > 0 && (
                    <div className="mt-3 h-1.5 overflow-hidden rounded-full bg-bg-2">
                      <div className="h-full rounded-full bg-btn" style={{ width: `${pct}%` }} />
                    </div>
                  )}
                </Link>
              );
            })}
          </div>
        </section>
      ))}
    </div>
  );
}
