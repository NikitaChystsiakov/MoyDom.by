"use client";
import type { Query } from "./filters";
import type { Card } from "./data";

/* В прототипе всё хранится в браузере. На настоящем сайте эти же записи лягут в базу. */
export type SearchEvent = { id: string; at: number; phrase: string; params: string; count: number };
export type Lead = { id: string; at: number; name: string; phone: string; comment: string; phrase: string; params: string; project?: string; contact?: string; plot?: string; place?: string; size?: string; start?: string };
export type Override = Partial<{ price: number; priceSketch: number; area: number; bedrooms: number; floors: 1 | 2; hidden: boolean; title: string; img: string; imgBig: string | null; gallery: string[]; plans: string[]; plan: string | null; hasMirror: boolean }>;

const K = { s: "md.searches", l: "md.leads", o: "md.overrides", c: "md.custom" };
const read = <T,>(k: string, d: T): T => {
  try { const v = localStorage.getItem(k); return v ? (JSON.parse(v) as T) : d; } catch { return d; }
};
const write = (k: string, v: unknown) => { try { localStorage.setItem(k, JSON.stringify(v)); } catch { /* приватный режим */ } };
const id = () => Math.random().toString(36).slice(2, 9);

export const getSearches = () => read<SearchEvent[]>(K.s, []);
export const getLeads = () => read<Lead[]>(K.l, []);
export const getOverrides = () => read<Record<string, Override>>(K.o, {});

export function logSearch(e: Omit<SearchEvent, "id" | "at">) {
  const all = getSearches();
  write(K.s, [{ ...e, id: id(), at: Date.now() }, ...all.filter((x) => x.params !== e.params)].slice(0, 200));
}
export function addLead(l: Omit<Lead, "id" | "at">) {
  write(K.l, [{ ...l, id: id(), at: Date.now() }, ...getLeads()]);
}
export function setOverride(slug: string, o: Override) {
  const all = getOverrides(); all[slug] = { ...all[slug], ...o }; localStorage.setItem(K.o, JSON.stringify(all)); // при переполнении бросает ошибку, форма её покажет
}
const PLOT: Record<string, string> = { "Есть": "участок есть", "Выбираю": "участок выбирает", "Пока нет": "участка пока нет" };
const START: Record<string, string> = { "До 3 месяцев": "начать в ближайшие 3 месяца", "В течение года": "начать в течение года", "Присматриваюсь": "пока присматривается" };
/** Необязательные ответы из формы одной строкой для админ-панели */
export function leadDetails(l: Lead) {
  const plot = l.plot ? [PLOT[l.plot] ?? l.plot, l.place, l.size ? `${l.size} сот.` : ""].filter(Boolean).join(", ") : "";
  return [l.contact ? `связь: ${l.contact}` : "", plot, l.start ? START[l.start] ?? l.start : ""].filter(Boolean).join(" · ");
}
export const getCustom = () => read<Card[]>(K.c, []);
export function addCustom(c: Card) { localStorage.setItem(K.c, JSON.stringify([c, ...getCustom().filter((x) => x.slug !== c.slug)])); }
/** Каталог с учётом правок и новых проектов из админки */
export function withLocal(cards: Card[]) {
  const o = getOverrides(); const custom = getCustom();
  if (!Object.keys(o).length && !custom.length) return cards;
  return [...custom, ...cards].map((c) => (o[c.slug] ? { ...c, ...o[c.slug] } : c)).filter((c) => !(c as Card & { hidden?: boolean }).hidden);
}
export function resetDemo() { for (const k of Object.values(K)) { try { localStorage.removeItem(k); } catch { /* */ } } }
export type { Query };
