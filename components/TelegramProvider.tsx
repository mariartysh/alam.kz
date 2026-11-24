"use client";

import { useEffect } from "react";

type TgWebApp = {
  initData: string;
  colorScheme?: "light" | "dark";
  ready: () => void;
  expand: () => void;
  onEvent?: (e: string, cb: () => void) => void;
};

declare global {
  interface Window {
    Telegram?: { WebApp?: TgWebApp };
  }
}

export function getWebApp(): TgWebApp | undefined {
  if (typeof window === "undefined") return undefined;
  const wa = window.Telegram?.WebApp;
  return wa && wa.initData ? wa : undefined;
}

/** Инициализирует Mini App: сообщает Telegram о готовности и включает его тему. */
export function TelegramProvider() {
  useEffect(() => {
    const wa = getWebApp();
    if (!wa) return;
    wa.ready();
    wa.expand();
    const root = document.documentElement;
    const apply = () => {
      root.dataset.tg = "1";
      if (wa.colorScheme) root.dataset.theme = wa.colorScheme;
    };
    apply();
    wa.onEvent?.("themeChanged", apply);
  }, []);
  return null;
}
