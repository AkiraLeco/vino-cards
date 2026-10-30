import type { TcgResult } from "./pokemontcg.ts";

interface RiftItem {
  riftbound_id: string;
  name: string;
  collector_number: number | string;
  classification?: { rarity?: string | null };
  set?: { set_id?: string; label?: string };
  media?: { image_url?: string | null };
}

/** Converte a resposta da Riftcodex para o mesmo formato da busca de Pokémon, que o formulário já usa. */
export function mapRiftItems(items: RiftItem[]): TcgResult[] {
  return items
    .filter((i) => i.media?.image_url)
    .map((i) => ({
      id: i.riftbound_id,
      name: i.name,
      number: String(i.collector_number),
      rarity: i.classification?.rarity ?? undefined,
      set: { name: i.set?.label ?? "", ptcgoCode: i.set?.set_id },
      images: { small: i.media!.image_url!, large: i.media!.image_url! },
    }));
}

// Riftcodex: API aberta e gratuita de cartas de Riftbound (sem chave; aceita chamadas do navegador).
export async function searchRiftbound(query: string): Promise<TcgResult[]> {
  const q = query.trim();
  if (!q) return [];
  const res = await fetch(`https://api.riftcodex.com/cards/name?fuzzy=${encodeURIComponent(q)}`);
  if (!res.ok) return [];
  return mapRiftItems((await res.json()).items ?? []).slice(0, 24);
}
