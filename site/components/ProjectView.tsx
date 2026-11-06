"use client";
import Link from "next/link";
import { Fragment, useEffect, useState } from "react";
import { MESSENGERS, PHONE } from "@/lib/contacts";
import type { Card } from "@/lib/data";
import { bedsWord, cardImg, fmt, fmtArea } from "@/lib/format";
import { getOverrides } from "@/lib/store";
import type { Project } from "@/lib/types";
import Author from "./Author";
import Foot from "./Foot";
import Header from "./Header";
import LeadForm from "./LeadForm";
import ProjectCard from "./ProjectCard";

export default function ProjectView({ p: base, similar }: { p: Project; similar: Card[] }) {
  const [p, setP] = useState(base);
  useEffect(() => { const o = getOverrides()[base.slug]; if (o) setP({ ...base, ...o }); }, [base]);
  const [opt, setOpt] = useState<"build" | "sketch">(base.price != null ? "build" : "sketch");
  const [plan, setPlan] = useState(0);
  const [more, setMore] = useState(false);
  const [shot, setShot] = useState(0);
  const [ordered, setOrdered] = useState(false);
  const plans = p.plans;
  const photos = [p.imgBig ?? p.img, ...(p.gallery ?? [])].filter(Boolean) as string[];
  const rows: [string, string][] = [];
  if (p.area != null) rows.push(["Общая площадь", `${fmtArea(p.area)} м²`]);
  if (p.areaGarage != null) rows.push(["Гараж", `${fmtArea(p.areaGarage)} м²`]);
  if (p.bedrooms) rows.push(["Спальни", String(p.bedrooms)]);
  for (const k of ["Количество жилых этажей", "Материал стен", "Толщина стен, мм.", "Фундамент", "Наличие подвала"]) if (p.specs[k]) rows.push([k.replace(", мм.", ", мм").replace("Количество жилых этажей", "Этажей").replace("Наличие подвала", "Подвал"), p.specs[k]]);
  if (p.floors != null && !p.specs["Количество жилых этажей"]) rows.push(["Этажей", String(p.floors)]);
  const heading = p.h1 ?? p.title;
  const sketchName = p.sketchLabel ?? "Эскизный проект";
  const optName = opt === "build" ? "Строительный проект" : sketchName;
  const optPrice = opt === "build" ? p.price : p.priceSketch;
  const choice = `${optName}, ${fmt(optPrice)}\u00a0BYN`;
  const facts = [
    p.floors === 1 ? "Одноэтажный дом" : p.floors === 2 ? "Двухэтажный дом" : null,
    p.area != null ? `${fmtArea(p.area)} м²` : null,
    p.bedrooms ? `${p.bedrooms} ${bedsWord(p.bedrooms)}` : null,
    p.tags.includes("garage") ? "гараж" : null,
    p.tags.includes("carport") ? "навес для машины" : null,
  ].filter(Boolean).join(", ");
  return (
    <div className="pp-top">
      <div className="hero night strip"><Header /></div>
      <nav className="crumbs" aria-label="Навигация"><Link href="/proekty">Проекты</Link><span>/</span><span>{p.title}</span></nav>
      <div className="pp">
        <div className="pp-head">
          <h1>{p.title}</h1>
          <p className="pp-sub">{heading !== p.title ? heading : facts}</p>
          {p.img && <div className="pp-photo"><img className="pp-thumb" src={cardImg(p.img)} alt="" aria-hidden="true" /><img key={photos[shot]} className="pp-full" src={photos[shot]} alt={`Фасад: ${p.title}`} decoding="async" /></div>}
          {photos.length > 1 && <div className="pp-shots">{photos.map((s, i) => <button key={s} type="button" aria-label={`Фото ${i + 1} из ${photos.length}`} aria-pressed={shot === i} className={shot === i ? "on" : ""} onClick={() => setShot(i)}><img src={s} alt="" /></button>)}</div>}
        </div>
        <aside className="pp-side">
          <div className="pp-box">
            <h2>Что заказать</h2>
            <div className="pp-price">
              {p.price != null && <button className={opt === "build" ? "on" : ""} aria-pressed={opt === "build"} onClick={() => setOpt("build")}><span>Строительный проект</span><b className="nums">{fmt(p.price)}{" "}BYN</b></button>}
              {p.priceSketch != null && <button className={opt === "sketch" ? "on" : ""} aria-pressed={opt === "sketch"} onClick={() => setOpt("sketch")}><span>{sketchName}</span><b className="nums">{fmt(p.priceSketch)}{" "}BYN</b></button>}
            </div>
            <a className="btn btn-led pp-order" href="#zayavka" onClick={() => setOrdered(true)}>Заказать проект {p.no}</a>
            <div className="msg">{MESSENGERS.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}</div>
            <p className="pp-build">Стройка: коробка от 250 USD/м², с сетями и отделкой ~600–900 USD/м². Каждый дом считается отдельно.</p>
          </div>
          {rows.length > 0 && <div className="pp-box"><dl className="spec">{rows.map(([k, v]) => <Fragment key={k}><dt>{k}</dt><dd>{v}</dd></Fragment>)}</dl></div>}
        </aside>
        <main className="pp-rest">
          {plans.length > 0 && (
            <section className="pp-sec">
              <h2>Планировка</h2>
              {plans.length > 1 && (
                <div className="plan-tools">
                  {plans.map((_, i) => <button key={i} className={`chip${plan === i ? " on" : ""}`} onClick={() => setPlan(i)}>{i === plans.length - 1 && p.hasMirror ? "Зеркальный вариант" : `План ${i + 1}`}</button>)}
                </div>
              )}
              <div className="plan-box"><img src={plans[plan]} alt={`План: ${p.title}`} loading="lazy" decoding="async" /></div>
            </section>
          )}
          {p.description && (
            <section className="pp-sec pp-about">
              <h2>О проекте</h2>
              <p className="pp-facts">{facts}</p>
              <p className={more ? "" : "clamp"}>{p.description}</p>
              {!more && <button className="link pp-more" onClick={() => setMore(true)}>Читать дальше</button>}
            </section>
          )}
        </main>
      </div>
      {similar.length > 0 && <section className="results"><h2 className="res-title" style={{ marginBottom: 14 }}>Похожие проекты</h2><div className="grid">{similar.map((c, i) => <ProjectCard key={c.slug} p={c} view="facade" index={i} />)}</div></section>}
      <section className="ask night" id="zayavka">
        <div className="ask-in">
          <div>
            <h2>{ordered ? `Заказать проект ${p.no}` : "Спросить про этот дом"}</h2>
            {ordered ? <p>Вы выбрали: <b>{choice}</b>. Перезвоним и уточним детали.</p> : <p>Подскажем, подходит ли {p.title.toLowerCase().replace("проект дома", "проект")} под ваш участок и что можно изменить.</p>}
            <Author />
          </div>
          <LeadForm phrase={`${p.title}, ${choice}`} params="" project={p.slug} cta="Отправить заявку" />
        </div>
      </section>
      <Foot />
      <div className="mob-bar two">
        <a className="btn btn-led" href="#zayavka" onClick={() => setOrdered(true)}>Заказать</a>
        <a className="btn btn-quiet" href={`tel:${PHONE.tel}`}>Позвонить</a>
      </div>
    </div>
  );
}
