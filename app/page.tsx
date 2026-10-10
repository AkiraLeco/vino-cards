import Link from "next/link";
import CardItem from "@/components/CardItem";
import { STORE_NAME } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

const TILES = [
  {
    href: "/pokemon/cartas",
    title: "Pokémon",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚡",
    color: "from-amber-400 via-orange-500 to-red-500",
  },
  {
    href: "/riftbound/cartas",
    title: "Riftbound",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚔️",
    color: "from-sky-500 via-indigo-500 to-violet-600",
  },
  {
    href: "/acessorios",
    title: "Acessórios",
    sub: "Playmats, sleeves, deckboxes e mais",
    icon: "🎴",
    color: "from-emerald-500 via-teal-500 to-cyan-600",
  },
];

export default async function Home() {
  const supabase = await createClient();
  const [{ data }, { count }] = await Promise.all([
    supabase
      .from("cards")
      .select("*")
      .in("status", ["available", "reserved"])
      .order("featured", { ascending: false })
      .order("created_at", { ascending: false })
      .limit(10),
    supabase
      .from("cards")
      .select("id", { count: "exact", head: true })
      .eq("status", "available")
      .gt("quantity", 0),
  ]);
  const cards = (data ?? []) as Card[];

  return (
    <div className="mx-auto max-w-[1400px]">
      <section className="relative overflow-hidden rounded-3xl bg-gradient-to-br from-violet-700 via-indigo-700 to-slate-900 px-6 py-10 text-white shadow-lg sm:px-12 sm:py-14">
        <div className="pointer-events-none absolute -right-16 -top-16 h-72 w-72 rounded-full bg-fuchsia-500/30 blur-3xl" />
        <div className="pointer-events-none absolute -bottom-20 left-1/3 h-72 w-72 rounded-full bg-sky-400/20 blur-3xl" />
        <div className="relative max-w-2xl">
          <p className="mb-3 inline-block rounded-full bg-white/15 px-3 py-1 text-xs font-semibold uppercase tracking-wider">
            Cartas · Selados · Acessórios
          </p>
          <h1 className="text-3xl font-black leading-tight tracking-tight sm:text-5xl">
            Bem-vindo à {STORE_NAME}
          </h1>
          <p className="mt-3 text-base text-white/80 sm:text-lg">
            Veja o estoque atualizado de Pokémon e Riftbound, com preço, estado e disponibilidade de
            cada item.
          </p>
          <div className="mt-6 flex flex-wrap gap-3">
            <Link href="/pokemon/cartas" className="rounded-full bg-white px-6 py-2.5 text-sm font-bold text-violet-700 shadow transition hover:bg-violet-50">
              Ver cartas
            </Link>
            <Link href="/qr" className="rounded-full border border-white/40 px-6 py-2.5 text-sm font-semibold transition hover:bg-white/10">
              QR Code da loja
            </Link>
          </div>
          {(count ?? 0) > 0 && (
            <p className="mt-6 text-sm text-white/70">
              <b className="text-white">{count}</b> {count === 1 ? "item disponível" : "itens disponíveis"} agora
            </p>
          )}
        </div>
      </section>

      <section className="mt-8 grid gap-4 sm:grid-cols-3">
        {TILES.map((t) => (
          <Link
            key={t.href}
            href={t.href}
            className={`group relative overflow-hidden rounded-2xl bg-gradient-to-br ${t.color} p-6 text-white shadow-md transition hover:-translate-y-1 hover:shadow-xl`}
          >
            <span className="absolute -right-2 -top-3 text-7xl opacity-25 transition group-hover:scale-110">{t.icon}</span>
            <h2 className="relative text-2xl font-extrabold">{t.title}</h2>
            <p className="relative mt-1 text-sm text-white/90">{t.sub}</p>
            <span className="relative mt-4 inline-block text-sm font-semibold">Explorar →</span>
          </Link>
        ))}
      </section>

      {cards.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Novidades</h2>
            <Link href="/busca" className="text-sm font-semibold text-violet-700 hover:underline">
              Ver todos →
            </Link>
          </div>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 sm:gap-4 lg:grid-cols-4 xl:grid-cols-5">
            {cards.map((c) => (
              <CardItem key={c.id} card={c} />
            ))}
          </div>
        </section>
      )}
    </div>
  );
}
