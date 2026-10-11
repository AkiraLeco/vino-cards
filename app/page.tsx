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
      "linear-gradient(135deg, #FFBD24 0%, #F57C16 55%, #E94B43 100%)",
  },
  {
    href: "/riftbound/cartas",
    title: "Riftbound",
    sub: "Cartas avulsas, selados e coleções",
    icon: "⚔️",
    background:
      "linear-gradient(135deg, #392080 0%, #5B54D6 55%, #579CF5 100%)",
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
