import type { Game } from "./types.ts";

/** Nome da coleção -> data de lançamento (ms). Vazio se a API não responder. */
export type SetDates = Map<string, number>;

const toMs = (s?: string | null) => {
  const t = s ? Date.parse(s.replace(/\//g, "-")) : NaN;
  return Number.isFinite(t) ? t : null;
};

async function getJson(url: string) {
  const res = await fetch(url, { next: { revalidate: 86400 }, signal: AbortSignal.timeout(8000) });
  if (!res.ok) throw new Error(`${url} respondeu ${res.status}`);
  return res.json();
}

async function pokemonDates(): Promise<SetDates> {
  const json = await getJson("https://api.pokemontcg.io/v2/sets?select=name,releaseDate&pageSize=250");
  const map: SetDates = new Map();
  for (const s of json.data ?? []) {
    const t = toMs(s.releaseDate);
    if (t !== null) map.set(s.name, t);
  }
  return map;
}

async function riftboundDates(): Promise<SetDates> {
  const json = await getJson("https://api.riftcodex.com/sets");
  const map: SetDates = new Map();
  for (const s of json.items ?? []) {
    const t = toMs(s.published_on);
    if (t !== null) {
      map.set(s.name, t);
      // As cartas trazem só "Proving Grounds"; a coleção se chama "Origins: Proving Grounds".
      const short = s.name.split(": ")[1];
      if (short && !map.has(short)) map.set(short, t);
    }
  }
  return map;
}

/** Datas de lançamento das coleções de um jogo (ou dos dois). Falha da API não derruba a página. */
export async function getSetDates(game?: Game | null): Promise<SetDates> {
  const jobs = game === "pokemon" ? [pokemonDates()] : game === "riftbound" ? [riftboundDates()] : [pokemonDates(), riftboundDates()];
  const all: SetDates = new Map();
  for (const r of await Promise.allSettled(jobs)) if (r.status === "fulfilled") for (const [k, v] of r.value) all.set(k, v);
  return all;
}

/** Do lançamento mais recente para o mais antigo; coleções sem data vão para o fim, em ordem alfabética. */
export function sortByRelease(names: string[], dates: SetDates): string[] {
  return [...names].sort((a, b) => {
    const da = dates.get(a);
    const db = dates.get(b);
    if (da !== undefined && db !== undefined) return db - da || a.localeCompare(b);
    if (da !== undefined) return -1;
    if (db !== undefined) return 1;
    return a.localeCompare(b);
  });
}
