import { createHash, createHmac, timingSafeEqual } from "crypto";

export type TgUser = {
  id: number;
  first_name: string;
  last_name?: string;
  username?: string;
  photo_url?: string;
  language_code?: string;
};

const DAY = 86400;

function dataCheckString(entries: [string, string][]) {
  return entries
    .filter(([k]) => k !== "hash")
    .sort(([a], [b]) => (a < b ? -1 : a > b ? 1 : 0))
    .map(([k, v]) => `${k}=${v}`)
    .join("\n");
}

function safeEqualHex(a: string, b: string) {
  const x = Buffer.from(a, "hex"), y = Buffer.from(b, "hex");
  return x.length === y.length && x.length > 0 && timingSafeEqual(x, y);
}

function fresh(authDate: number, maxAgeSec: number, now: number) {
  return Number.isFinite(authDate) && now - authDate <= maxAgeSec && authDate - now < 60;
}

/** Проверка initData из Telegram Mini App (https://core.telegram.org/bots/webapps#validating-data-received-via-the-mini-app). */
export function verifyWebAppInitData(initData: string, botToken: string, maxAgeSec = DAY, now = Date.now() / 1000): TgUser | null {
  const params = new URLSearchParams(initData);
  const hash = params.get("hash");
  if (!hash) return null;
  const secret = createHmac("sha256", "WebAppData").update(botToken).digest();
  const expected = createHmac("sha256", secret).update(dataCheckString([...params.entries()])).digest("hex");
  if (!safeEqualHex(hash, expected)) return null;
  if (!fresh(Number(params.get("auth_date")), maxAgeSec, now)) return null;
  try {
    const user = JSON.parse(params.get("user") ?? "null") as TgUser | null;
    return user && typeof user.id === "number" ? user : null;
  } catch {
    return null;
  }
}

/** Проверка данных Telegram Login Widget (https://core.telegram.org/widgets/login#checking-authorization). */
export function verifyLoginWidget(data: Record<string, string | number>, botToken: string, maxAgeSec = DAY, now = Date.now() / 1000): TgUser | null {
  const hash = String(data.hash ?? "");
  if (!hash) return null;
  const secret = createHash("sha256").update(botToken).digest();
  const entries = Object.entries(data).filter(([, v]) => v !== undefined && v !== null).map(([k, v]) => [k, String(v)] as [string, string]);
  const expected = createHmac("sha256", secret).update(dataCheckString(entries)).digest("hex");
  if (!safeEqualHex(hash, expected)) return null;
  if (!fresh(Number(data.auth_date), maxAgeSec, now)) return null;
  const id = Number(data.id);
  if (!Number.isSafeInteger(id)) return null;
  return {
    id,
    first_name: String(data.first_name ?? ""),
    last_name: data.last_name ? String(data.last_name) : undefined,
    username: data.username ? String(data.username) : undefined,
    photo_url: data.photo_url ? String(data.photo_url) : undefined,
  };
}
