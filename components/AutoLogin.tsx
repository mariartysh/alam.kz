"use client";

import { useEffect, useRef } from "react";
import { useRouter } from "next/navigation";
import { getWebApp } from "./TelegramProvider";

/** Внутри Telegram Mini App входит автоматически по initData. */
export function AutoLogin({ authed }: { authed: boolean }) {
  const router = useRouter();
  const tried = useRef(false);
  useEffect(() => {
    if (authed || tried.current) return;
    const wa = getWebApp();
    if (!wa) return;
    tried.current = true;
    fetch("/api/auth/telegram", {
      method: "POST",
      headers: { "content-type": "application/json" },
      body: JSON.stringify({ initData: wa.initData }),
    }).then((r) => { if (r.ok) router.refresh(); });
  }, [authed, router]);
  return null;
}
