"use client";
import { AnimatePresence, motion } from "motion/react";
import { useEffect } from "react";
import type { Card } from "@/lib/data";
import { AREA_MAX, GROUPS, optionCount, type Query, toggle } from "@/lib/filters";
import AreaSlider from "./AreaSlider";

const ease = [0.16, 1, 0.3, 1] as const;

export default function FilterPanel({ open, onClose, all, q, set, count }: { open: boolean; onClose: () => void; all: Card[]; q: Query; set: (q: Query) => void; count: number }) {
  useEffect(() => {
    if (!open) return;
    const k = (e: KeyboardEvent) => e.key === "Escape" && onClose();
    document.addEventListener("keydown", k);
    document.body.style.overflow = "hidden";
    return () => { document.removeEventListener("keydown", k); document.body.style.overflow = ""; };
  }, [open, onClose]);
  return (
    <AnimatePresence>
      {open && (
        <>
          <motion.div className="shade" onClick={onClose} initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} />
          <motion.aside className="panel" role="dialog" aria-label="Все фильтры" initial={{ x: "100%" }} animate={{ x: 0 }} exit={{ x: "100%" }} transition={{ duration: 0.42, ease }}>
            <div className="panel-head">
              <h2>Все условия</h2>
              <button className="x" onClick={onClose} aria-label="Закрыть"><svg width="20" height="20" viewBox="0 0 20 20"><path d="M4 4l12 12M16 4L4 16" stroke="currentColor" strokeWidth="2" strokeLinecap="round" /></svg></button>
            </div>
            <div className="panel-body">
              <section><h3>Площадь</h3><AreaSlider q={q} set={set} max={AREA_MAX} /></section>
              {GROUPS.map((g) => (
                <section key={g.id}>
                  <h3>{g.label}</h3>
                  <div className="opts">
                    {g.options.map((o) => {
                      const on = (q.sel[g.id] ?? []).includes(o.id);
                      const n = optionCount(all as never, q, g, o);
                      return (
                        <button key={o.id} className={`chip${on ? " on" : ""}`} aria-pressed={on} disabled={!on && n === 0} onClick={() => set(toggle(q, g.id, o.id))}>
                          {o.label}<i className="nums">{n}</i>
                        </button>
                      );
                    })}
                  </div>
                </section>
              ))}
            </div>
            <div className="panel-foot"><button className="btn btn-led" onClick={onClose}>Показать {count} {count % 10 === 1 && count % 100 !== 11 ? "проект" : count % 10 >= 2 && count % 10 <= 4 && (count % 100 < 12 || count % 100 > 14) ? "проекта" : "проектов"}</button></div>
          </motion.aside>
        </>
      )}
    </AnimatePresence>
  );
}
