import Link from "next/link";
import CardImage from "@/components/CardImage";
import SellOneForm from "@/components/SellOneForm";
import StatusButtons from "@/components/StatusButtons";
import { requireAdmin } from "@/lib/auth";
import { brl } from "@/lib/format";
import { CATEGORIES, GAMES, cardImage, type Card } from "@/lib/types";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;

const PER_PAGE = 50;

const field =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-gold";

export default async function AdminList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const supabase = await requireAdmin();
  const page = Math.max(1, Math.floor(Number(sp.page)) || 1);

  // Totais sempre sobre o estoque inteiro; a lista respeita os filtros.
  const { data: all } = await supabase.from("cards").select("status, quantity, price");
  const inStock = (all ?? []).filter((c) => c.status === "available" && c.quantity > 0);
  const units = inStock.reduce((s, c) => s + c.quantity, 0);
  const value = inStock.reduce((s, c) => s + c.quantity * Number(c.price), 0);

  let query = supabase
    .from("cards")
    .select("*", { count: "exact" })
    .order("created_at", { ascending: false })
    .range((page - 1) * PER_PAGE, page * PER_PAGE - 1);
  if (sp.q) query = query.ilike("name", `%${sp.q}%`);
  if (sp.game) query = query.eq("game", sp.game);
  if (sp.category) query = query.eq("category", sp.category);
  if (sp.status) query = query.eq("status", sp.status);
  const { data, count } = await query;
  const cards = (data ?? []) as Card[];
  const total = count ?? cards.length;
  const pages = Math.max(1, Math.ceil(total / PER_PAGE));
  const filtered = Boolean(sp.q || sp.game || sp.category || sp.status);

  const pageHref = (p: number) => {
    const params = new URLSearchParams();
    for (const [k, v] of Object.entries(sp)) if (v && k !== "page") params.set(k, v);
    params.set("page", String(p));
    return `/admin?${params.toString()}`;
  };

  const stats = [
    ["Itens diferentes", String(inStock.length)],
    ["Unidades em estoque", String(units)],
    ["Valor em estoque", brl(value)],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-gold/25 bg-white p-3 text-center shadow-sm sm:p-5">
            <p className="text-[10px] font-semibold uppercase tracking-[0.16em] text-black/50 sm:text-[11px]">{k}</p>
            <p className="font-display text-2xl font-bold text-ink sm:text-4xl">{v}</p>
          </div>
        ))}
      </div>

      <form
        action="/admin"
        className="flex flex-wrap items-end gap-2 rounded-2xl border border-black/5 bg-white p-3 shadow-sm"
      >
        <input name="q" defaultValue={sp.q} placeholder="Buscar pelo nome..." className={`${field} min-w-0 flex-1 basis-40`} />
        <select name="game" defaultValue={sp.game ?? ""} className={field} aria-label="Jogo">
          <option value="">Todos os jogos</option>
          {Object.entries(GAMES).map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
        <select name="category" defaultValue={sp.category ?? ""} className={field} aria-label="Tipo">
          <option value="">Todos os tipos</option>
          {Object.entries(CATEGORIES).map(([k, t]) => (
            <option key={k} value={k}>
              {t}
            </option>
          ))}
        </select>
        <select name="status" defaultValue={sp.status ?? ""} className={field} aria-label="Status">
          <option value="">Todos os status</option>
          <option value="available">Disponível</option>
          <option value="reserved">Reservada</option>
          <option value="sold">Vendida</option>
        </select>
        <button className="rounded-lg bg-ink px-5 py-2 text-sm font-bold text-white transition hover:bg-gold-deep">
          Filtrar
        </button>
        {filtered && (
          <Link href="/admin" className="px-2 py-2 text-sm text-black/55 underline">
            Limpar
          </Link>
        )}
      </form>

      <div className="flex items-center justify-between text-sm text-black/55">
        <span>
          {total} {total === 1 ? "item" : "itens"}
          {filtered && " encontrados"}
          {pages > 1 && ` · página ${page} de ${pages}`}
        </span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/export" className="font-semibold text-ink underline underline-offset-4 hover:text-gold-deep">
          Exportar planilha (CSV)
        </a>
      </div>

      {cards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-gold/40 bg-white px-6 py-12 text-center">
          <p className="font-semibold">{filtered ? "Nada encontrado com esses filtros" : "Nenhum item cadastrado ainda"}</p>
          {!filtered && (
            <Link href="/admin/nova" className="mt-3 inline-block rounded-full bg-ink px-6 py-2.5 text-sm font-semibold text-white hover:bg-gold-deep">
              + Cadastrar o primeiro
            </Link>
          )}
        </div>
      )}

      {cards.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm transition hover:border-gold/40"
        >
          <div className="relative h-16 w-12 shrink-0">
            <CardImage src={cardImage(c)} alt={c.name} sizes="48px" className="object-contain" />
          </div>
          <div className="min-w-[8rem] flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-black/60">
              <span className="mr-1 rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-gold-deep">
                {[c.game ? GAMES[c.game] : null, CATEGORIES[c.category]].filter(Boolean).join(" · ")}
              </span>
              {[c.set_name, c.category === "single" ? c.condition : null, `qtd ${c.quantity}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span className="font-display text-xl font-bold text-ink">{brl(c.price)}</span>
          <StatusButtons id={c.id} status={c.status} />
          <SellOneForm id={c.id} disabled={c.quantity < 1} />
          <Link href={`/admin/${c.id}`} className="text-sm font-medium underline underline-offset-4 hover:text-gold-deep">
            Editar
          </Link>
        </div>
      ))}

      {pages > 1 && (
        <nav className="mt-2 flex items-center justify-center gap-3 text-sm" aria-label="Páginas">
          {page > 1 && (
            <Link href={pageHref(page - 1)} className="rounded-lg border border-black/10 bg-white px-4 py-2 font-medium hover:border-gold">
              ‹ Anterior
            </Link>
          )}
          {page < pages && (
            <Link href={pageHref(page + 1)} className="rounded-lg border border-black/10 bg-white px-4 py-2 font-medium hover:border-gold">
              Próxima ›
            </Link>
          )}
        </nav>
      )}
    </div>
  );
}
