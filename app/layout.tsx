import type { Metadata, Viewport } from "next";
import Script from "next/script";
import Link from "next/link";
import "./globals.css";
import { TelegramProvider } from "@/components/TelegramProvider";
import { LangSwitch } from "@/components/LangSwitch";
import { Logo } from "@/components/Logo";
import { getT } from "@/lib/i18n-server";

export const metadata: Metadata = {
  title: "alam — математическая грамотность ЕНТ",
  description: "Тренажёр по математической грамотности для подготовки к ЕНТ",
  metadataBase: new URL(process.env.NEXT_PUBLIC_APP_URL ?? "https://alam.kz"),
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 1,
  viewportFit: "cover",
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const { lang } = await getT();
  return (
    <html lang={lang === "kz" ? "kk" : "ru"}>
      <head>
        <Script src="https://telegram.org/js/telegram-web-app.js" strategy="beforeInteractive" />
      </head>
      <body className="min-h-dvh font-sans antialiased">
        <TelegramProvider />
        <div className="mx-auto flex min-h-dvh max-w-xl flex-col px-4 pb-8">
          <header className="flex items-center justify-between py-4">
            <Link href="/" aria-label="alam">
              <Logo />
            </Link>
            <LangSwitch lang={lang} />
          </header>
          <main className="flex-1">{children}</main>
        </div>
      </body>
    </html>
  );
}
