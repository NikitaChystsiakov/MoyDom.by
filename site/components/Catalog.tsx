"use client";
import { AnimatePresence, LayoutGroup, motion } from "motion/react";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { preload } from "react-dom";
import type { Card } from "@/lib/data";
import { EMPTY, activeList, fromParams, isEmpty, match, phrase, relax, relaxLabel, removeActive, run, toParams, toggle, tokens, type Query } from "@/lib/filters";
import { logSearch, withLocal } from "@/lib/store";
import AreaSlider from "./AreaSlider";
import Author from "./Author";
import Count from "./Count";
import FilterPanel from "./FilterPanel";
import Foot from "./Foot";
import Header from "./Header";
import HouseSketch from "./HouseSketch";
import LeadForm from "./LeadForm";
import ProjectCard from "./ProjectCard";
import SortMenu, { type SortOption } from "./SortMenu";

const ease = [0.16, 1, 0.3, 1] as const;
const PAGE = 24;
const NEAR_LIMIT = 60; // дальше этого «ближайшим» проект уже не назвать
const QUICK: { g: string; id: string; label: string }[] = [
  { g: "floors", id: "1", label: "1 этаж" }, { g: "floors", id: "2", label: "2 этажа" }, { g: "levels", id: "mansard", label: "Мансарда" },
  { g: "car", id: "garage", label: "Гараж" }, { g: "extra", id: "terrace", label: "Терраса" },
];
type Sort = "new" | "popular" | "area" | "price";
type View = "facade" | "plan";
const SORTS: SortOption<Sort>[] = [
  { id: "new", label: "Новые", full: "Сначала новые" }, { id: "popular", label: "Популярные", full: "Сначала популярные" },
  { id: "area", label: "По площади", full: "Площадь: от меньшей" }, { id: "price", label: "По цене", full: "Цена: от меньшей" },
];

function plural(n: number) { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? "проект" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "проекта" : "проектов"; }

const Arrow = () => <svg width="14" height="14" viewBox="0 0 14 14" aria-hidden="true"><path d="M2 7h10M8 3l4 4-4 4" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round" /></svg>;

function ViewSwitch({ id, view, setView }: { id: string; view: View; setView: (v: View) => void }) {
  return (
    <div className="sw" role="group" aria-label="Что показать на карточках">
      {(["facade", "plan"] as const).map((v) => (
        <button key={v} aria-pressed={view === v} className={view === v ? "on" : ""} onClick={() => setView(v)}>
          {view === v && <motion.i layoutId={id} className="sw-bg" transition={{ duration: 0.3, ease }} />}
          <span>{v === "facade" ? "Фасад" : "План"}</span>
        </button>
      ))}
    </div>
  );
}

