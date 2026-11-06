import type { Project } from "./types";

export type Option = { id: string; label: string; test: (p: Project) => boolean };
/** all: все варианты сразу (терраса И камин). Иначе любой из выбранных (3 ИЛИ 4 спальни) */
export type Group = { id: string; label: string; options: Option[]; all?: boolean };

const tag = (id: string, label: string): Option => ({ id, label, test: (p) => p.tags.includes(id) });

export const GROUPS: Group[] = [
  { id: "kind", label: "Что строим", options: [
    { id: "house", label: "Дом", test: (p) => p.kind === "house" },
    { id: "house-banya", label: "Дом-баня", test: (p) => p.kind === "house-banya" },
    { id: "banya", label: "Баня", test: (p) => p.kind === "banya" },
  ]},
  { id: "floors", label: "Этажность", options: [
    { id: "1", label: "1 этаж", test: (p) => p.floors === 1 },
    { id: "2", label: "2 этажа", test: (p) => p.floors === 2 },
  ]},
  { id: "levels", label: "Мансарда и подвал", all: true, options: [tag("mansard", "С мансардой"), tag("basement", "С подвалом")] },
  { id: "bedrooms", label: "Спальни", options: [
    { id: "1", label: "1", test: (p) => p.bedrooms === 1 },
    { id: "2", label: "2", test: (p) => p.bedrooms === 2 },
    { id: "3", label: "3", test: (p) => p.bedrooms === 3 },
    { id: "4", label: "4", test: (p) => p.bedrooms === 4 },
    { id: "5", label: "5+", test: (p) => (p.bedrooms ?? 0) >= 5 },
  ]},
  { id: "car", label: "Машина", options: [tag("garage", "Гараж"), tag("carport", "Навес для машины")] },
  { id: "material", label: "Материал стен", options: [tag("blocks", "Блоки"), tag("wood", "Дерево"), tag("frame", "Каркас")] },
  { id: "roof", label: "Кровля", options: [tag("flat", "Плоская")] },
  { id: "extra", label: "Что есть в доме", all: true, options: [
    tag("terrace", "Терраса"), tag("veranda", "Веранда"), tag("light2", "Второй свет"), tag("fireplace", "Камин"),
    tag("sauna", "Сауна или баня"), tag("pool", "Бассейн"), tag("bay", "Эркер"), tag("panorama", "Панорамные окна"),
  ]},
  { id: "style", label: "Стиль", options: [
    tag("modern", "Современный"), tag("classic", "Классический"), tag("minimal", "Минимализм"),
    tag("hitech", "Хай-тек"), tag("barn", "Барнхаус"), tag("chalet", "Шале"),
  ]},
  { id: "use", label: "Для чего", options: [tag("dacha", "Дача"), tag("narrow", "Узкий участок"), tag("duplex", "На две семьи")] },
];

export const AREA_MIN = 40;
export const AREA_MAX = 400;

export type Query = { sel: Record<string, string[]>; areaMax: number | null };
export const EMPTY: Query = { sel: {}, areaMax: null };

export function isEmpty(q: Query) {
  return q.areaMax == null && Object.values(q.sel).every((v) => v.length === 0);
}

function matchGroup(p: Project, g: Group, ids: string[]) {
  if (!ids.length) return true;
  const chosen = g.options.filter((o) => ids.includes(o.id));
  return g.all ? chosen.every((o) => o.test(p)) : chosen.some((o) => o.test(p));
}

export function match(p: Project, q: Query, skipGroup?: string, skipArea?: boolean) {
  if (!skipArea && q.areaMax != null && (p.area == null || p.area > q.areaMax)) return false;
  return GROUPS.every((g) => g.id === skipGroup || matchGroup(p, g, q.sel[g.id] ?? []));
}

export const run = (all: Project[], q: Query) => all.filter((p) => match(p, q));

/** Сколько проектов получится, если нажать этот вариант, с учётом остальных условий */
export function optionCount(all: Project[], q: Query, g: Group, o: Option) {
  const cur = q.sel[g.id] ?? [];
  const ids = cur.includes(o.id) ? cur : [...cur, o.id];
  return all.filter((p) => match(p, q, g.id) && matchGroup(p, g, ids)).length;
}

export function toggle(q: Query, g: string, id: string): Query {
  const cur = q.sel[g] ?? [];
  return { ...q, sel: { ...q.sel, [g]: cur.includes(id) ? cur.filter((x) => x !== id) : [...cur, id] } };
}

