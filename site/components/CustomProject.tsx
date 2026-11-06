"use client";
import Link from "next/link";
import { useEffect, useState } from "react";
import type { Project } from "@/lib/types";
import { getCustom } from "@/lib/store";
import Header from "./Header";
import ProjectView from "./ProjectView";

/** Проект, добавленный в админке прототипа, живёт только в этом браузере */
export default function CustomProject({ slug }: { slug: string }) {
  const [p, setP] = useState<Project | null | undefined>(undefined);
  useEffect(() => {
    const c = getCustom().find((x) => x.slug === slug);
    setP(c ? ({ ...c, description: null, specs: {}, review: null, gallery: c.gallery ?? [] } as unknown as Project) : null);
  }, [slug]);
  if (p) return <ProjectView p={p} similar={[]} />;
  if (p === undefined) return null;
  return <><div className="hero night strip"><Header /></div><main className="results"><h1>Такой страницы нет</h1><p style={{ margin: "12px 0" }}>Возможно, проект переехал.</p><Link className="btn btn-led" href="/proekty">В каталог</Link></main></>;
}
