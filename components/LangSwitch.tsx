"use client";

import { useRouter } from "next/navigation";
import { LANG_COOKIE, LANGS, type Lang } from "@/lib/i18n";

export function LangSwitch({ lang }: { lang: Lang }) {
  const router = useRouter();
  const set = (next: Lang) => {
    document.cookie = `${LANG_COOKIE}=${next}; path=/; max-age=31536000; samesite=lax`;
    router.refresh();
  };
  return (
    <div className="flex rounded-full bg-bg-2 p-0.5 text-xs font-semibold" role="group" aria-label="Language">
      {LANGS.map((l) => (
        <button
          key={l}
          onClick={() => set(l)}
          aria-pressed={l === lang}
          className={`rounded-full px-3 py-1 uppercase transition ${
            l === lang ? "bg-btn text-btn-text" : "text-hint"
          }`}
        >
          {l === "kz" ? "ҚАЗ" : "РУС"}
        </button>
      ))}
    </div>
  );
}
