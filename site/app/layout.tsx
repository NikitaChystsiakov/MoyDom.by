import type { Metadata } from "next";
import { Manrope, Golos_Text } from "next/font/google";
import "./globals.css";

const display = Manrope({ subsets: ["latin", "cyrillic"], weight: ["600", "700", "800"], variable: "--font-display" });
const body = Golos_Text({ subsets: ["latin", "cyrillic"], weight: ["400", "500", "600"], variable: "--font-body" });

export const metadata: Metadata = {
  title: "МойДом.BY: найдите свой дом среди готовых проектов",
  description: "Прототип каталога архитектурной мастерской МойДом.BY: параметры складываются, а если дома нет, запрос уходит архитектору.",
  robots: { index: false, follow: false },
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="ru" className={`${display.variable} ${body.variable}`}>
      <body>{children}</body>
    </html>
  );
}
