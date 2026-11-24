"use client";

import { useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { getWebApp } from "./TelegramProvider";

type Texts = { title: string; desc: string; dev: string; error: string; loading: string };

declare global {
  interface Window { onAlamTelegramAuth?: (user: Record<string, string | number>) => void }
}

/** Блок входа: в браузере — Telegram Login Widget, в Mini App — ожидание автовхода. */
export function LoginPanel({ bot, devLogin, texts }: { bot: string; devLogin: boolean; texts: Texts }) {
  const router = useRouter();
  const box = useRef<HTMLDivElement>(null);
  const [error, setError] = useState(false);
  const [inTelegram, setInTelegram] = useState(false);

  useEffect(() => {
    if (getWebApp()) { setInTelegram(true); return; }
    if (!bot) return; // бот не настроен — виджет не показываем
    window.onAlamTelegramAuth = async (widget) => {
      const r = await fetch("/api/auth/telegram", {
        method: "POST", headers: { "content-type": "application/json" }, body: JSON.stringify({ widget }),
      });
      if (r.ok) router.refresh(); else setError(true);
    };
    const s = document.createElement("script");
    s.src = "https://telegram.org/js/telegram-widget.js?22";
    s.async = true;
    s.dataset.telegramLogin = bot;
    s.dataset.size = "large";
    s.dataset.radius = "12";
    s.dataset.requestAccess = "write";
    s.dataset.onauth = "onAlamTelegramAuth(user)";
    box.current?.replaceChildren(s);
  }, [bot, router]);

  const dev = async () => {
    const r = await fetch("/api/auth/dev", { method: "POST" });
    if (r.ok) router.refresh(); else setError(true);
  };

  return (
    <section className="rounded-2xl border border-line bg-card p-5 text-center">
      <p className="font-semibold">{texts.title}</p>
      <p className="mt-1 text-sm text-hint">{inTelegram ? texts.loading : texts.desc}</p>
      {!inTelegram && <div ref={box} className="mt-4 flex min-h-10 justify-center" />}
      {devLogin && !inTelegram && (
        <button onClick={dev} className="mt-3 text-sm text-link underline">{texts.dev}</button>
      )}
      {error && <p className="mt-2 text-sm text-bad">{texts.error}</p>}
    </section>
  );
}
