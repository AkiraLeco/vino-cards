import { notFound } from "next/navigation";
import Catalog, { type SP } from "@/components/Catalog";
import type { Metadata } from "next";
import { catalogSeo } from "@/lib/seo";
import { GAMES, isGame } from "@/lib/types";


export async function generateMetadata({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<SP>;
}): Promise<Metadata> {
  const { game } = await params;
  if (!isGame(game)) return {};
  return {
    ...catalogSeo(`/${game}/cartas`, await searchParams),
    title: `${GAMES[game]} · Cartas Avulsas`,
    description: `Cartas Avulsas de ${GAMES[game]} com preço, estado e disponibilidade.`,
  };
}

export default async function CartasAvulsas({
  params,
  searchParams,
}: {
  params: Promise<{ game: string }>;
  searchParams: Promise<SP>;
}) {
  const { game } = await params;
  if (!isGame(game)) notFound();
  return (
    <Catalog
      title={`${GAMES[game]} · Cartas Avulsas`}
      basePath={`/${game}/cartas`}
      sp={await searchParams}
      game={game}
      category="single"
      mode="single"
    />
  );
}
