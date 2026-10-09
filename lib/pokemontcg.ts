export interface TcgResult {
  id: string;
  name: string;
  number: string;
  rarity?: string;
  set: { name: string; ptcgoCode?: string };
  images: { small: string; large: string };
}

// Pokémon TCG API (gratuita; chave opcional aumenta o limite)
export async function searchTcg(query: string): Promise<TcgResult[]> {
  const q = query.trim().replace(/"/g, "");
  if (!q) return [];
  const res = await fetch(
    `https://api.pokemontcg.io/v2/cards?q=${encodeURIComponent(`name:"${q}*"`)}&pageSize=24&select=id,name,number,rarity,set,images`,
  );
  if (!res.ok) return [];
  return (await res.json()).data as TcgResult[];
}
