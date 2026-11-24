import ru from "@/messages/ru.json";
import kz from "@/messages/kz.json";

export const LANGS = ["ru", "kz"] as const;
export type Lang = (typeof LANGS)[number];
export const DEFAULT_LANG: Lang = "ru";
export const LANG_COOKIE = "lang";

export type MessageKey = keyof typeof ru;

const dictionaries: Record<Lang, Record<MessageKey, string>> = { ru, kz };

export function isLang(value: unknown): value is Lang {
  return typeof value === "string" && (LANGS as readonly string[]).includes(value);
}

export function translator(lang: Lang) {
  const dict = dictionaries[lang];
  return (key: MessageKey) => dict[key] ?? dictionaries.ru[key] ?? key;
}