export default function Catalog({ cards, preset, title }: { cards: Card[]; preset?: Query; title?: string }) {
  preload("/hero.webp", { as: "image", fetchPriority: "high" });
  const [q, setQ] = useState<Query>(preset ?? EMPTY);
  const [view, setView] = useState<View>("facade");
  const [sort, setSort] = useState<Sort>("new");
  const [limit, setLimit] = useState(PAGE);
  const [panel, setPanel] = useState(false);
  const [all, setAll] = useState(cards);
  const [formSeen, setFormSeen] = useState(false);
  const formRef = useRef<HTMLDivElement>(null);
  const first = useRef(true);

  useEffect(() => {
    setAll(withLocal(cards));
    const u = new URLSearchParams(location.search);
    if ([...u.keys()].length) setQ(fromParams(u));
    if (u.get("view") === "plan") setView("plan");
  }, [cards]);

  const set = useCallback((n: Query) => { setQ(n); setLimit(PAGE); }, []);
  const found = useMemo(() => {
    const r = run(all as never, q) as unknown as Card[];
    const s = [...r];
    if (sort === "popular") s.sort((a, b) => Number(b.tags.includes("popular")) - Number(a.tags.includes("popular")));
    if (sort === "area") s.sort((a, b) => (a.area ?? 1e9) - (b.area ?? 1e9));
    if (sort === "price") s.sort((a, b) => (a.price ?? 1e9) - (b.price ?? 1e9));
    return s;
  }, [all, q, sort]);
  const params = toParams(q);
  const text = phrase(q);
  const empty = isEmpty(q);
  const hints = useMemo(() => (found.length <= 8 ? relax(all as never, q).slice(0, 3) : []), [all, q, found.length]);
  const toks = tokens(q);

  useEffect(() => {
    if (first.current) { first.current = false; return; }
    const url = location.pathname + (params ? `?${params}` : "");
    history.replaceState(null, "", url);
    if (empty) return;
    const t = setTimeout(() => logSearch({ phrase: text, params, count: found.length }), 1000);
    return () => clearTimeout(t);
  }, [params, text, found.length, empty]);

  const near = useMemo<{ p: Card; note?: string }[]>(() => {
    if (found.length) return [];
    if (q.areaMax != null) {
      const max = q.areaMax;
      const have = activeList(q).find((a) => a.group === "extra" || a.group === "car");
      const extra = have ? ` · ${have.label.toLowerCase()} есть` : "";
      const list = (all as Card[]).filter((p) => p.area != null && match(p as never, q, undefined, true)).sort((a, b) => a.area! - b.area!);
      if (!list.length || list[0].area! - max > NEAR_LIMIT) return [];
      return list.slice(0, 4).map((p) => ({ p, note: `на ${Math.round(p.area! - max)}\u00a0м² больше${extra}` }));
    }
    const best = hints[0]; if (!best) return [];
    return (run(all as never, removeActive(q, best.a)) as unknown as Card[]).slice(0, 4).map((p) => ({ p }));
  }, [found.length, hints, all, q]);

  useEffect(() => {
    const el = formRef.current;
    if (!el) { setFormSeen(false); return; }
    const io = new IntersectionObserver(([e]) => setFormSeen(e.isIntersecting), { threshold: 0.15 });
    io.observe(el);
    return () => io.disconnect();
  }, [found.length]);

  return (
    <>
      <div className="hero night">
        <Header />
        <div className="hero-in">
          <div className="hero-text">
            <h1>
              <span className={empty ? "" : "hero-q"}>{title ?? "Какой дом вы ищете?"}</span>
              {!empty && (
                <span className={`hero-tokens${toks.length > 3 ? " many" : ""}`}>
                  <LayoutGroup>
                    <AnimatePresence mode="popLayout" initial={false}>
                      {toks.map(({ a, word }) => (
                        <motion.button layout key={a.group + a.id} className="tok" title="Убрать условие" onClick={() => set(removeActive(q, a))}
                          initial={{ opacity: 0, y: 12 }} animate={{ opacity: 1, y: 0 }} exit={{ opacity: 0, y: -8 }} transition={{ duration: 0.3, ease }}>
                          {word}<motion.i className="tok-led" initial={{ scaleX: 0 }} animate={{ scaleX: 1 }} transition={{ duration: 0.45, ease, delay: 0.05 }} />
                        </motion.button>
                      ))}
                    </AnimatePresence>
                  </LayoutGroup>
                </span>
              )}
            </h1>
            {empty && <p className="hero-sub"><span>{all.length} проектов домов с планами от архитектора Алексея Колескова</span><span>Выберите условия, и дом дорисуется</span></p>}
          </div>
          <div className="hero-sketch"><p>Эскиз вашего запроса</p><HouseSketch q={q} bold /></div>
        </div>
      </div>

      <div className="bar">
        <div className="bar-in">
          <div className="bar-chips">
            {QUICK.map((c) => {
              const on = (q.sel[c.g] ?? []).includes(c.id);
              return <button key={c.g + c.id} className={`chip${on ? " on" : ""}`} aria-pressed={on} onClick={() => set(toggle(q, c.g, c.id))}>{c.label}</button>;
            })}
            <AreaSlider q={q} set={set} />
            <button className="chip chip-all" onClick={() => setPanel(true)}>
              <svg width="16" height="16" viewBox="0 0 16 16" aria-hidden="true"><path d="M1 4h9M13 4h2M1 12h2M6 12h9" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" /><circle cx="11.5" cy="4" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" /><circle cx="4.5" cy="12" r="1.8" fill="none" stroke="currentColor" strokeWidth="1.6" /></svg>
              Все условия{activeList(q).length ? ` · ${activeList(q).length}` : ""}
            </button>
          </div>
          <div className="bar-count">{found.length === all.length ? <><b><Count value={found.length} /></b> {plural(found.length)}</> : <><b><Count value={found.length} /></b> из {all.length}</>}</div>
          <div className="bar-tools">
            {!empty && <button className="link" onClick={() => set(EMPTY)}>Сбросить</button>}
            <ViewSwitch id="sw-bar" view={view} setView={setView} />
          </div>
        </div>
      </div>

      <main className="results">
        <div className="res-top">
          {empty && <p className="res-title">Все проекты мастерской</p>}
          {hints.length > 0 && found.length > 0 && (
            <div className="hints">
              {hints.map((h) => (
                <button key={h.a.group + h.a.id} className="hint" onClick={() => set(removeActive(q, h.a))}>
                  {relaxLabel(h.a)}: ещё <b className="nums">{h.count}</b>
                </button>
              ))}
            </div>
          )}
          <div className="res-tools">
            {!empty && <button className="link" onClick={() => set(EMPTY)}>Сбросить</button>}
            {found.length > 0 && (
              <SortMenu value={sort} options={SORTS} onChange={setSort} />
            )}
            <ViewSwitch id="sw-res" view={view} setView={setView} />
          </div>
        </div>

        {found.length > 0 ? (
          <div className="grid">
            <AnimatePresence mode="popLayout" initial={false}>
              {found.slice(0, limit).map((p, i) => <ProjectCard key={p.slug} p={p} view={view} index={i} />)}
            </AnimatePresence>
          </div>
        ) : (
          <section className="none night" aria-live="polite">
            <div className="none-copy">
              <h2>Такого дома в каталоге пока нет</h2>
              <p>Алексей Колесков проектирует дома и под запрос. Условия уже в заявке, осталось оставить телефон.</p>
              {hints.length > 0 && (
                <div className="hints">
                  {hints.map((h) => (
                    <button key={h.a.group + h.a.id} className="hint" onClick={() => set(removeActive(q, h.a))}>
                      {relaxLabel(h.a)}: <b className="nums">{h.count}</b> {plural(h.count)} <Arrow />
                    </button>
                  ))}
                </div>
              )}
            </div>
            <div className="none-form day" ref={formRef}>
              <Author />
              <p className="req">{text}</p>
              <LeadForm phrase={text} params={params} cta="Отправить запрос Алексею" />
            </div>
          </section>
        )}

        {found.length > limit && <button className="btn btn-ghost more" onClick={() => setLimit((l) => l + PAGE)}>Показать ещё {Math.min(PAGE, found.length - limit)} из {found.length - limit}</button>}

        {near.length > 0 && (
          <section className="near"><h2>Ближе всего к вашему запросу</h2>
            <div className="grid">{near.map(({ p, note }, i) => <ProjectCard key={p.slug} p={p} view={view} index={i} note={note} />)}</div>
          </section>
        )}
      </main>

      {found.length > 0 && (
        <section className="ask night">
          <div className="ask-in">
            <div>
              <h2>Не нашли свой дом?</h2>
              <p>{empty ? "Опишите, что ищете, и Алексей Колесков подскажет готовый проект или спроектирует новый." : <>Ваш запрос уже здесь: <b>{text.toLowerCase()}</b>. Алексей подскажет готовый проект или спроектирует новый.</>}</p>
              <Author />
            </div>
            <LeadForm phrase={empty ? "Без условий" : text} params={params} />
          </div>
        </section>
      )}

      <Foot />

      {!(found.length === 0 && formSeen) && (
        <div className="mob-bar">
          {found.length > 0
            ? <button className="btn btn-led" onClick={() => setPanel(true)}>Условия · {found.length} {plural(found.length)}</button>
            : <button className="btn btn-quiet" onClick={() => setPanel(true)}>Изменить условия</button>}
        </div>
      )}

      <FilterPanel open={panel} onClose={() => setPanel(false)} all={all} q={q} set={set} count={found.length} />
    </>
  );
}
