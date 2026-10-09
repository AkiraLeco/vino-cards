import CardItem from "@/components/CardItem";
import Filters from "@/components/Filters";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<SP>;
}) {
  const sp = await searchParams;
  const supabase = await createClient();

  let query = supabase.from("cards").select("*");
  if (sp.all !== "1") query = query.eq("status", "available").gt("quantity", 0);
  if (sp.q) query = query.ilike("name", `%${sp.q}%`);
  if (sp.set) query = query.eq("set_name", sp.set);
  if (sp.rarity) query = query.eq("rarity", sp.rarity);
  if (sp.cond) query = query.eq("condition", sp.cond);
  if (sp.lang) query = query.eq("language", sp.lang);
  if (sp.min) query = query.gte("price", Number(sp.min));
  if (sp.max) query = query.lte("price", Number(sp.max));
  query =
    sp.sort === "price_asc"
      ? query.order("price", { ascending: true })
      : sp.sort === "price_desc"
        ? query.order("price", { ascending: false })
        : sp.sort === "name"
          ? query.order("name", { ascending: true })
          : query.order("featured", { ascending: false }).order("created_at", { ascending: false });

  const [{ data, error }, { data: meta }] = await Promise.all([
    query,
    supabase.from("cards").select("set_name, rarity"),
  ]);

  const cards = (data ?? []) as Card[];
  const uniq = (k: "set_name" | "rarity") =>
    [...new Set((meta ?? []).map((m) => m[k]).filter(Boolean))].sort() as string[];

  return (
    <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
      <aside>
        <Filters opts={{ sets: uniq("set_name"), rarities: uniq("rarity") }} values={sp} />
      </aside>
      <section>
        <div className="mb-4 flex items-baseline justify-between">
          <h1 className="text-2xl font-extrabold">Cartas disponíveis</h1>
          <span className="text-sm text-white/60">{cards.length} resultado(s)</span>
        </div>
        {error && (
          <p className="rounded-lg bg-red-500/20 p-3 text-sm">
            Erro ao carregar cartas. Verifique a configuração do Supabase (.env.local).
          </p>
        )}
        {cards.length === 0 && !error && (
          <p className="text-white/60">Nenhuma carta encontrada.</p>
        )}
        <div className="grid grid-cols-2 gap-4 md:grid-cols-3 xl:grid-cols-4">
          {cards.map((c) => (
            <CardItem key={c.id} card={c} />
          ))}
        </div>
      </section>
    </div>
  );
}
