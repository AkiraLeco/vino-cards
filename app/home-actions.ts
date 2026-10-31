"use server";

import { LIST_COLUMNS } from "@/lib/catalog";
import { HOME_PAGE_SIZE } from "@/lib/home";
import { createPublicClient } from "@/lib/supabase/public";
import { isGame, type Card } from "@/lib/types";

/** Próxima página de cartas avulsas de um jogo para a fileira infinita da home. */
export async function loadMoreCards(game: string, offset: number): Promise<Card[]> {
  const start = Math.max(0, Math.floor(Number(offset)) || 0);
  if (!isGame(game) || start > 50_000) return [];
  const { data, error } = await createPublicClient()
    .from("cards")
    .select(LIST_COLUMNS)
    .in("status", ["available", "reserved"])
    .eq("category", "single")
    .eq("game", game)
    .order("featured", { ascending: false })
    .order("created_at", { ascending: false })
    .order("id")
    .range(start, start + HOME_PAGE_SIZE - 1);
  if (error) {
    console.error("loadMoreCards", error);
    return [];
  }
  return (data ?? []) as unknown as Card[];
}
