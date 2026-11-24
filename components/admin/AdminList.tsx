"use client";

import { useMemo, useState } from "react";
import Link from "next/link";
import { TOPICS } from "@/content/topics";

type Item = { id: string; topic: string; difficulty: string; status: string; stem: string; kzStem: string };
const input = "rounded-lg border border-line bg-card px-2 py-1.5 text-sm";

export function AdminList({ items }: { items: Item[] }) {
  const [topic, setTopic] = useState("");
  const [diff, setDiff] = useState("");
  const [status, setStatus] = useState("");
  const [q, setQ] = useState("");
  const [importText, setImportText] = useState("");
  const [importMsg, setImportMsg] = useState<string[]>([]);

  const shown = useMemo(() => items.filter((i) =>
    (!topic || i.topic === topic) && (!diff || i.difficulty === diff) && (!status || i.status === status) &&
    (!q || `${i.id} ${i.stem} ${i.kzStem}`.toLowerCase().includes(q.toLowerCase()))), [items, topic, diff, status, q]);

  const counts = TOPICS.map((t) => ({ t, n: items.filter((i) => i.topic === t.id && i.status === "published").length }));

  const runImport = async () => {
    try {
      const data = JSON.parse(importText);
      const r = await fetch("/api/admin/import", { method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify(data) });
      const j = await r.json();
      setImportMsg(r.ok ? [`Импортировано: ${j.count}. Обновите страницу.`] : j.errors ?? ["ошибка"]);
    } catch (e) { setImportMsg([`JSON: ${(e as Error).message}`]); }
  };

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-2">
        <Link href="/admin/q/new" className="rounded-lg bg-btn px-3 py-1.5 text-sm font-semibold text-btn-text">+ Новая</Link>
        <a href="/api/admin/export" className="rounded-lg bg-card px-3 py-1.5 text-sm">Экспорт JSON</a>
      </div>
      <div className="grid grid-cols-5 gap-1 text-center text-xs">
        {counts.map(({ t, n }) => (
          <button key={t.id} onClick={() => setTopic(topic === t.id ? "" : t.id)}
            className={`rounded-lg p-1.5 ${topic === t.id ? "bg-btn text-btn-text" : "bg-card"}`} title={t.ru}>
            <span className="block">{t.icon} {t.num}</span><b>{n}</b>
          </button>
        ))}
      </div>
      <div className="flex flex-wrap gap-2">
        <input className={`${input} min-w-0 flex-1`} placeholder="Поиск по id и тексту" value={q} onChange={(e) => setQ(e.target.value)} />
        <select className={input} value={diff} onChange={(e) => setDiff(e.target.value)}>
          <option value="">A/B/C</option><option>A</option><option>B</option><option>C</option>
        </select>
        <select className={input} value={status} onChange={(e) => setStatus(e.target.value)}>
          <option value="">все</option><option value="published">опубликованы</option><option value="draft">черновики</option>
        </select>
      </div>
      <ul className="divide-y divide-line overflow-hidden rounded-2xl bg-card">
        {shown.map((i) => (
          <li key={i.id}>
            <Link href={`/admin/q/${i.id}`} className="block px-4 py-2.5">
              <span className="flex items-center gap-2 text-xs text-hint">
                <b className="text-text">{i.id}</b> · {i.difficulty}
                {i.status === "draft" && <span className="rounded bg-gold/25 px-1 text-text">черновик</span>}
              </span>
              <span className="line-clamp-2 text-sm">{i.stem}</span>
            </Link>
          </li>
        ))}
        {!shown.length && <li className="p-4 text-center text-sm text-hint">Ничего не найдено</li>}
      </ul>
      <details className="rounded-2xl bg-card p-4">
        <summary className="cursor-pointer text-sm font-semibold">Импорт JSON (массив задач)</summary>
        <textarea className={`${input} mt-2 h-40 w-full font-mono text-xs`} value={importText} onChange={(e) => setImportText(e.target.value)} />
        <button onClick={runImport} className="mt-2 rounded-lg bg-btn px-3 py-1.5 text-sm font-semibold text-btn-text">Импортировать</button>
        {importMsg.length > 0 && <ul className="mt-2 space-y-1 text-xs">{importMsg.map((m, k) => <li key={k}>{m}</li>)}</ul>}
      </details>
    </div>
  );
}
