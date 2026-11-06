"use client";
import Link from "next/link";
import { AnimatePresence, motion } from "motion/react";
import { useEffect, useState } from "react";
import { createPortal } from "react-dom";
import { MESSENGERS, PHONE, PHONE2 } from "@/lib/contacts";

export const OLD = "https://moydom.by";
const ease = [0.16, 1, 0.3, 1] as const;
const LINKS = [
  { href: `${OLD}/individualny-proekt`, label: "Индивидуальный проект" },
  { href: `${OLD}/stroitelstvo-domov/`, label: "Строительство" },
  { href: `${OLD}/vopros-otvet/`, label: "Вопрос-ответ" },
  { href: `${OLD}/about_us`, label: "О мастерской" },
];

export default function Header() {
  const [open, setOpen] = useState(false);
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && setOpen(false);
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open]);
  return (
    <header className="top">
      <Link href="/proekty" className="logo" aria-label="МойДом.BY, каталог проектов"><img src="/logo.png" alt="МойДом.BY" width={150} height={38} /></Link>
      <nav aria-label="Разделы">
        <Link href="/proekty">Проекты</Link>
        {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
      </nav>
      <a className="tel" href={`tel:${PHONE.tel}`}>{PHONE.text}</a>
      <a className="me" href={MESSENGERS[0].href}>Viber</a>
      <a className="icon-btn call" href={`tel:${PHONE.tel}`} aria-label={`Позвонить ${PHONE.text}`}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M5 2.5h3l1.4 4-2 1.5a10 10 0 0 0 4.6 4.6l1.5-2 4 1.4v3a2 2 0 0 1-2.2 2A15 15 0 0 1 3 4.7a2 2 0 0 1 2-2.2z" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinejoin="round" /></svg>
      </a>
      <button className="icon-btn menu" aria-label="Меню" aria-expanded={open} onClick={() => setOpen(true)}>
        <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M3 5.5h14M3 10h14M3 14.5h14" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
      </button>
      {typeof document !== "undefined" && createPortal(<AnimatePresence>
        {open && (
          <>
            <motion.div className="shade" onClick={() => setOpen(false)} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
            <motion.aside className="panel day" aria-label="Меню" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.36, ease }}>
              <div className="panel-head">
                <h2>МойДом.BY</h2>
                <button className="x" onClick={() => setOpen(false)} aria-label="Закрыть"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
              </div>
              <div className="panel-body menu-body">
                <Link href="/proekty" onClick={() => setOpen(false)}>Проекты</Link>
                {LINKS.map((l) => <a key={l.href} href={l.href}>{l.label}</a>)}
                <hr />
                <a href={`tel:${PHONE.tel}`}><b className="nums">{PHONE.text}</b></a>
                <a href={`tel:${PHONE2.tel}`}><b className="nums">{PHONE2.text}</b></a>
                <div className="msg">{MESSENGERS.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}</div>
                <hr />
                <Link href="/admin" onClick={() => setOpen(false)}>Демо: экран Алексея</Link>
              </div>
            </motion.aside>
          </>
        )}
      </AnimatePresence>, document.body)}
    </header>
  );
}
