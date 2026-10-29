import Link from "next/link";
import CardItem from "@/components/CardItem";
import { type GameTileData } from "@/components/GameTile";
import PromoBanner, { type PromoSlide } from "@/components/PromoBanner";
import TileCarousel from "@/components/TileCarousel";
import { STORE_NAME } from "@/lib/format";
import { createPublicClient } from "@/lib/supabase/public";
import type { Card } from "@/lib/types";

// Dados públicos: a página é gerada e renovada a cada 60 s (o admin também a renova ao salvar).
export const revalidate = 60;

const SLIDES: PromoSlide[] = [
  {
    href: "/pokemon/cartas",
    eyebrow: "Cartas · Selados · Acessórios",
    title: `Bem-vindo à ${STORE_NAME}`,
    text: "Estoque atualizado de Pokémon e Riftbound, com preço, estado e disponibilidade de cada item.",
    cta: "Ver cartas",
    background: "linear-gradient(135deg,#2a2457 0%,#16132e 60%,#0a0918 100%)",
  },
  {
    href: "/pokemon/selados",
    eyebrow: "Produtos selados",
    title: "Boosters, boxes e decks",
    text: "Produtos lacrados de Pokémon e Riftbound para abrir ou colecionar.",
    cta: "Ver selados",
    background: "linear-gradient(135deg,#8a3a22 0%,#4a1d2c 60%,#170d1a 100%)",
  },
  {
    href: "/acessorios",
    eyebrow: "Acessórios",
    title: "Proteja e organize suas cartas",
    text: "Playmats, sleeves, deckboxes e mais.",
    cta: "Ver acessórios",
    background: "linear-gradient(135deg,#1f6f66 0%,#16444f 60%,#0b1d2b 100%)",
  },
];

const TILES: GameTileData[] = [
  {
    href: "/pokemon/cartas",
    title: "Pokémon",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚡",
    background:
      "linear-gradient(135deg, #d99a1c 0%, #b4541a 55%, #6e2430 100%)",
  },
  {
    href: "/riftbound/cartas",
    title: "Riftbound",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚔️",
    background:
      "linear-gradient(135deg, #1e1458 0%, #3a3a9e 60%, #3f6fb8 100%)",
  },
  {
    href: "/acessorios",
    title: "Acessórios",
    sub: "Playmats, sleeves, deckboxes e mais",
    icon: "🎴",
    background: "linear-gradient(135deg, #2f8f80 0%, #1f6a6e 55%, #164a5e 100%)",
  },
];

export default async function Home() {
  const supabase = createPublicClient();
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
        <section className="mt-14">
          <div className="mb-6 flex items-end justify-between gap-4 border-b border-gold/30 pb-3">
            <div>
              <p className="text-[11px] font-semibold uppercase tracking-[0.22em] text-gold-deep">Seleção da casa</p>
              <h2 className="font-display text-3xl font-bold tracking-tight sm:text-4xl">Cartas avulsas</h2>
            </div>
            <Link href="/pokemon/cartas" className="text-sm font-semibold text-ink underline-offset-4 hover:text-gold-deep hover:underline">
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
