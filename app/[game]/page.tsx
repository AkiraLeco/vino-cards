import { notFound, redirect } from "next/navigation";
import { isGame } from "@/lib/types";

export default async function GameIndex({ params }: { params: Promise<{ game: string }> }) {
  const { game } = await params;
  if (!isGame(game)) notFound();
  redirect(`/${game}/cartas`);
}
