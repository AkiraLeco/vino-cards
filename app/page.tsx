import Link from "next/link";
import CardItem from "@/components/CardItem";
import { type GameTileData } from "@/components/GameTile";
import PromoBanner, { type PromoSlide } from "@/components/PromoBanner";
import TileCarousel from "@/components/TileCarousel";
import { STORE_NAME } from "@/lib/format";
import { createClient } from "@/lib/supabase/server";
import type { Card } from "@/lib/types";

export const dynamic = "force-dynamic";

const SLIDES: PromoSlide[] = [
  {
    href: "/pokemon/cartas",
    eyebrow: "Cartas · Selados · Acessórios",
    title: `Bem-vindo à ${STORE_NAME}`,
    text: "Estoque atualizado de Pokémon e Riftbound, com preço, estado e disponibilidade de cada item.",
    cta: "Ver cartas",
    background: "linear-gradient(135deg,#7138F0 0%,#4F46C9 55%,#171B35 100%)",
  },
  {
    href: "/pokemon/selados",
    eyebrow: "Produtos selados",
    title: "Boosters, boxes e decks",
    text: "Produtos lacrados de Pokémon e Riftbound para abrir ou colecionar.",
    cta: "Ver selados",
    background: "linear-gradient(135deg,#F59E0B 0%,#E94B43 100%)",
  },
  {
    href: "/acessorios",
    eyebrow: "Acessórios",
    title: "Proteja e organize suas cartas",
    text: "Playmats, sleeves, deckboxes e mais.",
    cta: "Ver acessórios",
    background: "linear-gradient(135deg,#55BE9B 0%,#39AFA9 55%,#428FB9 100%)",
  },
];

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
  const { data } = await supabase
    .from("cards")
    .select("*")
    .in("status", ["available", "reserved"])
    .eq("category", "single")
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .limit(10);
  const cards = (data ?? []) as Card[];

  return (
    <div className="mx-auto max-w-[1400px]">
      <PromoBanner slides={SLIDES} />

      <section className="mt-6">
        <TileCarousel tiles={TILES} />
      </section>

      {cards.length > 0 && (
        <section className="mt-10">
          <div className="mb-4 flex items-end justify-between">
            <h2 className="text-xl font-extrabold tracking-tight sm:text-2xl">Cartas avulsas</h2>
            <Link href="/pokemon/cartas" className="text-sm font-semibold text-violet-700 hover:underline">
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
