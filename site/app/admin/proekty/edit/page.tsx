import EditProject from "@/components/EditProject";
import { CARDS } from "@/lib/data";
export default async function Page({ searchParams }: { searchParams: Promise<{ slug?: string }> }) {
  const { slug } = await searchParams;
  return <EditProject card={CARDS.find((c) => c.slug === slug) ?? null} slug={slug} />;
}
