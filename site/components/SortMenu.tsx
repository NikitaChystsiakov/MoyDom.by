"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import { useEffect, useId, useRef, useState, type KeyboardEvent } from "react";

export type SortOption<T extends string> = { id: T; label: string; full: string };

export default function SortMenu<T extends string>({ value, options, onChange }: { value: T; options: SortOption<T>[]; onChange: (v: T) => void }) {
  const [open, setOpen] = useState(false);
  const [active, setActive] = useState(0);
  const box = useRef<HTMLDivElement>(null);
  const btn = useRef<HTMLButtonElement>(null);
  const list = useRef<HTMLUListElement>(null);
  const uid = useId();
  const reduce = useReducedMotion();
  const index = Math.max(0, options.findIndex((o) => o.id === value));

  useEffect(() => {
    if (!open) return;
    setActive(index);
    list.current?.focus();
    const outside = (e: PointerEvent) => { if (!box.current?.contains(e.target as Node)) setOpen(false); };
    document.addEventListener("pointerdown", outside);
    return () => document.removeEventListener("pointerdown", outside);
  }, [open, index]);

  const pick = (id: T) => { onChange(id); setOpen(false); btn.current?.focus(); };
  const onKey = (e: KeyboardEvent) => {
    if (e.key === "ArrowDown") { e.preventDefault(); setActive((a) => (a + 1) % options.length); }
    else if (e.key === "ArrowUp") { e.preventDefault(); setActive((a) => (a - 1 + options.length) % options.length); }
    else if (e.key === "Home") { e.preventDefault(); setActive(0); }
    else if (e.key === "End") { e.preventDefault(); setActive(options.length - 1); }
    else if (e.key === "Enter" || e.key === " ") { e.preventDefault(); pick(options[active].id); }
    else if (e.key === "Escape") { e.preventDefault(); setOpen(false); btn.current?.focus(); }
    else if (e.key === "Tab") setOpen(false);
  };

  return (
    <div className="sort" ref={box}>
      <button ref={btn} type="button" className="sort-btn" aria-haspopup="listbox" aria-expanded={open} aria-label={`Сортировка: ${options[index].full}`} onClick={() => setOpen((o) => !o)}>
        <svg className="ico" width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M2 4h12M2 8h8M2 12h4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /></svg>
        <span>{options[index].label}</span>
        <svg className="chev" width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="M2.5 4.5 6 8l3.5-3.5" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>
      </button>
      <AnimatePresence>
        {open && (
          <motion.ul ref={list} className="sort-menu" role="listbox" tabIndex={-1} aria-label="Сортировка" aria-activedescendant={`${uid}-${active}`} onKeyDown={onKey}
            initial={reduce ? { opacity: 0 } : { opacity: 0, y: -4, scale: 0.98 }} animate={{ opacity: 1, y: 0, scale: 1 }} exit={{ opacity: 0, transition: { duration: 0.1 } }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}>
            {options.map((o, i) => (
              <li key={o.id} id={`${uid}-${i}`} role="option" aria-selected={o.id === value} className={i === active ? "act" : ""} onPointerEnter={() => setActive(i)} onClick={() => pick(o.id)}>
                {o.full}
                {o.id === value && <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="m3 8.5 3.2 3.2L13 5" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" /></svg>}
              </li>
            ))}
          </motion.ul>
        )}
      </AnimatePresence>
    </div>
  );
}
