import CustomProject from "@/components/CustomProject";
import type { Metadata } from "next";
import Catalog from "@/components/Catalog";
import ProjectView from "@/components/ProjectView";
import { CARDS, PROJECTS, bySlug, toCard } from "@/lib/data";
import { OLD_SECTIONS } from "@/lib/filters";

type P = { params: Promise<{ slug: string[] }> };

export function generateStaticParams() {
  const pr = PROJECTS.map((p) => ({ slug: p.slug.split("/").slice(1) }));
  const sec = Object.keys(OLD_SECTIONS).map((s) => ({ slug: [s] }));
  return [...pr, ...sec];
}

export async function generateMetadata({ params }: P): Promise<Metadata> {
  const { slug } = await params;
  const p = bySlug(["proekty", ...slug].join("/"));
  if (p) return { title: `${p.title}: МойДом.BY` };
  const s = OLD_SECTIONS[slug[0]];
  return s ? { title: `${s.title}: МойДом.BY` } : {};
}

export default async function Page({ params }: P) {
  const { slug } = await params;
  const p = bySlug(["proekty", ...slug].join("/"));
  if (p) {
    const near = PROJECTS.filter((x) => x.slug !== p.slug && x.kind === p.kind && x.floors === p.floors && x.area && p.area && Math.abs(x.area - p.area) < 40).slice(0, 4).map(toCard);
    return <ProjectView p={p} similar={near} />;
  }
  const s = slug.length === 1 ? OLD_SECTIONS[slug[0]] : undefined;
  if (s) return <Catalog cards={CARDS} preset={s.q} title={s.title} />;
  return <CustomProject slug={["proekty", ...slug].join("/")} />;
}
