import { notFound } from "next/navigation";
import Catalog, { type SP } from "@/components/Catalog";
import { GAMES, isGame } from "@/lib/types";

export const dynamic = "force-dynamic";

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
