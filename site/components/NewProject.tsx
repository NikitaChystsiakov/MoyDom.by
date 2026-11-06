"use client";
import { useRouter } from "next/navigation";
import { useState } from "react";
import type { Card } from "@/lib/data";
import { addCustom } from "@/lib/store";
import PhotoField from "./PhotoField";

export default function NewProject() {
  const r = useRouter();
  const [no, setNo] = useState(""); const [area, setArea] = useState(""); const [beds, setBeds] = useState(""); const [floors, setFloors] = useState("1"); const [price, setPrice] = useState("");
  const [garage, setGarage] = useState(false); const [facades, setFacades] = useState<string[]>([]); const [plans, setPlans] = useState<string[]>([]); const [err, setErr] = useState("");
  return (
    <>
      <h1>Новый проект</h1>
      <p className="ad-lead">Заполните поля и сохраните: проект сразу появится в каталоге и начнёт находиться фильтрами.</p>
      <form className="form" onSubmit={(e) => {
        e.preventDefault();
        if (!no.trim() || !facades.length) { setErr("Нужны номер проекта и хотя бы одно фото фасада"); return; }
        const c: Card = { slug: `proekty/novyi-${no.trim().toLowerCase().replace(/[^a-z0-9а-я]+/g, "-")}`, no: no.trim(), title: `Проект дома ${no.trim()}`, kind: "house", area: Number(area) || null, areaGarage: null, bedrooms: Number(beds) || null, floors: Number(floors) as 1 | 2, price: Number(price) || null, priceSketch: null, img: facades[0], gallery: facades.slice(1), plans, tags: garage ? ["garage"] : [], size: null, plan: plans[0] ?? null };
        try { addCustom(c); r.push("/proekty"); } catch { setErr("Хранилище прототипа заполнено: уберите часть фото или очистите пробные записи"); }
      }}>
        <label>Номер проекта<input value={no} onChange={(e) => setNo(e.target.value)} placeholder="1245" /></label>
        <label>Общая площадь, м²<input type="number" step="0.1" value={area} onChange={(e) => setArea(e.target.value)} /></label>
        <label>Спален<input type="number" value={beds} onChange={(e) => setBeds(e.target.value)} /></label>
        <label>Этажей<select value={floors} onChange={(e) => setFloors(e.target.value)}><option value="1">1</option><option value="2">2</option></select></label>
        <label>Цена строительного проекта, BYN<input type="number" value={price} onChange={(e) => setPrice(e.target.value)} /></label>
        <label style={{ display: "flex", alignItems: "center", gap: 8, alignSelf: "end" }}><input type="checkbox" checked={garage} onChange={(e) => setGarage(e.target.checked)} /> Есть гараж</label>
        <PhotoField label="Фото фасада" hint="Можно сразу несколько. Первое станет главным на карточке." value={facades} onChange={(v) => { setFacades(v); setErr(""); }} main />
        <PhotoField label="План" hint="Если этажей два, добавьте оба плана. Первый покажется в режиме План." value={plans} onChange={setPlans} />
        {err && <p className="wide" role="alert" style={{ color: "#8A2E12" }}>{err}</p>}
        <div className="wide"><button className="btn btn-led" type="submit">Добавить в каталог</button></div>
      </form>
    </>
  );
}
