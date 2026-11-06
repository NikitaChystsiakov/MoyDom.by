import raw from "@/data/projects.json";
import type { Project } from "./types";

export const PROJECTS = raw as unknown as Project[];
export const bySlug = (slug: string) => PROJECTS.find((p) => p.slug === slug);

/** Для каталога достаточно этих полей, описание и таблица не уходят в браузер */
export type Card = Omit<Project, "description" | "specs" | "review" | "gallery"> & { plan: string | null; gallery?: string[] };
export const toCard = (p: Project): Card => {
  const { description: _d, specs: _s, review: _r, gallery: _g, ...rest } = p;
  return { ...rest, plan: p.plans[0] ?? null };
};
export const CARDS: Card[] = PROJECTS.map(toCard);

