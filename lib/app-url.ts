/**
 * Публичный адрес приложения: явный NEXT_PUBLIC_APP_URL, иначе production-домен Vercel
 * (VERCEL_PROJECT_PRODUCTION_URL, например alam-kz.vercel.app), иначе alam.kz.
 */
export function appUrl(env: Record<string, string | undefined> = process.env) {
  const explicit = env.NEXT_PUBLIC_APP_URL?.trim();
  if (explicit) return explicit.replace(/\/+$/, "");
  const vercel = env.VERCEL_PROJECT_PRODUCTION_URL?.trim();
  if (vercel) return `https://${vercel.replace(/^https?:\/\//, "").replace(/\/+$/, "")}`;
  return "https://alam.kz";
}
