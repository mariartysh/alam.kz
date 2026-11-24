import { cookies } from "next/headers";
import { DEFAULT_LANG, LANG_COOKIE, isLang, translator, type Lang } from "./i18n";

export async function getLang(): Promise<Lang> {
  const value = (await cookies()).get(LANG_COOKIE)?.value;
  return isLang(value) ? value : DEFAULT_LANG;
}

export async function getT() {
  const lang = await getLang();
  return { lang, t: translator(lang) };
}
