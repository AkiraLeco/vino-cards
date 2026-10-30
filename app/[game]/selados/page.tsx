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
    ...catalogSeo(`/${game}/selados`, await searchParams),
    title: `${GAMES[game]} · Produtos Selados`,
    description: `Produtos Selados de ${GAMES[game]} com preço, estado e disponibilidade.`,
  };
}

export default async function ProdutosSelados({
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
      title={`${GAMES[game]} · Produtos Selados`}
      basePath={`/${game}/selados`}
      sp={await searchParams}
      game={game}
      category="sealed"
      mode="sealed"
    />
  );
}
