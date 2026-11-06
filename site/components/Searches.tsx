"use client";
import Link from "next/link";
import { useEffect, useMemo, useState } from "react";
import type { Card } from "@/lib/data";
import { fromParams, toParams } from "@/lib/filters";
import { findGaps } from "@/lib/gaps";
import { getLeads, getSearches, leadDetails, resetDemo, withLocal, type Lead, type SearchEvent } from "@/lib/store";
import HouseSketch from "./HouseSketch";

const when = (t: number) => new Date(t).toLocaleString("ru-RU", { day: "numeric", month: "long", hour: "2-digit", minute: "2-digit" });
const word = (n: number) => { const a = n % 10, b = n % 100; return a === 1 && b !== 11 ? "сочетание, которого" : a >= 2 && a <= 4 && (b < 12 || b > 14) ? "сочетания, которых" : "сочетаний, которых"; };

export default function Searches({ all: base }: { all: Card[] }) {
  const [all, setAll] = useState(base);
  const [s, setS] = useState<SearchEvent[]>([]); const [l, setL] = useState<Lead[]>([]);
  useEffect(() => { setS(getSearches()); setL(getLeads()); setAll(withLocal(base)); }, [base]);
  const gaps = useMemo(() => findGaps(all), [all]);
  const none = s.filter((x) => x.count === 0).length;
  const firstGap = gaps[0] ? `/proekty?${toParams(gaps[0].q)}` : "/proekty";

  const leads = (
    <section className="ad-sec">
      <h2>Заявки с параметрами</h2>
      <table className="tbl"><thead><tr><th></th><th>Кто искал</th><th>Что искал</th><th className="hide-s">Комментарий</th><th className="hide-s">Когда</th></tr></thead>
        <tbody>{l.map((x) => (
          <tr key={x.id}>
            <td className="gap-s"><HouseSketch q={fromParams(new URLSearchParams(x.params))} compact /></td>
            <td>{x.name || "Без имени"}<br /><a href={`tel:${x.phone}`}>{x.phone}</a></td>
            <td>{x.phrase}{leadDetails(x) && <small className="lead-more">{leadDetails(x)}</small>}{x.project && <><br /><Link href={`/${x.project}`}>Открыть проект</Link></>}</td>
            <td className="hide-s">{x.comment}</td><td className="hide-s">{when(x.at)}</td>
          </tr>))}</tbody></table>
    </section>
  );
  const emptyGaps = (
    <section className="ad-sec">
      <h2>{gaps.length} {word(gaps.length)} нет в каталоге</h2>
      <p>Это уже настоящие данные: посчитано по вашим {all.length} проектам. По отдельности такие дома есть, а вместе ни одного.</p>
      <table className="tbl"><thead><tr><th>Сочетание</th><th>Есть, если площадь больше</th><th></th></tr></thead>
        <tbody>{gaps.map((g) => (
          <tr key={toParams(g.q)}><td>{g.text}</td><td className="nums">{g.loose}</td><td><Link href={`/proekty?${toParams(g.q)}`}>Открыть</Link></td></tr>
        ))}</tbody></table>
    </section>
  );
  return (
    <>
      <h1>Что искали</h1>
      <p className="ad-lead">Сейчас здесь только ваши пробы, после запуска будут все посетители.</p>
      {l.length > 0 ? <>{leads}{emptyGaps}</> : <>{emptyGaps}<p className="ad-line">Заявок пока нет. <Link href={firstGap}>Откройте запрос, по которому нет домов</Link>, и оставьте заявку.</p></>}
      {s.length === 0 ? <p className="ad-line">Поисков пока нет. <Link href="/proekty">Откройте каталог</Link>, выберите условия и вернитесь сюда.</p> : (
        <section className="ad-sec">
          <h2>Поиски в каталоге</h2>
          <p>Запросов: {s.length}, из них без единого проекта: {none}.</p>
          <table className="tbl"><thead><tr><th>Запрос</th><th>Нашлось</th><th className="hide-s">Когда</th><th></th></tr></thead>
            <tbody>{s.slice(0, 20).map((x) => (
              <tr key={x.id}><td>{x.phrase}</td><td><span className={x.count === 0 ? "zero nums" : "nums"}>{x.count}</span></td><td className="hide-s">{when(x.at)}</td><td><Link href={`/proekty?${x.params}`}>Открыть</Link></td></tr>
            ))}</tbody></table>
        </section>
      )}
      <p style={{ marginTop: 28 }}><button className="link" style={{ color: "var(--ink2)" }} onClick={() => { resetDemo(); location.reload(); }}>Очистить мои пробные записи</button></p>
    </>
  );
}
