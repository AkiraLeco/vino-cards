import Link from "next/link";
import CardItem from "@/components/CardItem";
import Filters, { type FilterMode } from "@/components/Filters";
import { fetchCatalog, fetchFilterOptions } from "@/lib/catalog";
import type { Category, Game } from "@/lib/types";

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
  const per = [30, 60, 90].includes(Number(sp.per)) ? Number(sp.per) : 30;
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);
  const price = (v?: string) => (v && v.trim() !== "" && Number.isFinite(Number(v)) ? Number(v) : null);

  const [{ cards, total, failed: error }, opts] = await Promise.all([
    fetchCatalog({
      game,
      category,
      hideSold: !sp.f || sp.stock === "1",
      q: sp.q,
      set: sp.set,
      rarity: sp.rarity,
      cond: sp.cond,
      lang: sp.lang,
      min: price(sp.min),
      max: price(sp.max),
      sort: sp.sort,
      page,
      per,
    }),
    fetchFilterOptions(game ?? null, category ?? null),
  ]);

  const pages = Math.max(1, Math.ceil(total / per));
  const from = total === 0 ? 0 : (page - 1) * per + 1;
  const to = Math.min(total, page * per);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
    params.set("page", String(p));
    return `${basePath}?${params.toString()}`;
  };

  const pageBtn = "grid h-9 min-w-9 place-items-center rounded-lg border px-2 text-sm font-medium transition";
  const visible = Array.from({ length: pages }, (_, i) => i + 1).slice(
    Math.max(0, page - 3),
    page + 2,
  );

  return (
    <div className="mx-auto max-w-[1400px]">
      <div className="mb-6 flex flex-wrap items-end justify-between gap-2 border-b border-gold/30 pb-4">
        <div>
          <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">Catálogo</p>
          <h1 className="font-display text-4xl font-bold tracking-tight sm:text-5xl">{title}</h1>
          <p className="text-sm text-black/60">
            {total === 0
              ? "Nenhum item"
              : `Mostrando ${from}-${to} de ${total.toLocaleString("pt-BR")} ${total === 1 ? "item" : "itens"}`}
          </p>
        </div>
      </div>

      <div className="lg:grid lg:grid-cols-[260px_minmax(0,1fr)] lg:items-start lg:gap-8">
      <aside className="lg:sticky lg:top-24">
      <Filters
        opts={opts}
        values={sp}
        action={basePath}
        mode={mode}
      />
      </aside>
      <div>

      {error && (
        <p role="alert" className="mt-4 rounded-xl border border-red-200 bg-red-50 p-3 text-sm text-red-800">
          Erro ao carregar os itens. Se você acabou de atualizar o site, confirme que o SQL de
          migração foi executado no Supabase.
        </p>
      )}

      {cards.length === 0 && !error ? (
        <div className="mt-6 rounded-2xl border border-dashed border-black/15 bg-white px-6 py-14 text-center">
          <p className="font-display text-5xl text-gold">♠</p>
          <p className="mt-2 font-semibold">Nenhum item encontrado</p>
          <p className="mt-1 text-sm text-black/60">
            Tente remover algum filtro ou volte mais tarde, estamos sempre adicionando novidades.
          </p>
          <Link href={basePath} className="mt-4 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white transition hover:bg-gold-deep">
            Limpar filtros
          </Link>
        </div>
      ) : (
        <div className="mt-5 grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:mt-0 xl:grid-cols-4">
          {cards.map((c) => (
            <CardItem key={c.id} card={c} />
          ))}
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-8 flex flex-wrap items-center justify-center gap-1.5" aria-label="Páginas">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className={`${pageBtn} border-black/10 bg-white hover:border-gold hover:bg-violet-50`}>
              ‹
            </Link>
          )}
          {visible.map((p) =>
            p === page ? (
              <span key={p} aria-current="page" className={`${pageBtn} border-ink bg-ink text-white`}>
                {p}
              </span>
            ) : (
              <Link key={p} href={pageHref(p)} className={`${pageBtn} border-black/10 bg-white hover:border-gold hover:bg-violet-50`}>
                {p}
              </Link>
            ),
          )}
          {page < pages && (
            <>
              <Link href={pageHref(page + 1)} className={`${pageBtn} border-black/10 bg-white hover:border-gold hover:bg-violet-50`}>
                ›
              </Link>
              <Link href={pageHref(pages)} className={`${pageBtn} border-black/10 bg-white hover:border-gold hover:bg-violet-50`}>
                »
              </Link>
            </>
          )}
        </nav>
      )}
      </div>
      </div>
    </div>
  );
}
