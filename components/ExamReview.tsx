"use client";

import type { PublicQuestion } from "@/lib/questions";
import { QuestionView, type OptionState } from "./QuestionView";
import { RichText } from "./RichText";

export type ReviewItem = { q: PublicQuestion; topic: string; chosen: number | null; answer: number; explanation: string };

export function ExamReview({ items, texts }: { items: ReviewItem[]; texts: { explanation: string; skipped: string } }) {
  return (
    <ol className="space-y-2">
      {items.map((it, i) => {
        const ok = it.chosen === it.answer;
        const stateOf = (idx: number): OptionState =>
          idx === it.answer ? "correct" : idx === it.chosen ? "wrong" : "dim";
        return (
          <li key={it.q.id}>
            <details className="group rounded-2xl bg-card">
              <summary className="flex cursor-pointer list-none items-center gap-3 p-4">
                <span className={`grid size-8 shrink-0 place-items-center rounded-full text-sm font-bold ${ok ? "bg-ok/15 text-ok" : "bg-bad/15 text-bad"}`}>{i + 1}</span>
                <span className="min-w-0 flex-1 text-sm">
                  {it.topic}
                  {it.chosen === null && <span className="block text-xs text-hint">{texts.skipped}</span>}
                </span>
                <span aria-hidden className={ok ? "text-ok" : "text-bad"}>{ok ? "✓" : "✗"}</span>
                <span aria-hidden className="text-hint transition group-open:rotate-90">›</span>
              </summary>
              <div className="space-y-3 px-3 pb-4">
                <QuestionView q={it.q} stateOf={stateOf} onPick={() => {}} disabled />
                <div className="rounded-xl bg-bg-2 p-3">
                  <p className="text-xs font-semibold uppercase tracking-wide text-hint">{texts.explanation}</p>
                  <RichText text={it.explanation} className="mt-1 block leading-relaxed" />
                </div>
              </div>
            </details>
          </li>
        );
      })}
    </ol>
  );
}
