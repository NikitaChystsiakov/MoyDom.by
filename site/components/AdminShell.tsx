"use client";
import Link from "next/link";
import { usePathname } from "next/navigation";

export default function AdminShell({ children }: { children: React.ReactNode }) {
  const path = usePathname();
  const tab = (href: string, label: string, on: boolean) => <Link href={href} className={on ? "on" : ""}>{label}</Link>;
  return (
    <div className="ad">
      <div className="ad-top">
        <Link href="/proekty" className="logo" aria-label="На сайт"><img src="/logo.png" alt="МойДом.BY" width={150} height={38} /></Link>
        <nav aria-label="Экран Алексея">
          {tab("/admin", "Что искали", path === "/admin")}
          {tab("/admin/proekty", "Проекты", path.startsWith("/admin/proekty"))}
        </nav>
        <span className="right">Прототип: записи хранятся только в этом браузере</span>
      </div>
      <div className="ad-main">{children}</div>
    </div>
  );
}
