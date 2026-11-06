"use client";
import { AnimatePresence, motion, useReducedMotion } from "motion/react";
import Link from "next/link";
import { useState } from "react";
import { addLead } from "@/lib/store";

const CONTACT = ["Звонок", "Viber", "WhatsApp", "Telegram"];
const PLOT = ["Есть", "Выбираю", "Пока нет"];
const START = ["До 3 месяцев", "В течение года", "Присматриваюсь"];

function Pick({ label, options, value, onChange }: { label: string; options: string[]; value: string; onChange: (v: string) => void }) {
  return (
    <div className="lead-wide lead-pick" role="radiogroup" aria-label={label}>
      <span>{label}</span>
      <div>
        {options.map((o) => <button key={o} type="button" role="radio" aria-checked={value === o} className={`chip${value === o ? " on" : ""}`} onClick={() => onChange(value === o ? "" : o)}>{o}</button>)}
      </div>
    </div>
  );
}

export default function LeadForm({ phrase, params, project, cta = "Отправить заявку" }: { phrase: string; params: string; project?: string; cta?: string }) {
  const [name, setName] = useState(""); const [phone, setPhone] = useState(""); const [comment, setComment] = useState("");
  const [contact, setContact] = useState(""); const [plot, setPlot] = useState(""); const [place, setPlace] = useState(""); const [size, setSize] = useState(""); const [start, setStart] = useState("");
  const [err, setErr] = useState(""); const [sent, setSent] = useState(false);
  const reduce = useReducedMotion();
  if (sent) return (
    <div className="lead-done" role="status">
      <h3>Заявка отправлена</h3>
      <p>Мы получили ваш запрос вместе с параметрами и перезвоним.</p>
      <Link className="btn btn-ghost" href="/admin">Открыть админ-панель</Link>
    </div>
  );
  return (
    <form className="lead" noValidate onSubmit={(e) => {
      e.preventDefault();
      if (phone.replace(/\D/g, "").length < 7) { setErr("Укажите телефон, чтобы мы могли перезвонить"); return; }
      addLead({ name, phone, comment, phrase, params, project, contact, plot, place: plot === "Есть" ? place : "", size: plot === "Есть" ? size : "", start }); setSent(true);
    }}>
      <label>Как к вам обращаться<input value={name} onChange={(e) => setName(e.target.value)} autoComplete="name" /></label>
      <label>Телефон<input value={phone} onChange={(e) => { setPhone(e.target.value); setErr(""); }} inputMode="tel" autoComplete="tel" placeholder="+375" aria-invalid={!!err} required /></label>
      <Pick label="Как удобнее связаться" options={CONTACT} value={contact} onChange={setContact} />
      <Pick label="Участок" options={PLOT} value={plot} onChange={setPlot} />
      <AnimatePresence initial={false}>
        {plot === "Есть" && (
          <motion.div className="lead-wide lead-plot" initial={reduce ? false : { height: 0, opacity: 0 }} animate={{ height: "auto", opacity: 1 }} exit={reduce ? undefined : { height: 0, opacity: 0 }} transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}>
            <div>
              <label>Где находится<input value={place} onChange={(e) => setPlace(e.target.value)} placeholder="Город или район" /></label>
              <label>Площадь, соток<input value={size} onChange={(e) => setSize(e.target.value)} inputMode="decimal" /></label>
            </div>
          </motion.div>
        )}
      </AnimatePresence>
      <Pick label="Когда хотите начать" options={START} value={start} onChange={setStart} />
      <label className="lead-wide">Что ещё важно<textarea rows={2} value={comment} onChange={(e) => setComment(e.target.value)} placeholder={project ? "Что изменить в проекте, бюджет" : "Бюджет, состав семьи, пожелания"} /></label>
      {err && <p className="err lead-wide" role="alert">{err}</p>}
      <button className="btn btn-led lead-wide" type="submit">{cta}</button>
      <p className="lead-note lead-wide">Обязателен только телефон. Остальное поможет нам подготовиться к разговору.</p>
    </form>
  );
}