export type Active = { group: string; id: string; label: string } | { group: "area"; id: "area"; label: string };

export function activeList(q: Query): Active[] {
  const out: Active[] = [];
  for (const g of GROUPS) for (const id of q.sel[g.id] ?? []) {
    const o = g.options.find((x) => x.id === id);
    if (o) out.push({ group: g.id, id, label: g.id === "bedrooms" ? `${o.label} ${o.label === "1" ? "спальня" : o.label === "5+" ? "спален" : "спальни"}` : o.label });
  }
  if (q.areaMax != null) out.push({ group: "area", id: "area", label: `до ${q.areaMax}\u00a0м²` });
  return out;
}

export function removeActive(q: Query, a: Active): Query {
  if (a.group === "area") return { ...q, areaMax: null };
  return toggle(q, a.group, a.id);
}

/** Условия словами для заголовка: «Одноэтажный», «с гаражом», «до 150 м²» */
const WORD: Record<string, string> = {
  "floors.1": "Одноэтажный", "floors.2": "Двухэтажный", "levels.mansard": "с мансардой", "levels.basement": "с подвалом",
  "kind.house": "дом", "kind.house-banya": "дом-баня", "kind.banya": "баня",
  "car.garage": "с гаражом", "car.carport": "с навесом для машины",
  "material.blocks": "из блоков", "material.wood": "деревянный", "material.frame": "каркасный",
  "roof.flat": "плоская кровля", "roof.mono": "односкатная кровля",
  "extra.terrace": "с террасой", "extra.veranda": "с верандой", "extra.light2": "со вторым светом", "extra.fireplace": "с камином",
  "extra.sauna": "с сауной", "extra.pool": "с бассейном", "extra.bay": "с эркером", "extra.panorama": "с панорамными окнами",
  "style.modern": "современный", "style.classic": "классический", "style.minimal": "минимализм", "style.hitech": "хай-тек",
  "style.barn": "барнхаус", "style.chalet": "шале", "use.dacha": "для дачи", "use.narrow": "на узкий участок", "use.duplex": "на две семьи",
};
export function tokens(q: Query) {
  return activeList(q).map((a) => ({ a, word: a.group === "area" ? a.label : a.group === "bedrooms" ? a.label : WORD[`${a.group}.${a.id}`] ?? a.label }));
}

/** Какое одно условие снять, чтобы появились проекты: лучшие подсказки сверху */
export function relax(all: Project[], q: Query) {
  const now = run(all, q).length;
  return activeList(q)
    .map((a) => ({ a, count: run(all, removeActive(q, a)).length - now }))
    .filter((x) => x.count > 0)
    .sort((x, y) => y.count - x.count);
}

/** Подсказка по-человечески: что изменится, если снять условие */
const WITHOUT: Record<string, string> = {
  "car.garage": "гаража", "car.carport": "навеса", "extra.terrace": "террасы", "extra.veranda": "веранды", "extra.light2": "второго света",
  "extra.fireplace": "камина", "extra.sauna": "сауны", "extra.pool": "бассейна", "extra.bay": "эркера", "extra.panorama": "панорамных окон",
  "levels.mansard": "мансарды", "levels.basement": "подвала", "roof.flat": "плоской кровли",
};
const OTHER: Record<string, string> = { floors: "этажность другая", bedrooms: "спален другое число", material: "материал другой", style: "стиль другой", use: "назначение другое", kind: "тип другой" };
export function relaxLabel(a: Active) {
  if (a.group === "area") return "Если площадь больше";
  const w = WITHOUT[`${a.group}.${a.id}`];
  return w ? `Если без ${w}` : `Если ${OTHER[a.group] ?? "условие другое"}`;
}

