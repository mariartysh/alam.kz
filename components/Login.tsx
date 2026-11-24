import { LoginPanel } from "./LoginPanel";
import { getT } from "@/lib/i18n-server";
import { devLoginEnabled } from "@/lib/login";
import { getBotUsername } from "@/lib/bot";

/** Серверная обёртка: подставляет тексты и настройки в LoginPanel. */
export async function Login() {
  const { t } = await getT();
  return (
    <LoginPanel
      bot={await getBotUsername()}
      devLogin={devLoginEnabled()}
      texts={{ title: t("auth.title"), desc: t("auth.desc"), dev: t("auth.dev"), error: t("auth.error"), loading: t("auth.loading") }}
    />
  );
}
