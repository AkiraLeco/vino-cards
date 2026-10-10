import Link from "next/link";
import { brl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { CATEGORIES, GAMES, cardImage, type Card } from "@/lib/types";
import StatusButtons from "@/components/StatusButtons";
import { sellOne } from "../actions";

export const dynamic = "force-dynamic";

type SP = Record<string, string | undefined>;

const field =
  "rounded-lg border border-black/10 bg-white px-3 py-2 text-sm outline-none focus:border-violet-500";

export default async function AdminList({ searchParams }: { searchParams: Promise<SP> }) {
  const sp = await searchParams;
  const supabase = await createClient();

  // Totais sempre sobre o estoque inteiro; a lista respeita os filtros.
  const { data: all } = await supabase.from("cards").select("status, quantity, price");
  const inStock = (all ?? []).filter((c) => c.status === "available" && c.quantity > 0);
  const units = inStock.reduce((s, c) => s + c.quantity, 0);
  const value = inStock.reduce((s, c) => s + c.quantity * Number(c.price), 0);

  let query = supabase.from("cards").select("*").order("created_at", { ascending: false }).limit(300);
  if (sp.q) query = query.ilike("name", `%${sp.q}%`);
  if (sp.game) query = query.eq("game", sp.game);
  if (sp.category) query = query.eq("category", sp.category);
  if (sp.status) query = query.eq("status", sp.status);
  const { data } = await query;
  const cards = (data ?? []) as Card[];
  const filtered = Boolean(sp.q || sp.game || sp.category || sp.status);

  const stats = [
    ["Itens diferentes", String(inStock.length)],
    ["Unidades em estoque", String(units)],
    ["Valor em estoque", brl(value)],
  ];

  return (
    <div className="flex flex-col gap-4">
      <div className="grid grid-cols-3 gap-2 sm:gap-3">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-2xl border border-violet-100 bg-white p-3 text-center shadow-sm sm:p-4">
            <p className="text-[11px] text-black/55 sm:text-xs">{k}</p>
            <p className="text-base font-extrabold text-violet-700 sm:text-2xl">{v}</p>
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
        <button className="rounded-lg bg-violet-600 px-4 py-2 text-sm font-bold text-white hover:bg-violet-700">
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
          {cards.length} {cards.length === 1 ? "item" : "itens"}
          {filtered && " encontrados"}
        </span>
        {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
        <a href="/admin/export" className="font-medium text-violet-700 underline">
          Exportar planilha (CSV)
        </a>
      </div>

      {cards.length === 0 && (
        <div className="rounded-2xl border border-dashed border-black/15 bg-white px-6 py-12 text-center">
          <p className="font-semibold">{filtered ? "Nada encontrado com esses filtros" : "Nenhum item cadastrado ainda"}</p>
          {!filtered && (
            <Link href="/admin/nova" className="mt-3 inline-block rounded-full bg-violet-600 px-5 py-2 text-sm font-semibold text-white">
              + Cadastrar o primeiro
            </Link>
          )}
        </div>
      )}

      {cards.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center gap-3 rounded-2xl border border-black/5 bg-white p-3 shadow-sm"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardImage(c)} alt="" className="h-16 w-12 object-contain" />
          <div className="min-w-[8rem] flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-black/60">
              <span className="mr-1 rounded bg-violet-100 px-1.5 py-0.5 font-semibold text-violet-800">
                {[c.game ? GAMES[c.game] : null, CATEGORIES[c.category]].filter(Boolean).join(" · ")}
              </span>
              {[c.set_name, c.category === "single" ? c.condition : null, `qtd ${c.quantity}`]
                .filter(Boolean)
                .join(" · ")}
            </p>
          </div>
          <span className="font-bold text-violet-700">{brl(c.price)}</span>
          <StatusButtons id={c.id} status={c.status} />
          <form action={sellOne}>
            <input type="hidden" name="id" value={c.id} />
            <button
              disabled={c.quantity < 1}
              className="rounded-lg bg-violet-600 px-3 py-1.5 text-sm font-bold text-white disabled:opacity-40"
            >
              Vendi 1
            </button>
          </form>
          <Link href={`/admin/${c.id}`} className="text-sm font-medium underline">
            Editar
          </Link>
        </div>
      ))}
    </div>
  );
}
