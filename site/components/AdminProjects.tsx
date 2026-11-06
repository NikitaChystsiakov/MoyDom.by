"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/data";
import { fmt, fmtArea } from "@/lib/format";
import { getCustom, getOverrides, type Override } from "@/lib/store";

export default function AdminProjects({ all }: { all: Card[] }) {
  const [t, setT] = useState(""); const [o, setO] = useState<Record<string, Override>>({}); const [c, setC] = useState<Card[]>([]);
  useEffect(() => { setO(getOverrides()); setC(getCustom()); }, []);
  const list = useMemo(() => {
    const m = [...c, ...all].map((p) => ({ ...p, ...o[p.slug] }));
    const s = t.trim().toLowerCase();
    return s ? m.filter((p) => p.no.toLowerCase().includes(s) || p.title.toLowerCase().includes(s)) : m;
  }, [all, c, o, t]);
  return (
    <>
      <h1>Проекты</h1>
      <p className="ad-lead">Все {all.length} проектов уже здесь, вручную ничего набирать не пришлось. Измените цену любого проекта, и она сразу поменяется в каталоге.</p>
      <div style={{ display: "flex", justifyContent: "space-between", gap: 12, marginBottom: 14, flexWrap: "wrap" }}>
        <input className="ad-search" value={t} onChange={(e) => setT(e.target.value)} placeholder="Номер проекта" aria-label="Поиск по номеру" />
        <Link className="btn btn-led" href="/admin/proekty/new">Добавить проект</Link>
      </div>
      <table className="tbl tbl-p"><thead><tr><th></th><th>Проект</th><th>Площадь</th><th className="hide-s">Этажей</th><th>Цена</th><th></th></tr></thead>
        <tbody>{list.slice(0, 40).map((p) => (
          <tr key={p.slug} style={{ opacity: (p as Override).hidden ? 0.5 : 1 }}>
            <td>{p.img && <img className="ad-photo" src={p.img} alt="" loading="lazy" />}</td>
            <td>{p.title}</td><td className="nums">{p.area ? `${fmtArea(p.area)} м²` : "нет данных"}</td><td className="hide-s nums">{p.floors ?? ""}</td><td className="nums">{p.price ? `${fmt(p.price)} BYN` : ""}</td>
            <td><Link href={`/admin/proekty/edit?slug=${encodeURIComponent(p.slug)}`}>Изменить</Link></td>
          </tr>))}</tbody></table>
      {list.length > 40 && <p style={{ marginTop: 10, color: "var(--ink2)" }}>Показаны первые 40 из {list.length}. Найдите нужный по номеру.</p>}
    </>
  );
}
