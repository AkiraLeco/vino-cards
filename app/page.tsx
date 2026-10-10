import Link from "next/link";
import CardItem from "@/components/CardItem";
import { type GameTileData } from "@/components/GameTile";
import TileCarousel from "@/components/TileCarousel";
import { STORE_NAME } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

const TILES: GameTileData[] = [
  {
    href: "/pokemon/cartas",
    title: "Pokémon",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚡",
    background:
      "linear-gradient(135deg, rgba(255,189,36,0.98) 0%, rgba(245,124,22,0.96) 55%, rgba(233,75,67,0.96) 100%)",
    image: "/tiles/pokemon.webp",
    cutout: true,
  },
  {
    href: "/riftbound/cartas",
    title: "Riftbound",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚔️",
    background:
      "linear-gradient(115deg, rgba(57,32,128,0.74) 0%, rgba(98,86,234,0.36) 50%, rgba(87,156,245,0.1) 100%)",
    shade: "linear-gradient(to top, rgba(40,20,96,0.45) 0%, transparent 50%)",
    image: "/tiles/riftbound.webp",
    imagePosition: "70% 25%",
  },
  {
    href: "/acessorios",
    title: "Acessórios",
    sub: "Playmats, sleeves, deckboxes e mais",
    icon: "🎴",
    background: "linear-gradient(135deg, #55BE9B 0%, #39AFA9 55%, #428FB9 100%)",
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
      <section className="relative overflow-hidden rounded-3xl bg-[linear-gradient(135deg,#7138F0_0%,#4F46C9_55%,#171B35_100%)] px-6 py-10 text-white shadow-lg sm:px-12 sm:py-14">
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

      <section className="mt-6">
        <TileCarousel tiles={TILES} />
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
