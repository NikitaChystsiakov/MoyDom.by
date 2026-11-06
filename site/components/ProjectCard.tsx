"use client";
import Link from "next/link";
import { motion, useReducedMotion } from "motion/react";
import { memo } from "react";
import type { Card } from "@/lib/data";
import { bedsWord, cardImg, cardPlan, fmt, fmtArea } from "@/lib/format";

const ease = [0.16, 1, 0.3, 1] as const;
const LIVE = 12; // ниже двух экранов карточек никто не видит, анимировать их незачем

function ProjectCard({ p, view, index, note }: { p: Card; view: "facade" | "plan"; index: number; note?: string }) {
  const reduce = useReducedMotion();
  const planOn = view === "plan" && !!p.plan;
  const facts = [
    p.floors ? `${p.floors} ${p.floors === 1 ? "этаж" : "этажа"}` : null,
    p.bedrooms ? `${p.bedrooms} ${bedsWord(p.bedrooms)}` : null,
    p.tags.includes("garage") ? (p.areaGarage ? `гараж ${fmtArea(p.areaGarage)}\u00a0м²` : "гараж") : null,
    p.tags.includes("carport") ? "навес" : null,
    [["blocks", "блоки"], ["wood", "дерево"], ["frame", "каркас"]].filter(([t]) => p.tags.includes(t)).map(([, w]) => w).join(" или ") || null,
  ].filter(Boolean);
  return (
    <motion.article className="card" layout={reduce || index >= LIVE ? false : "position"}
      initial={{ opacity: 0, scale: 0.97 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.97, transition: { duration: 0.16 } }}
      transition={{ duration: 0.38, ease }}>
      <Link href={`/${p.slug}`} className="card-link">
        <div className="card-img">
          {p.img && <img src={cardImg(p.img)} alt={`Фасад: ${p.title}`} width={720} height={504} loading={index < 8 ? "eager" : "lazy"} decoding="async" />}
          {planOn && (p.floors ?? 1) >= 2 && <span className="flag">1 этаж из {p.floors}</span>}
          {view === "plan" && !p.plan && <span className="flag">плана пока нет</span>}
          {p.plan && (
            <motion.div className="card-plan" aria-hidden={!planOn} initial={false}
              animate={{ clipPath: planOn ? "inset(0 0 0% 0)" : "inset(0 0 100% 0)" }}
              transition={{ duration: reduce || index >= LIVE ? 0 : 0.5, delay: reduce || index >= LIVE ? 0 : index * 0.035, ease }}>
              {planOn && <img src={cardPlan(p.plan)} alt={`План: ${p.title}`} decoding="async" />}
            </motion.div>
          )}
        </div>
        <div className="card-body">
          <div className="card-head">
            <h3>{p.kind === "series" ? `Серия ${p.no}` : p.no}</h3>
            {p.area != null && <span className="card-area nums">{fmtArea(p.area)}{"\u00a0"}м²</span>}
          </div>
          <i className="dim" aria-hidden="true" />
          <p className="card-facts">{facts.join(" · ") || p.title}</p>
          {p.price != null && <p className="card-price nums"><span>проект</span> {fmt(p.price)}{"\u00a0"}BYN</p>}
          {note && <p className="card-note">{note}</p>}
        </div>
      </Link>
    </motion.article>
  );
}

/* Карточка с прежним местом и данными не перерисовывается при каждом клике по фильтру */
export default memo(ProjectCard);
