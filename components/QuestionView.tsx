"use client";

import type { PublicQuestion } from "@/lib/questions";
import { RichText } from "./RichText";

export type OptionState = "idle" | "selected" | "correct" | "wrong" | "dim";
const LETTERS = ["A", "B", "C", "D", "E"];

const optionClass: Record<OptionState, string> = {
  idle: "border-line bg-card",
  selected: "border-btn bg-btn/10",
  correct: "border-ok bg-ok/15",
  wrong: "border-bad bg-bad/15",
  dim: "border-line bg-card opacity-60",
};

/** Условие задачи + варианты. Состояние каждого варианта задаёт родитель. */
export function QuestionView({
  q, stateOf, onPick, disabled,
}: {
  q: PublicQuestion;
  stateOf: (idx: number) => OptionState;
  onPick: (idx: number) => void;
  disabled?: boolean;
}) {
  return (
    <div className="space-y-4">
      <div className="rounded-2xl bg-card p-4 leading-relaxed">
        <RichText text={q.stem} />
        {q.table && (
          <div className="mt-3 overflow-x-auto">
            <table className="w-full border-collapse text-center text-sm">
              <thead>
                <tr>{q.table.head.map((h, i) => <th key={i} className="border border-line bg-bg-2 px-2 py-1 font-semibold"><RichText text={h} /></th>)}</tr>
              </thead>
              <tbody>
                {q.table.rows.map((r, ri) => (
                  <tr key={ri}>{r.map((c, ci) => <td key={ci} className="border border-line px-2 py-1"><RichText text={c} /></td>)}</tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
        {q.figure && (
          <div className="mx-auto mt-3 max-w-xs text-text [&_svg]:h-auto [&_svg]:w-full" dangerouslySetInnerHTML={{ __html: q.figure }} />
        )}
      </div>
      <ul className="grid gap-2" role="list">
        {q.options.map((o, pos) => {
          const st = stateOf(o.idx);
          return (
            <li key={o.idx}>
              <button
                type="button"
                disabled={disabled}
                onClick={() => onPick(o.idx)}
                aria-pressed={st === "selected"}
                className={`flex w-full items-center gap-3 rounded-xl border-2 p-3 text-left transition active:scale-[0.99] disabled:active:scale-100 ${optionClass[st]}`}
              >
                <span className="grid size-7 shrink-0 place-items-center rounded-full bg-bg-2 text-sm font-bold">{LETTERS[pos]}</span>
                <RichText text={o.text} />
                {st === "correct" && <span className="ml-auto text-ok" aria-hidden>✓</span>}
                {st === "wrong" && <span className="ml-auto text-bad" aria-hidden>✗</span>}
              </button>
            </li>
          );
        })}
      </ul>
    </div>
  );
}
