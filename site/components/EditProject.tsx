"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Card } from "@/lib/data";
import { getCustom, getOverrides, setOverride, type Override } from "@/lib/store";
import PhotoField from "./PhotoField";

export default function EditProject({ card, slug }: { card: Card | null; slug?: string }) {
  const [cur, setCur] = useState<Card | null | undefined>(card ?? undefined);
  const [f, setF] = useState<Override>({}); const [saved, setSaved] = useState(false); const [err, setErr] = useState("");
  const [facades, setFacades] = useState<string[]>([]); const [plans, setPlans] = useState<string[]>([]);
  useEffect(() => {
    // Проект, добавленный в админке, живёт только в браузере, сервер о нём не знает
    const c = card ?? getCustom().find((x) => x.slug === slug) ?? null;
    setCur(c);
    if (!c) return;
    const o = getOverrides()[c.slug] ?? {}; const m = { ...c, ...o };
    setF({ price: c.price ?? undefined, priceSketch: c.priceSketch ?? undefined, area: c.area ?? undefined, bedrooms: c.bedrooms ?? undefined, floors: c.floors ?? undefined, ...o });
    setFacades([m.imgBig ?? m.img, ...(m.gallery ?? [])].filter(Boolean) as string[]);
    setPlans(m.plans);
  }, [card, slug]);
  if (cur === undefined) return null;
  if (!cur) return <><h1>Проект не найден</h1><p><Link href="/admin/proekty">К списку проектов</Link></p></>;
  const base = cur;
  const touch = () => { setSaved(false); setErr(""); };
  const num = (k: keyof Override) => ({ value: (f[k] as number | undefined) ?? "", onChange: (e: React.ChangeEvent<HTMLInputElement>) => { touch(); setF({ ...f, [k]: e.target.value === "" ? undefined : Number(e.target.value) }); } });
  return (
    <>
      <p><Link href="/admin/proekty">Все проекты</Link></p>
      <h1>{base.title}</h1>
      <p className="ad-lead">Обычная форма: поля, фото, кнопка «Сохранить». Никакого кода.</p>
      <form className="form" onSubmit={(e) => {
        e.preventDefault();
        if (!facades.length) { setErr("Нужно хотя бы одно фото фасада"); return; }
        const original = facades[0] === (base.imgBig ?? base.img); // исходное главное фото сохраняет свою лёгкую копию для карточки
        const samePlans = JSON.stringify(plans) === JSON.stringify(base.plans);
        const photos: Override = { img: original && base.img ? base.img : facades[0], imgBig: original ? base.imgBig ?? null : null, gallery: facades.slice(1), plans, plan: plans[0] ?? null, hasMirror: samePlans && !!base.hasMirror };
        try { setOverride(base.slug, { ...f, ...photos }); setSaved(true); } catch { setErr("Хранилище прототипа заполнено: уберите часть фото или очистите пробные записи"); }
      }}>
        <label>Цена строительного проекта, BYN<input type="number" {...num("price")} /></label>
        <label>Цена эскизного проекта, BYN<input type="number" {...num("priceSketch")} /></label>
        <label>Общая площадь, м²<input type="number" step="0.1" {...num("area")} /></label>
        <label>Спален<input type="number" {...num("bedrooms")} /></label>
        <label>Этажей<select value={f.floors ?? ""} onChange={(e) => { touch(); setF({ ...f, floors: Number(e.target.value) as 1 | 2 }); }}><option value="">Не указано</option><option value="1">1</option><option value="2">2</option></select></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "end" }}><input type="checkbox" checked={!!f.hidden} onChange={(e) => { touch(); setF({ ...f, hidden: e.target.checked }); }} /> Скрыть с сайта</label>
        <PhotoField label="Фото фасада" hint="Можно сразу несколько. Первое станет главным на карточке." value={facades} onChange={(v) => { touch(); setFacades(v); }} main />
        <PhotoField label="План" hint="Если этажей два, добавьте оба плана. Первый покажется в режиме План." value={plans} onChange={(v) => { touch(); setPlans(v); }} />
        {err && <p className="wide" role="alert" style={{ color: "#8A2E12" }}>{err}</p>}
        <div className="wide" style={{ display: "flex", gap: 14, alignItems: "center", flexWrap: "wrap" }}>
          <button className="btn btn-led" type="submit">Сохранить</button>
          {saved && <span className="saved" role="status">Сохранено. <Link href={`/${base.slug}`}>Посмотреть на сайте</Link></span>}
        </div>
      </form>
    </>
  );
}
