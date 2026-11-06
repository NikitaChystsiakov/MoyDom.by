"use client";
import { useRef, useState, type DragEvent } from "react";

/** Фото уменьшается в браузере, чтобы влезть в хранилище прототипа. На настоящем сайте файлы лягут на сервер. */
function shrink(file: File): Promise<string> {
  return new Promise((res, rej) => {
    const url = URL.createObjectURL(file);
    const img = new Image();
    img.onload = () => {
      const k = Math.min(1, 1200 / img.width); const c = document.createElement("canvas");
      c.width = Math.round(img.width * k); c.height = Math.round(img.height * k);
      const g = c.getContext("2d")!;
      g.fillStyle = "#fff"; g.fillRect(0, 0, c.width, c.height); // у планов в PNG бывает прозрачный фон
      g.drawImage(img, 0, 0, c.width, c.height);
      URL.revokeObjectURL(url);
      res(c.toDataURL("image/jpeg", 0.78));
    };
    img.onerror = () => { URL.revokeObjectURL(url); rej(new Error(file.name)); };
    img.src = url;
  });
}

export default function PhotoField({ label, hint, value, onChange, main = false }: { label: string; hint: string; value: string[]; onChange: (v: string[]) => void; main?: boolean }) {
  const [over, setOver] = useState(false); const [busy, setBusy] = useState(false); const [err, setErr] = useState("");
  const input = useRef<HTMLInputElement>(null);
  const add = async (files: File[]) => {
    const list = files.filter((f) => f.type.startsWith("image/"));
    if (!list.length) { setErr("Выберите файлы с фото"); return; }
    setBusy(true); setErr("");
    const done = await Promise.allSettled(list.map(shrink));
    const ok = done.flatMap((r) => (r.status === "fulfilled" ? [r.value] : []));
    const bad = done.length - ok.length;
    if (bad) setErr(bad === 1 ? "Одно фото не прочиталось, попробуйте JPG или PNG" : `Не прочиталось фото: ${bad}, попробуйте JPG или PNG`);
    onChange([...new Set([...value, ...ok])]);
    setBusy(false);
  };
  const drop = (e: DragEvent) => { e.preventDefault(); setOver(false); add([...e.dataTransfer.files]); };
  return (
    <div className="wide up">
      <span className="up-title">{label}. {hint}</span>
      <div className="up-grid">
        {value.map((s, i) => (
          <div key={s} className={`up-item${main ? "" : " plan"}`}>
            <img src={s} alt={`${label}, файл ${i + 1}`} />
            {main && i === 0 && <span className="up-tag">Главное</span>}
            <button type="button" className="up-x" aria-label={`Убрать файл ${i + 1}`} onClick={() => onChange(value.filter((x) => x !== s))}>
              <svg width="12" height="12" viewBox="0 0 12 12" aria-hidden="true"><path d="m2 2 8 8M10 2l-8 8" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
            </button>
            {main && i > 0 && <button type="button" className="up-main" onClick={() => onChange([s, ...value.filter((x) => x !== s)])}>Сделать главным</button>}
          </div>
        ))}
        <label className={`up-add${over ? " over" : ""}`} onDragOver={(e) => { e.preventDefault(); setOver(true); }} onDragLeave={() => setOver(false)} onDrop={drop}>
          <svg width="20" height="20" viewBox="0 0 20 20" aria-hidden="true"><path d="M10 4v12M4 10h12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" /></svg>
          {busy ? "Готовлю фото" : value.length ? "Добавить ещё" : "Выбрать или перетащить"}
          <input ref={input} type="file" accept="image/*" multiple aria-label={label} onChange={(e) => { add([...(e.target.files ?? [])]); if (input.current) input.current.value = ""; }} />
        </label>
      </div>
      {err && <p role="alert" style={{ color: "#8A2E12" }}>{err}</p>}
    </div>
  );
}
