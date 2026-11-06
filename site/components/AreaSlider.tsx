"use client";
import { startTransition, useEffect, useRef, useState } from "react";
import { AREA_MAX, type Query } from "@/lib/filters";

const PAUSE = 140; // каталог обновляется, когда ползунок остановился, а не на каждом шаге

export default function AreaSlider({ q, set, max = AREA_MAX }: { q: Query; set: (q: Query) => void; max?: number }) {
  const [draft, setDraft] = useState<number | null>(null); // значение под пальцем, пока каталог его ещё не применил
  const timer = useRef<ReturnType<typeof setTimeout> | undefined>(undefined);
  const latest = useRef({ q, set });
  useEffect(() => { latest.current = { q, set }; });
  const applied = q.areaMax ?? max;
  useEffect(() => { setDraft((d) => (d === applied ? null : d)); }, [applied]);
  useEffect(() => () => clearTimeout(timer.current), []);

  const commit = (n: number) => {
    clearTimeout(timer.current); timer.current = undefined;
    startTransition(() => latest.current.set({ ...latest.current.q, areaMax: n >= max ? null : n }));
  };
  const flush = () => { if (timer.current !== undefined && draft != null) commit(draft); };

  const v = draft ?? applied;
  const pct = ((v - 60) / (max - 60)) * 100;
  return (
    <label className="area">
      <span>{v >= max ? "Площадь любая" : <>до <b className="nums">{v}</b> м²</>}</span>
      <input type="range" min={60} max={max} step={10} value={v} style={{ "--p": `${pct}%` } as React.CSSProperties} aria-label="Максимальная площадь, м²"
        onChange={(e) => { const n = Number(e.target.value); setDraft(n); clearTimeout(timer.current); timer.current = setTimeout(() => commit(n), PAUSE); }}
        onPointerUp={flush} onKeyUp={flush} />
    </label>
  );
}
