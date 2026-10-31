import { unstable_cache } from "next/cache";
import { getSetDates, sortByRelease } from "@/lib/setdates";
import { createPublicClient } from "@/lib/supabase/public";
import type { Card, Category, Game } from "@/lib/types";

export interface CatalogQuery {
  game?: Game;
  category?: Category;
  hideSold: boolean;
  q?: string;
  set?: string;
  rarity?: string;
  cond?: string;
  lang?: string;
  min: number | null;
  max: number | null;
  sort?: string;
  page: number;
  per: number;
}

/** Só as colunas que o card da listagem usa (a página do item busca o registro completo). */
const LIST_COLUMNS =
  "id, game, category, name, set_name, number, condition, is_foil, price, ref_price, quantity, status, photo_urls, image_api_url";

async function runCatalog(p: CatalogQuery) {
  let query = createPublicClient().from("cards").select(LIST_COLUMNS, { count: "exact" });
  if (p.game) query = query.eq("game", p.game);
  if (p.category) query = query.eq("category", p.category);
  if (p.hideSold) query = query.in("status", ["available", "reserved"]);
  if (p.q) query = query.ilike("name", `%${p.q}%`);
  if (p.set) query = query.eq("set_name", p.set);
  if (p.rarity) query = query.eq("rarity", p.rarity);
  if (p.cond) query = query.eq("condition", p.cond);
  if (p.lang) query = query.eq("language", p.lang);
  if (p.min !== null) query = query.gte("price", p.min);
  if (p.max !== null) query = query.lte("price", p.max);
  query =
    p.sort === "price_asc"
      ? query.order("price", { ascending: true })
      : p.sort === "price_desc"
        ? query.order("price", { ascending: false })
        : p.sort === "name"
          ? query.order("name", { ascending: true })
          : query.order("featured", { ascending: false }).order("created_at", { ascending: false });
  const { data, error, count } = await query.range((p.page - 1) * p.per, p.page * p.per - 1);
  if (error) return { cards: [] as Card[], total: 0, failed: true };
  return { cards: (data ?? []) as unknown as Card[], total: count ?? 0, failed: false };
}

const cachedCatalog = unstable_cache(runCatalog, ["catalog"], { revalidate: 60, tags: ["cards"] });

/**
 * Consulta pública em cache por 60 s; o admin invalida a tag "cards" ao salvar.
 * Buscas por texto não passam pelo cache (cada termo criaria uma entrada nova).
 */
export const fetchCatalog = (p: CatalogQuery) => (p.q ? runCatalog(p) : cachedCatalog(p));

/** Opções dos filtros (coleções e raridades existentes), em cache por 5 min. */
export const fetchFilterOptions = unstable_cache(
  async (game: Game | null, category: Category | null) => {
    let q = createPublicClient().from("cards").select("set_name, rarity");
    if (game) q = q.eq("game", game);
    if (category) q = q.eq("category", category);
    const { data } = await q.limit(5000);
    const uniq = (k: "set_name" | "rarity") =>
      [...new Set((data ?? []).map((m) => m[k]).filter(Boolean))].sort() as string[];
    return { sets: sortByRelease(uniq("set_name"), await getSetDates(game)), rarities: uniq("rarity") };
  },
  ["catalog-filters"],
  { revalidate: 300, tags: ["cards"] },
);
