/**
 * Админ ли пользователь. ADMIN_TG_IDS — список через запятую: числовые Telegram ID и/или @username.
 * Username сверяется без учёта регистра; числовой ID надёжнее (username можно сменить).
 */
export function isAdmin(s: { uid: number; username?: string }, list = process.env.ADMIN_TG_IDS ?? "") {
  const entries = list.split(",").map((x) => x.trim().toLowerCase()).filter(Boolean);
  if (entries.includes(String(s.uid))) return true;
  const u = s.username?.toLowerCase();
  return !!u && entries.includes(`@${u}`);
}
