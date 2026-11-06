import Link from "next/link";
import { EMAIL, MESSENGERS, PHONE, PHONE2 } from "@/lib/contacts";

export default function Foot() {
  return (
    <>
      <footer className="foot night">
        <div><b>МойДом.BY</b> Международная архитектурная мастерская. Минск, ул. Лили Карастояновой, 32, этаж 2, офис 223</div>
        <div className="foot-r">
          <a href={`tel:${PHONE.tel}`}>{PHONE.text}</a><a href={`tel:${PHONE2.tel}`}>{PHONE2.text}</a>
          {MESSENGERS.map((m) => <a key={m.label} href={m.href}>{m.label}</a>)}
          <a href={`mailto:${EMAIL}`}>{EMAIL}</a>
        </div>
      </footer>
      <Link className="demo-tag" href="/admin">Админ-панель</Link>
    </>
  );
}
