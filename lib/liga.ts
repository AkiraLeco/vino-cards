export interface LigaOffer {
  name: string;
  edition: string;
  num: string;
  min: number;
  avg: number;
  max: number;
  url: string;
}

const BASE = "https://www.ligapokemon.com.br/";

const toNumber = (s?: string) => {
  if (!s) return 0;
  const n = Number(s.replace(/[^\d,]/g, "").replace(",", "."));
  return Number.isFinite(n) ? n : 0;
};

const decode = (s: string) =>
  s
    .replace(/&amp;/g, "&")
    .replace(/&#0?39;|&apos;/g, "'")
    .replace(/&quot;/g, '"');

export const normNum = (n: string) => n.replace(/^0+(?=\d)/, "").toLowerCase();

export const ligaSearchUrl = (query: string) =>
  `${BASE}?view=cards/search&card=${encodeURIComponent(query)}`;

async function fetchPage(query: string): Promise<LigaOffer[]> {
  const res = await fetch(ligaSearchUrl(query), {
    headers: {
      "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) Chrome/124 Safari/537.36",
      "accept-language": "pt-BR,pt;q=0.9",
    },
    next: { revalidate: 600 },
  });
  if (!res.ok) throw new Error(`Liga respondeu ${res.status}`);
  const html = await res.text();

  const offers: LigaOffer[] = [];
  for (const block of html.split('class="mtg-single"').slice(1)) {
    const link = block.match(
      /view=cards\/card&(?:amp;)?card=([^"&]*)&(?:amp;)?ed=([^&"]*)&(?:amp;)?num=([^"&]*)/,
    );
    if (!link) continue; // produtos (booster, box...) não interessam
    const price = (k: string) =>
      toNumber(block.match(new RegExp(`class="price-${k}">([^<]*)<`))?.[1]);
    offers.push({
      name: decode(decodeURIComponent(link[1].replace(/\+/g, " "))),
      edition: decodeURIComponent(link[2]),
      num: decodeURIComponent(link[3]),
      min: price("min"),
      avg: price("avg"),
      max: price("max"),
      url: `${BASE}?view=cards/card&card=${link[1]}&ed=${link[2]}&num=${link[3]}`,
    });
  }
  return offers;
}

/** Busca preços na LigaPokémon. Tenta pela coleção (código) e cai para só o nome. */
export async function lookupLiga(opts: {
  name: string;
  number?: string;
  setCode?: string;
}): Promise<LigaOffer[]> {
  const name = opts.name.trim();
  if (!name) return [];

  let offers: LigaOffer[] = [];
  if (opts.setCode) offers = await fetchPage(`${name} ed=${opts.setCode}`);
  if (offers.length === 0) offers = await fetchPage(name);

  const base = name.toLowerCase();
  let list = offers.filter((o) => o.name.toLowerCase().startsWith(base));
  if (list.length === 0) list = offers;

  if (opts.number) {
    const want = normNum(opts.number);
    const exact = list.filter((o) => normNum(o.num) === want);
    if (exact.length > 0) list = exact;
  }
  return list.slice(0, 12);
}
