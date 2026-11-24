"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { PublicQuestion } from "@/lib/questions";
import { fmt } from "@/lib/i18n";
import { post } from "@/lib/api-client";
import { haptics } from "@/lib/haptics";
import { QuestionView } from "./QuestionView";

type Texts = Record<"question" | "prev" | "next" | "finish" | "confirm" | "timeUp" | "error", string>;

function mmss(ms: number) {
  const s = Math.max(0, Math.ceil(ms / 1000));
  return `${String(Math.floor(s / 60)).padStart(2, "0")}:${String(s % 60).padStart(2, "0")}`;
}

export function ExamSession({
  attemptId, questions, initial, deadline, texts,
}: {
  attemptId: string; questions: PublicQuestion[]; initial: Record<string, number>; deadline: number; texts: Texts;
}) {
  const router = useRouter();
  const [answers, setAnswers] = useState<Record<string, number>>(initial);
  const [cur, setCur] = useState(0);
  // null до монтирования: серверное и клиентское время не совпадают, считаем только в браузере.
  const [left, setLeft] = useState<number | null>(null);
  const [error, setError] = useState(false);
  const finishing = useRef(false);

  const finish = useCallback(async () => {
    if (finishing.current) return;
    finishing.current = true;
    try { await post("/api/exam/finish", { attemptId }); router.refresh(); }
    catch { finishing.current = false; setError(true); }
  }, [attemptId, router]);

  useEffect(() => {
    const tick = () => {
      const l = deadline - Date.now();
      setLeft(l);
      if (l <= 0) { clearInterval(id); finish(); }
    };
    const id = setInterval(tick, 500);
    tick();
    return () => clearInterval(id);
  }, [deadline, finish]);

  const q = questions[cur];
  const pick = (idx: number) => {
    const chosen = answers[q.id] === idx ? null : idx; // повторное нажатие снимает выбор
    haptics.select();
    setAnswers((a) => {
      const next = { ...a };
      if (chosen === null) delete next[q.id]; else next[q.id] = chosen;
      return next;
    });
    post("/api/exam/answer", { attemptId, questionId: q.id, chosen }).catch(() => setError(true));
  };

  const unanswered = questions.filter((x) => answers[x.id] === undefined).length;
  const askFinish = () => {
    if (unanswered === 0 || window.confirm(fmt(texts.confirm, { n: unanswered }))) finish();
  };

  const low = left !== null && left < 120_000;
  const over = left !== null && left <= 0;
  return (
    <div className="space-y-4">
      <div className="sticky top-0 z-10 -mx-4 space-y-3 bg-bg-2/95 px-4 py-2 backdrop-blur">
        <div className="flex items-center justify-between">
          <span className="font-semibold">{fmt(texts.question, { n: cur + 1 })}</span>
          <span className={`rounded-full px-3 py-1 font-mono text-sm font-bold tabular-nums ${low ? "bg-bad/15 text-bad" : "bg-card"}`} role="timer">
            {left === null ? "--:--" : over ? texts.timeUp : mmss(left)}
          </span>
        </div>
        <nav className="grid grid-cols-10 gap-1" aria-label="questions">
          {questions.map((x, i) => (
            <button
              key={x.id}
              onClick={() => setCur(i)}
              aria-current={i === cur}
              className={`aspect-square rounded-lg text-xs font-bold transition ${
                i === cur ? "bg-btn text-btn-text" : answers[x.id] !== undefined ? "bg-btn/25" : "bg-card text-hint"
              }`}
            >
              {i + 1}
            </button>
          ))}
        </nav>
      </div>
      <QuestionView key={q.id} q={q} stateOf={(idx) => (answers[q.id] === idx ? "selected" : "idle")} onPick={pick} disabled={over} />
      {error && <p className="text-center text-sm text-bad">{texts.error}</p>}
      <div className="flex gap-2">
        <button onClick={() => setCur((c) => c - 1)} disabled={cur === 0} className="flex-1 rounded-xl bg-card py-3 font-semibold disabled:opacity-40">{texts.prev}</button>
        {cur < questions.length - 1
          ? <button onClick={() => setCur((c) => c + 1)} className="flex-1 rounded-xl bg-card py-3 font-semibold">{texts.next}</button>
          : <button onClick={askFinish} className="flex-1 rounded-xl bg-btn py-3 font-semibold text-btn-text">{texts.finish}</button>}
      </div>
      {cur < questions.length - 1 && (
        <button onClick={askFinish} className="w-full py-2 text-sm text-link">{texts.finish}</button>
      )}
    </div>
  );
}
