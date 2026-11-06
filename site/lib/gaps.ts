import type { Card } from "./data";
import { phrase, run, type Query } from "./filters";

/** Настоящие пустоты каталога: сочетания, где по отдельности проекты есть, а вместе нет ни одного */
export function findGaps(all: Card[], limit = 8) {
  const list = all as never;
  const floors = [["floors", "1"], ["floors", "2"]];
  const others: [string, string][] = [["car", "garage"], ["car", "carport"], ["material", "wood"], ["material", "frame"], ["roof", "flat"], ["extra", "light2"], ["extra", "pool"], ["extra", "terrace"], ["style", "chalet"], ["style", "classic"], ["bedrooms", "4"], ["bedrooms", "5"], ["use", "narrow"]];
  const areas = [100, 120, 150, 200];
  const mk = (items: [string, string][], areaMax: number | null): Query => {
    const sel: Record<string, string[]> = {};
    for (const [g, id] of items) sel[g] = [...(sel[g] ?? []), id];
    return { sel, areaMax };
  };
  const gaps: { q: Query; text: string; loose: number }[] = [];
  for (const [fg, fid] of floors) for (const a of areas) for (let i = 0; i < others.length; i++) for (let j = i; j < others.length; j++) {
    const items: [string, string][] = i === j ? [[fg, fid], others[i]] : [[fg, fid], others[i], others[j]];
    if (i !== j && others[i][0] === others[j][0]) continue;
    const q = mk(items, a);
    if (run(list, q).length !== 0) continue;
    const loose = run(list, mk(items, null)).length;
    if (loose < 2) continue;
    gaps.push({ q, text: phrase(q), loose });
  }
  gaps.sort((x, y) => Object.values(x.q.sel).flat().length - Object.values(y.q.sel).flat().length || y.loose - x.loose || (y.q.areaMax ?? 0) - (x.q.areaMax ?? 0));
  const seen = new Set<string>(); const out: typeof gaps = [];
  for (const g of gaps) {
    const key = JSON.stringify(g.q.sel);
    if (seen.has(key)) continue;
    seen.add(key); out.push(g);
    if (out.length >= limit) break;
  }
  return out;
}