/** Запрос словами: «Двухэтажный дом с гаражом до 150 м²» */
export function phrase(q: Query) {
  const s = q.sel;
  const has = (g: string, id: string) => (s[g] ?? []).includes(id);
  const kinds = s.kind ?? [];
  const noun = kinds.length === 1 ? ({ house: "дом", banya: "баня", "house-banya": "дом-баня" } as Record<string, string>)[kinds[0]] : "дом";
  const fem = noun === "баня";
  const adj: string[] = [];
  if (has("floors", "1") && !has("floors", "2")) adj.push(fem ? "Одноэтажная" : "Одноэтажный");
  if (has("floors", "2") && !has("floors", "1")) adj.push(fem ? "Двухэтажная" : "Двухэтажный");
  const style: Record<string, string> = { modern: "современный", classic: "классический" };
  for (const id of s.style ?? []) if (style[id]) adj.push(style[id]);
  const styleTail: Record<string, string> = { minimal: "в стиле минимализм", hitech: "в стиле хай-тек", barn: "в стиле барнхаус", chalet: "в стиле шале" };
  const mat: Record<string, string> = { wood: "деревянный", frame: "каркасный" };
  for (const id of s.material ?? []) if (mat[id]) adj.push(mat[id]);
  const tail: string[] = [];
  const beds = s.bedrooms ?? [];
  if (beds.length === 1) tail.push(`на ${beds[0] === "5" ? "5+" : beds[0]} ${beds[0] === "1" ? "спальню" : beds[0] === "5" ? "спален" : "спальни"}`);
  if (beds.length > 1) tail.push(`на ${beds.map((b) => (b === "5" ? "5+" : b)).join(" или ")} спальни`);
  if (has("material", "blocks")) tail.push("из блоков");
  for (const id of s.style ?? []) if (styleTail[id]) tail.push(styleTail[id]);
  if (has("levels", "mansard")) tail.push("с мансардой");
  if (has("levels", "basement")) tail.push("с подвалом");
  if (has("car", "garage")) tail.push("с гаражом");
  if (has("car", "carport")) tail.push("с навесом для машины");
  const ex: Record<string, string> = { terrace: "с террасой", veranda: "с верандой", light2: "со вторым светом", fireplace: "с камином", sauna: "с сауной", pool: "с бассейном", bay: "с эркером", panorama: "с панорамными окнами" };
  for (const id of s.extra ?? []) if (ex[id]) tail.push(ex[id]);
  if (has("roof", "flat")) tail.push("с плоской кровлей");
  if (has("roof", "mono")) tail.push("с односкатной кровлей");
  const use: Record<string, string> = { dacha: "для дачи", narrow: "на узкий участок", duplex: "на две семьи" };
  for (const id of s.use ?? []) if (use[id]) tail.push(use[id]);
  if (q.areaMax != null) tail.push(`до ${q.areaMax}\u00a0м²`);
  const head = adj.length ? [adj[0], ...adj.slice(1)].join(" ") + " " + noun : noun[0].toUpperCase() + noun.slice(1);
  return [head, ...tail].join(" ");
}

export function toParams(q: Query) {
  const u = new URLSearchParams();
  for (const [k, v] of Object.entries(q.sel)) if (v.length) u.set(k, v.join(","));
  if (q.areaMax != null) u.set("area", String(q.areaMax));
  return u.toString();
}

export function fromParams(u: URLSearchParams): Query {
  const sel: Record<string, string[]> = {};
  for (const g of GROUPS) { const v = u.get(g.id); if (v) sel[g.id] = v.split(",").filter(Boolean); }
  const a = Number(u.get("area"));
  return { sel, areaMax: a > 0 ? a : null };
}

/** Разделы старого сайта открываются как готовый фильтр: адрес сохраняется */
export const OLD_SECTIONS: Record<string, { title: string; q: Query }> = {
  odnoetajnie: { title: "Проекты одноэтажных домов", q: { sel: { floors: ["1"] }, areaMax: null } },
  dvuhetajnie: { title: "Проекты двухэтажных домов", q: { sel: { floors: ["2"] }, areaMax: null } },
  "s-mansardnym-etajom": { title: "Проекты с мансардой", q: { sel: { levels: ["mansard"] }, areaMax: null } },
  "s-podvalom": { title: "Проекты с подвалом", q: { sel: { levels: ["basement"] }, areaMax: null } },
  bani: { title: "Проекты бань", q: { sel: { kind: ["banya"] }, areaMax: null } },
  "doma-s-garajom": { title: "Проекты домов с гаражом", q: { sel: { car: ["garage"] }, areaMax: null } },
  do80kvm: { title: "Проекты до 100 м²", q: { sel: {}, areaMax: 100 } },
  "80-150kvm": { title: "Проекты 100–150 м²", q: { sel: {}, areaMax: 150 } },
  "proekty-karkasnyh-domov": { title: "Каркасные проекты", q: { sel: { material: ["frame"] }, areaMax: null } },
  dereviannie: { title: "Проекты деревянных домов", q: { sel: { material: ["wood"] }, areaMax: null } },
  "s-ploskoy": { title: "С плоской кровлей", q: { sel: { roof: ["flat"] }, areaMax: null } },
  "proekty-dachnyh-domov": { title: "Дачные проекты", q: { sel: { use: ["dacha"] }, areaMax: null } },
};
