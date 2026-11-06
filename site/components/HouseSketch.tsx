"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import type { Query } from "@/lib/filters";

type Part = { k: string; d: string; acc?: boolean; w?: number };

function parts(q: Query): { list: Part[]; x1: number; x2: number; dimY: number } {
  const s = q.sel; const has = (g: string, id: string) => (s[g] ?? []).includes(id);
  const area = q.areaMax ?? 150;
  const bucket = area <= 100 ? 0 : area <= 150 ? 1 : area <= 250 ? 2 : 3;
  const w = [170, 200, 236, 268][bucket];
  const two = has("floors", "2"), mans = has("levels", "mansard"), base = has("levels", "basement");
  const garage = has("car", "garage"), carport = has("car", "carport"), terrace = has("extra", "terrace") ;
  const flat = has("roof", "flat"), mono = has("roof", "mono");
  const g = 236, fh = 56, x = terrace ? 150 : 124, h = two ? fh * 2 : fh, top = g - h, cx = x + w / 2, b = `${bucket}${two ? 2 : 1}`;
  const L: Part[] = [{ k: "ground", d: "M16 236H504", w: 2.4 }];
  L.push({ k: `walls${b}${x}`, d: `M${x} ${g}V${top}H${x + w}V${g}` });
  if (two) L.push({ k: `floor2${b}${x}`, d: `M${x} ${g - fh}H${x + w}`, w: 1 });
  const rs = mans ? 0.46 : 0.34, r = Math.min(w * rs, mans ? 104 : 80);
  if (flat) L.push({ k: `flat${b}${x}`, d: `M${x - 14} ${top - 9}H${x + w + 14}V${top}H${x - 14}Z`, w: 2.2 });
  else if (mono) L.push({ k: `mono${b}${x}`, d: `M${x - 14} ${top + 4}L${x + w + 14} ${top - r * 0.7}`, w: 2.4 });
  else {
    L.push({ k: `roof${b}${x}${mans}`, d: `M${x - 14} ${top + 6}L${cx} ${top - r}L${x + w + 14} ${top + 6}`, w: 2.4 });
    L.push({ k: `chim${b}${x}${mans}`, d: `M${x + w * 0.72} ${top - r * 0.62}V${top - r * 0.98}h16V${top - r * 0.34}`, w: 1.6 });
    if (mans) L.push({ k: `dormer${b}${x}`, d: `M${cx - 18} ${top - 8}v-24h36v24M${cx} ${top - 32}v24`, acc: true, w: 1.8 });
  }
  const n = Math.max(3, Math.round(w / 62));
  for (let f = 0; f < (two ? 2 : 1); f++) for (let i = 0; i < n; i++) {
    if (f === 0 && i === 1) continue;
    const wx = x + 20 + (i * (w - 40)) / n, y = g - fh * (f + 1) + 14;
    L.push({ k: `win${b}${x}-${f}-${i}`, d: `M${wx} ${y}h28v28h-28zM${wx + 14} ${y}v28`, w: 1.2 });
  }
  const dx = x + 20 + (w - 40) / n;
  L.push({ k: `door${b}${x}`, d: `M${dx + 3} ${g}v-42h21v42`, w: 1.6 });
  let x2 = x + w;
  if (garage) {
    const gx = x + w;
    L.push({ k: `gar1${b}${x}`, d: `M${gx} ${g - 46}H${gx + 92}V${g}M${gx - 2} ${g - 54}H${gx + 102}`, acc: true, w: 2.4 });
    L.push({ k: `gar2${b}${x}`, d: `M${gx + 13} ${g}v-32h66v32M${gx + 13} ${g - 21}h66M${gx + 13} ${g - 10}h66`, acc: true, w: 1.3 });
    x2 = gx + 92;
  }
  if (carport) {
    const c = x2;
    L.push({ k: `car${b}${x}${garage}`, d: `M${c} ${g - 50}H${c + 76}M${c + 70} ${g - 50}V${g}`, acc: true, w: 2 });
    x2 = c + 70;
  }
  if (terrace) L.push({ k: `ter${b}${x}`, d: `M${x - 68} ${g - 50}H${x}M${x - 62} ${g - 50}V${g}M${x - 32} ${g - 50}V${g}`, acc: true, w: 2 });
  if (base) L.push({ k: `base${b}${x}`, d: `M${x} ${g}v26h${w}v-26`, acc: true, w: 1.6 });
  const x1 = terrace ? x - 62 : x;
  return { list: L, x1, x2, dimY: base ? g + 44 : g + 26 };
}

export default function HouseSketch({ q, compact, bold }: { q: Query; compact?: boolean; bold?: boolean }) {
  const reduce = useReducedMotion();
  const { list, x1, x2, dimY } = parts(q);
  const label = q.areaMax != null ? `до ${q.areaMax}\u00a0м²` : "площадь любая";
  return (
    <svg className={compact ? "sketch sketch-compact" : "sketch"} viewBox="0 0 520 300" role="img" aria-label="Эскиз дома по выбранным условиям">
      <AnimatePresence initial={false}>
        {list.map((p, i) => (
          <motion.path key={p.k} d={p.d} fill="none" stroke={p.acc ? "var(--accent)" : "currentColor"} strokeWidth={(p.w ?? 2) * (bold ? 1.5 : 1)} strokeLinecap="round" strokeLinejoin="round"
            initial={reduce ? { opacity: 0 } : { pathLength: 0, opacity: 0 }}
            animate={reduce ? { opacity: 1 } : { pathLength: 1, opacity: 1 }}
            exit={{ opacity: 0, transition: { duration: 0.15 } }}
            transition={{ duration: 0.55, delay: Math.min(i * 0.012, 0.18), ease: [0.16, 1, 0.3, 1] }} />
        ))}
      </AnimatePresence>
      <motion.path d={`M${x1} ${dimY}H${x2}M${x1} ${dimY - 6}V${dimY + 6}M${x2} ${dimY - 6}V${dimY + 6}`} fill="none" stroke="currentColor" strokeWidth={1} opacity={0.7} animate={{ d: `M${x1} ${dimY}H${x2}M${x1} ${dimY - 6}V${dimY + 6}M${x2} ${dimY - 6}V${dimY + 6}` }} />
      <text x={(x1 + x2) / 2} y={dimY + 20} textAnchor="middle" fontSize={bold ? 17 : 14} fontWeight={bold ? 500 : 400} fill="currentColor">{label}</text>
    </svg>
  );
}
