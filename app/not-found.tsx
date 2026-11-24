import Link from "next/link";
import { getT } from "@/lib/i18n-server";

export default async function NotFound() {
  const { t } = await getT();
  return (
    <div className="rounded-2xl bg-card p-6 text-center">
      <p className="text-4xl">🧭</p>
      <p className="mt-2 font-semibold">{t("common.soon")}</p>
      <Link href="/" className="mt-4 inline-block text-link">← {t("common.back")}</Link>
    </div>
  );
}
