"use client";
import { AREA_MAX, type Query } from "@/lib/filters";

export default function AreaSlider({ q, set, max = AREA_MAX }: { q: Query; set: (q: Query) => void; max?: number }) {
  const v = q.areaMax ?? max;
  const pct = ((v - 60) / (max - 60)) * 100;
  return (
    <label className="area">
      <span>{q.areaMax == null ? "Площадь любая" : <>до <b className="nums">{q.areaMax}</b> м²</>}</span>
      <input type="range" min={60} max={max} step={10} value={v} style={{ "--p": `${pct}%` } as React.CSSProperties} aria-label="Максимальная площадь, м²"
        onChange={(e) => { const n = Number(e.target.value); set({ ...q, areaMax: n >= max ? null : n }); }} />
    </label>
  );
}
