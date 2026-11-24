"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { TOPICS } from "@/content/topics";
import type { AdminQuestion } from "@/lib/admin";
import type { PublicQuestion } from "@/lib/questions";
import { QuestionView } from "../QuestionView";
import { RichText } from "../RichText";

type Lang = "ru" | "kz";
const input = "w-full rounded-lg border border-line bg-card px-2 py-1.5 text-sm";
const label = "mb-1 block text-xs font-semibold text-hint";

export function QuestionEditor({ initial, isNew }: { initial: AdminQuestion; isNew: boolean }) {
  const router = useRouter();
  const [q, setQ] = useState<AdminQuestion>(initial);
  const [lang, setLang] = useState<Lang>("ru");
  const [tables, setTables] = useState<Record<Lang, string>>({
    ru: initial.ru.table ? JSON.stringify(initial.ru.table) : "",
    kz: initial.kz.table ? JSON.stringify(initial.kz.table) : "",
  });
  const [errors, setErrors] = useState<string[]>([]);
  const [saved, setSaved] = useState(false);

  const setLoc = (patch: Partial<AdminQuestion["ru"]>) => setQ((x) => ({ ...x, [lang]: { ...x[lang], ...patch } }));
  const loc = q[lang];

  const build = (): AdminQuestion | string => {
    const out = structuredClone(q);
    for (const l of ["ru", "kz"] as const) {
      const txt = tables[l].trim();
      if (!txt) { delete out[l].table; continue; }
      try { out[l].table = JSON.parse(txt); } catch { return `Таблица ${l}: некорректный JSON`; }
    }
    if (!out.figure) delete out.figure;
    return out;
  };

  const save = async () => {
    setSaved(false);
    const body = build();
    if (typeof body === "string") { setErrors([body]); return; }
    const r = await fetch("/api/admin/question", { method: "PUT", headers: { "content-type": "application/json" }, body: JSON.stringify(body) });
    const j = await r.json().catch(() => ({}));
    if (!r.ok) { setErrors(j.errors ?? [`Ошибка ${r.status}`]); return; }
    setErrors([]); setSaved(true);
    if (isNew) router.replace(`/admin/q/${body.id}`);
    router.refresh();
  };

  let previewTable: PublicQuestion["table"];
  try { previewTable = tables[lang].trim() ? JSON.parse(tables[lang]) : undefined; } catch { previewTable = undefined; }
  const preview: PublicQuestion = {
    id: q.id || "preview", topic: q.topic, difficulty: q.difficulty, figure: q.figure ?? null,
    stem: loc.stem || "…", table: previewTable,
    options: loc.options.map((text, idx) => ({ idx, text: text || "…" })),
  };

  return (
    <div className="space-y-4">
      <div className="grid grid-cols-2 gap-2">
        <div><span className={label}>id</span>
          <input className={input} value={q.id} disabled={!isNew} placeholder={`${q.topic}-001`} onChange={(e) => setQ({ ...q, id: e.target.value.trim() })} /></div>
        <div><span className={label}>Тема</span>
          <select className={input} value={q.topic} onChange={(e) => setQ({ ...q, topic: e.target.value as AdminQuestion["topic"] })}>
            {TOPICS.map((t) => <option key={t.id} value={t.id}>{t.num}. {t.ru}</option>)}
          </select></div>
        <div><span className={label}>Сложность</span>
          <select className={input} value={q.difficulty} onChange={(e) => setQ({ ...q, difficulty: e.target.value as "A" | "B" | "C" })}>
            <option value="A">A — базовый</option><option value="B">B — средний</option><option value="C">C — высокий</option>
          </select></div>
        <div><span className={label}>Статус</span>
          <select className={input} value={q.status} onChange={(e) => setQ({ ...q, status: e.target.value as "draft" | "published" })}>
            <option value="draft">черновик</option><option value="published">опубликована</option>
          </select></div>
      </div>

      <div className="flex rounded-full bg-card p-0.5 text-sm font-semibold">
        {(["ru", "kz"] as const).map((l) => (
          <button key={l} onClick={() => setLang(l)} className={`flex-1 rounded-full py-1.5 ${lang === l ? "bg-btn text-btn-text" : "text-hint"}`}>
            {l === "ru" ? "Русский" : "Қазақша"}
          </button>
        ))}
      </div>

      <div><span className={label}>Условие ({lang}) — формулы в $…$</span>
        <textarea className={`${input} h-28`} value={loc.stem} onChange={(e) => setLoc({ stem: e.target.value })} /></div>
      <div className="space-y-1.5">
        <span className={label}>Варианты ({lang}) — отметьте правильный</span>
        {loc.options.map((o, i) => (
          <label key={i} className="flex items-center gap-2">
            <input type="radio" name="answer" checked={q.answer === i} onChange={() => setQ({ ...q, answer: i })} />
            <input className={input} value={o} onChange={(e) => setLoc({ options: loc.options.map((x, k) => (k === i ? e.target.value : x)) })} />
          </label>
        ))}
      </div>
      <div><span className={label}>Разбор ({lang})</span>
        <textarea className={`${input} h-28`} value={loc.explanation} onChange={(e) => setLoc({ explanation: e.target.value })} /></div>
      <div><span className={label}>{`Таблица (${lang}), JSON: {"head":[…],"rows":[[…]]} — необязательно`}</span>
        <textarea className={`${input} h-16 font-mono text-xs`} value={tables[lang]} onChange={(e) => setTables({ ...tables, [lang]: e.target.value })} /></div>
      <div><span className={label}>Рисунок SVG (общий для языков) — необязательно</span>
        <textarea className={`${input} h-20 font-mono text-xs`} value={q.figure ?? ""} onChange={(e) => setQ({ ...q, figure: e.target.value })} /></div>

      {errors.length > 0 && (
        <ul className="space-y-1 rounded-xl bg-bad/10 p-3 text-xs text-bad">{errors.map((e, i) => <li key={i}>{e}</li>)}</ul>
      )}
      {saved && <p className="text-sm text-ok">Сохранено</p>}
      <button onClick={save} className="w-full rounded-xl bg-btn py-3 font-semibold text-btn-text">Сохранить</button>

      <section className="space-y-3 rounded-2xl border-2 border-dashed border-line p-3">
        <p className="text-xs font-semibold uppercase text-hint">Предпросмотр ({lang})</p>
        <QuestionView q={preview} stateOf={(i) => (i === q.answer ? "correct" : "idle")} onPick={() => {}} disabled />
        <div className="rounded-xl bg-card p-3"><RichText text={loc.explanation || "…"} /></div>
      </section>
    </div>
  );
}
