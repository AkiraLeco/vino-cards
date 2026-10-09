import Link from "next/link";
import { brl } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import { cardImage, type Card } from "@/lib/types";
import StatusButtons from "@/components/StatusButtons";
import { sellOne } from "../actions";

export const dynamic = "force-dynamic";

export default async function AdminList() {
  const supabase = await createClient();
  const { data } = await supabase
    .from("cards")
    .select("*")
    .order("created_at", { ascending: false });
  const cards = (data ?? []) as Card[];

  const inStock = cards.filter((c) => c.status === "available" && c.quantity > 0);
  const units = inStock.reduce((s, c) => s + c.quantity, 0);
  const value = inStock.reduce((s, c) => s + c.quantity * c.price, 0);

  const stats = [
    ["Cartas diferentes", String(inStock.length)],
    ["Unidades em estoque", String(units)],
    ["Valor em estoque", brl(value)],
  ];

  return (
    <div className="flex flex-col gap-3">
      <div className="grid grid-cols-3 gap-2">
        {stats.map(([k, v]) => (
          <div key={k} className="rounded-xl bg-violet-50 p-3 text-center ring-1 ring-violet-200">
            <p className="text-[11px] text-black/60 sm:text-xs">{k}</p>
            <p className="text-base font-extrabold text-violet-700 sm:text-xl">{v}</p>
          </div>
        ))}
      </div>
      {/* eslint-disable-next-line @next/next/no-html-link-for-pages */}
      <a href="/admin/export" className="self-end text-sm text-violet-700 underline">
        Exportar planilha (CSV)
      </a>

      {cards.length === 0 && <p className="text-black/60">Nenhuma carta cadastrada ainda.</p>}
      {cards.map((c) => (
        <div
          key={c.id}
          className="flex flex-wrap items-center gap-3 rounded-xl bg-black/5 p-3 ring-1 ring-black/10"
        >
          {/* eslint-disable-next-line @next/next/no-img-element */}
          <img src={cardImage(c)} alt="" className="h-16 w-12 object-contain" />
          <div className="min-w-[8rem] flex-1">
            <p className="font-semibold">{c.name}</p>
            <p className="text-xs text-black/60">
              {c.set_name} · {c.condition} · qtd {c.quantity}
            </p>
          </div>
          <span className="font-bold text-violet-700">{brl(c.price)}</span>
          <StatusButtons id={c.id} status={c.status} />
          <form action={sellOne}>
            <input type="hidden" name="id" value={c.id} />
            <button
              disabled={c.quantity < 1}
              className="rounded bg-violet-700 px-3 py-1 text-sm font-bold text-white disabled:opacity-40"
            >
              Vendi 1
            </button>
          </form>
          <Link href={`/admin/${c.id}`} className="text-sm underline">
            Editar
          </Link>
        </div>
      ))}
    </div>
  );
}
