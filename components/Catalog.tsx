import Link from "next/link";
import CardItem from "@/components/CardItem";
import Filters, { type FilterMode } from "@/components/Filters";
import { createClient } from "@/lib/supabase/server";
import type { Card, Category, Game } from "@/lib/types";

export type SP = Record<string, string | undefined>;

export default async function Catalog({
  title,
  basePath,
  sp,
  game,
  category,
  mode,
}: {
  title: string;
  basePath: string;
  sp: SP;
  game?: Game;
  category?: Category;
  mode: FilterMode;
}) {
  const supabase = await createClient();

  const per = [30, 60, 90].includes(Number(sp.per)) ? Number(sp.per) : 30;
  const page = Math.max(1, Number(sp.page) || 1);
  const hideSold = !sp.f || sp.stock === "1";

  let query = supabase.from("cards").select("*", { count: "exact" });
  if (game) query = query.eq("game", game);
  if (category) query = query.eq("category", category);
  if (hideSold) query = query.in("status", ["available", "reserved"]);
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
  query = query.range((page - 1) * per, page * per - 1);

  let metaQuery = supabase.from("cards").select("set_name, rarity");
  if (game) metaQuery = metaQuery.eq("game", game);
  if (category) metaQuery = metaQuery.eq("category", category);

  const [{ data, error, count }, { data: meta }] = await Promise.all([query, metaQuery]);

  const cards = (data ?? []) as Card[];
  const total = count ?? 0;
  const pages = Math.max(1, Math.ceil(total / per));
  const from = total === 0 ? 0 : (page - 1) * per + 1;
  const to = Math.min(total, page * per);
  const uniq = (k: "set_name" | "rarity") =>
    [...new Set((meta ?? []).map((m) => m[k]).filter(Boolean))].sort() as string[];

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  return (
    <div className="mx-auto max-w-[1400px]">
      <h1 className="mb-3 text-2xl font-extrabold">{title}</h1>
      <Filters
        opts={{ sets: uniq("set_name"), rarities: uniq("rarity") }}
        values={sp}
        action={basePath}
        mode={mode}
      />

      <div className="mt-4 flex flex-wrap items-center justify-between gap-2 border-b border-dotted border-teal-600/50 pb-2 text-base sm:text-lg">
        <span>
          {from}-{to} de <b>{total.toLocaleString("en-US")}</b>
        </span>
        {pages > 1 && (
          <span className="flex items-center gap-3 text-base">
            Páginas:
            {Array.from({ length: pages }, (_, i) => i + 1)
              .slice(Math.max(0, page - 3), page + 2)
              .map((p) =>
                p === page ? (
                  <b key={p}>{p}</b>
                ) : (
                  <Link key={p} href={pageHref(p)} className="hover:text-violet-700">
                    {p}
                  </Link>
                ),
              )}
            {page < pages && (
              <>
                <Link href={pageHref(page + 1)}>&gt;</Link>
                <Link href={pageHref(pages)}>&raquo;</Link>
              </>
            )}
          </span>
        )}
      </div>

      {error && (
        <p className="mt-4 rounded-lg bg-red-100 p-3 text-sm text-red-800">
          Erro ao carregar os itens. Se você acabou de atualizar o site, confirme que o SQL de
          migração foi executado no Supabase.
        </p>
      )}
      {cards.length === 0 && !error && (
        <p className="py-10 text-center text-black/60">Nenhum item encontrado.</p>
      )}
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-3 lg:grid-cols-4 xl:grid-cols-5">
        {cards.map((c) => (
          <CardItem key={c.id} card={c} />
        ))}
      </div>
    </div>
  );
}
