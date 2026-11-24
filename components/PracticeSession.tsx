"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import Link from "next/link";
import type { PublicQuestion } from "@/lib/questions";
import { fmt } from "@/lib/i18n";
import { haptics } from "@/lib/haptics";
import { post } from "@/lib/api-client";
import { QuestionView, type OptionState } from "./QuestionView";
import { RichText } from "./RichText";

type Texts = Record<
  "progress" | "correct" | "wrong" | "explanation" | "next" | "finish" | "done" | "score" | "again" |
  "toTopics" | "mistakesHint" | "error" | "loading" | "diffA" | "diffB" | "diffC", string>;
type Result = { correct: boolean; answer: number; chosen: number; explanation: string };

export function PracticeSession({ topic, texts }: { topic: string; texts: Texts }) {
  const [attemptId, setAttemptId] = useState<string | null>(null);
  const [total, setTotal] = useState(0);
  const [index, setIndex] = useState(0);
  const [q, setQ] = useState<PublicQuestion | null>(null);
  const [result, setResult] = useState<Result | null>(null);
  const [finished, setFinished] = useState(false);
  const [stats, setStats] = useState({ n: 0, c: 0 });
  const [error, setError] = useState(false);
  const [busy, setBusy] = useState(false);
  const shownAt = useRef(0);
  const resultRef = useRef<HTMLDivElement>(null);

  const loadNext = useCallback(async (id: string) => {
    setBusy(true);
    try {
      const r = await post<{ index: number; question: PublicQuestion | null }>("/api/practice/next", { attemptId: id });
      setResult(null);
      if (!r.question) { setFinished(true); setQ(null); return; }
      setQ(r.question);
      setIndex(r.index);
      shownAt.current = Date.now();
      window.scrollTo({ top: 0 });
    } catch { setError(true); } finally { setBusy(false); }
  }, []);

  const start = useCallback(async () => {
    setError(false); setFinished(false); setStats({ n: 0, c: 0 });
    try {
      const r = await post<{ attemptId: string; total: number }>("/api/practice/start", { topic });
      setAttemptId(r.attemptId); setTotal(r.total);
      await loadNext(r.attemptId);
    } catch { setError(true); }
  }, [topic, loadNext]);

  useEffect(() => { start(); }, [start]);

  const pick = async (idx: number) => {
    if (!q || !attemptId || result || busy) return;
    setBusy(true);
    try {
      const r = await post<Result>("/api/answer", { attemptId, questionId: q.id, chosen: idx, timeMs: Date.now() - shownAt.current });
      setResult(r);
      requestAnimationFrame(() => resultRef.current?.scrollIntoView({ behavior: "smooth", block: "nearest" }));
      setStats((s) => ({ n: s.n + 1, c: s.c + (r.correct ? 1 : 0) }));
      if (r.correct) haptics.success(); else haptics.error();
    } catch { setError(true); } finally { setBusy(false); }
  };

  const stateOf = (idx: number): OptionState => {
    if (!result) return "idle";
    if (idx === result.answer) return "correct";
    if (idx === result.chosen) return "wrong";
    return "dim";
  };

  if (error) return <p className="rounded-2xl bg-card p-4 text-center text-bad">{texts.error}</p>;

  if (finished) {
    return (
      <div className="space-y-4 rounded-2xl bg-card p-6 text-center">
        <p className="text-4xl" aria-hidden>🎉</p>
        <p className="text-lg font-bold">{texts.done}</p>
        <p>{fmt(texts.score, { c: stats.c, n: stats.n })}</p>
        {stats.c < stats.n && <p className="text-sm text-hint">{texts.mistakesHint}</p>}
        <div className="flex gap-2">
          <Link href="/practice" className="flex-1 rounded-xl bg-bg-2 py-3 font-semibold">{texts.toTopics}</Link>
          <button onClick={start} className="flex-1 rounded-xl bg-btn py-3 font-semibold text-btn-text">{texts.again}</button>
        </div>
      </div>
    );
  }

  if (!q) return <p className="p-6 text-center text-hint">{texts.loading}</p>;

  const diff = { A: texts.diffA, B: texts.diffB, C: texts.diffC }[q.difficulty];
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between text-sm text-hint">
        <span>{fmt(texts.progress, { n: index, total })}</span>
        <span className="rounded-full bg-card px-2 py-0.5 text-xs">{diff}</span>
      </div>
      <div className="h-1.5 overflow-hidden rounded-full bg-card">
        <div className="h-full rounded-full bg-btn transition-all" style={{ width: `${(Math.min(index - (result ? 0 : 1), total) / Math.max(total, 1)) * 100}%` }} />
      </div>
      <QuestionView q={q} stateOf={stateOf} onPick={pick} disabled={!!result || busy} />
      {result && (
        <div ref={resultRef} className={`scroll-mb-24 rounded-2xl border-2 p-4 ${result.correct ? "border-ok bg-ok/10" : "border-bad bg-bad/10"}`} role="status">
          <p className={`font-bold ${result.correct ? "text-ok" : "text-bad"}`}>{result.correct ? texts.correct : texts.wrong}</p>
          <p className="mt-2 text-xs font-semibold uppercase tracking-wide text-hint">{texts.explanation}</p>
          <RichText text={result.explanation} className="mt-1 block leading-relaxed" />
        </div>
      )}
      {result && (
        <button
          onClick={() => attemptId && loadNext(attemptId)}
          disabled={busy}
          className="w-full rounded-xl bg-btn py-3.5 font-semibold text-btn-text disabled:opacity-60"
          data-testid="next"
        >
          {index >= total ? texts.finish : texts.next}
        </button>
      )}
    </div>
  );
}
