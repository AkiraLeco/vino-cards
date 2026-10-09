"use client";

import { useState } from "react";
import { saveCard } from "@/app/admin/actions";
import { fetchLigaPrice, type LigaResult } from "@/app/admin/liga";
import { ligaSearchUrl, type LigaOffer } from "@/lib/liga";
import { brl } from "@/lib/format";
import { searchTcg, type TcgResult } from "@/lib/pokemontcg";
import { CONDITIONS, LANGUAGES, type Card } from "@/lib/types";

const field = "w-full rounded-lg bg-black/5 px-3 py-2 text-sm outline-none [&>option]:text-black";
const label = "flex flex-col gap-1 text-xs text-black/70";

export default function CardForm({ card }: { card?: Card }) {
  const [v, setV] = useState({
    api_card_id: card?.api_card_id ?? "",
    name: card?.name ?? "",
    set_name: card?.set_name ?? "",
    number: card?.number ?? "",
    rarity: card?.rarity ?? "",
    image_api_url: card?.image_api_url ?? "",
  });
  const [q, setQ] = useState("");
  const [results, setResults] = useState<TcgResult[]>([]);
  const [loading, setLoading] = useState(false);
  const [price, setPrice] = useState(card?.price != null ? String(card.price) : "");
  const [refPrice, setRefPrice] = useState(card?.ref_price != null ? String(card.ref_price) : "");
  const [setCode, setSetCode] = useState("");
  const [liga, setLiga] = useState<LigaResult | null>(null);
  const [ligaLoading, setLigaLoading] = useState(false);

  async function lookupPrice() {
    setLigaLoading(true);
    setLiga(null);
    setLiga(await fetchLigaPrice({ name: v.name, number: v.number, setCode }));
    setLigaLoading(false);
  }

  function applyPrice(o: LigaOffer, value: number) {
    setPrice(value.toFixed(2));
    setRefPrice((o.avg || value).toFixed(2));
  }

  async function search() {
    setLoading(true);
    setResults(await searchTcg(q).catch(() => []));
    setLoading(false);
  }

  function pick(r: TcgResult) {
    setV({
      api_card_id: r.id,
      name: r.name,
      set_name: r.set.name,
      number: r.number,
      rarity: r.rarity ?? "",
      image_api_url: r.images.large,
    });
    setSetCode(r.set.ptcgoCode ?? "");
    setLiga(null);
    setResults([]);
  }

  const bind = (k: keyof typeof v) => ({
    name: k,
    value: v[k],
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => setV({ ...v, [k]: e.target.value }),
  });

  return (
    <div className="mx-auto max-w-2xl">
      <div className="mb-6 rounded-xl bg-black/5 p-4 ring-1 ring-black/10">
        <p className="mb-2 text-sm font-semibold">Buscar carta na base Pokémon TCG</p>
        <div className="flex gap-2">
          <input
            value={q}
            onChange={(e) => setQ(e.target.value)}
            onKeyDown={(e) => {
              if (e.key === "Enter") {
                e.preventDefault();
                search();
              }
            }}
            placeholder="Ex: Charizard (nome em inglês)"
            className={field}
          />
          <button type="button" onClick={search} className="rounded-lg bg-violet-700 px-4 text-sm font-bold text-white">
            {loading ? "..." : "Buscar"}
          </button>
        </div>
        {results.length > 0 && (
          <div className="mt-3 grid grid-cols-3 gap-2 sm:grid-cols-4">
            {results.map((r) => (
              <button type="button" key={r.id} onClick={() => pick(r)} className="text-left text-xs hover:opacity-80">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img src={r.images.small} alt={r.name} className="w-full rounded" />
                <span className="line-clamp-1">{r.set.name} {r.number}</span>
              </button>
            ))}
          </div>
        )}
      </div>

      <form action={saveCard} encType="multipart/form-data" className="grid gap-3 sm:grid-cols-2">
        <input type="hidden" name="id" value={card?.id ?? ""} />
        <input type="hidden" name="api_card_id" value={v.api_card_id} />
        <input type="hidden" name="image_api_url" value={v.image_api_url} />
        <input type="hidden" name="existing_photos" value={(card?.photo_urls ?? []).join("\n")} />

        {v.image_api_url && (
          // eslint-disable-next-line @next/next/no-img-element
          <img src={v.image_api_url} alt="" className="mx-auto h-48 sm:col-span-2" />
        )}

        <label className={`${label} sm:col-span-2`}>
          Nome
          <input required className={field} {...bind("name")} />
        </label>
        <label className={label}>
          Coleção
          <input className={field} {...bind("set_name")} />
        </label>
        <label className={label}>
          Número
          <input className={field} {...bind("number")} />
        </label>
        <label className={label}>
          Raridade
          <input className={field} {...bind("rarity")} />
        </label>
        <label className={label}>
          Idioma
          <select name="language" defaultValue={card?.language ?? "Português"} className={field}>
            {LANGUAGES.map((l) => (
              <option key={l}>{l}</option>
            ))}
          </select>
        </label>
        <label className={label}>
          Estado
          <select name="condition" defaultValue={card?.condition ?? "NM"} className={field}>
            {Object.entries(CONDITIONS).map(([k, t]) => (
              <option key={k} value={k}>
                {t}
              </option>
            ))}
          </select>
        </label>
        <label className={label}>
          Status
          <select name="status" defaultValue={card?.status ?? "available"} className={field}>
            <option value="available">Disponível</option>
            <option value="reserved">Reservada</option>
            <option value="sold">Vendida</option>
          </select>
        </label>
        <label className={label}>
          Preço (R$)
          <input
            name="price"
            type="number"
            step="0.01"
            min="0"
            required
            value={price}
            onChange={(e) => setPrice(e.target.value)}
            className={field}
          />
        </label>
        <label className={label}>
          Preço de referência (R$, opcional)
          <input
            name="ref_price"
            type="number"
            step="0.01"
            min="0"
            value={refPrice}
            onChange={(e) => setRefPrice(e.target.value)}
            className={field}
          />
        </label>

        <div className="rounded-xl bg-black/5 p-3 ring-1 ring-black/10 sm:col-span-2">
          <button
            type="button"
            disabled={!v.name || ligaLoading}
            onClick={lookupPrice}
            className="rounded-lg bg-blue-500 px-4 py-2 text-sm font-bold disabled:opacity-50"
          >
            {ligaLoading ? "Consultando..." : "Ver preço na LigaPokémon"}
          </button>
          {liga?.error && <p className="mt-2 text-sm text-red-400">{liga.error}</p>}
          {liga && !liga.error && liga.offers.length === 0 && (
            <p className="mt-2 text-sm text-black/70">
              Não encontrei essa carta na Liga.{" "}
              <a
                href={ligaSearchUrl(v.name)}
                target="_blank"
                rel="noreferrer"
                className="underline"
              >
                Abrir busca na Liga
              </a>
            </p>
          )}
          {liga && liga.offers.length > 0 && (
            <ul className="mt-3 flex flex-col gap-2">
              {liga.offers.map((o) => (
                <li key={o.url} className="rounded-lg bg-white p-2 text-xs ring-1 ring-black/10">
                  <a href={o.url} target="_blank" rel="noreferrer" className="font-semibold underline">
                    {o.name} · {o.edition} #{o.num}
                  </a>
                  {o.avg > 0 ? (
                    <div className="mt-1 flex flex-wrap gap-2">
                      {(
                        [
                          ["Mín", o.min],
                          ["Médio", o.avg],
                          ["Máx", o.max],
                        ] as const
                      ).map(([t, val]) => (
                        <button
                          type="button"
                          key={t}
                          onClick={() => applyPrice(o, val)}
                          className="rounded bg-violet-700 px-2 py-1 font-bold text-white"
                        >
                          {t}: {brl(val)}
                        </button>
                      ))}
                    </div>
                  ) : (
                    <p className="mt-1 text-black/60">Sem ofertas no momento.</p>
                  )}
                </li>
              ))}
            </ul>
          )}
          <p className="mt-2 text-[11px] text-black/50">
            Clique em um valor para preencher o preço (a média vira o preço de referência). Confira
            se é a coleção e o número certos.
          </p>
        </div>
        <label className={label}>
          Quantidade
          <input name="quantity" type="number" min="0" defaultValue={card?.quantity ?? 1} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Observações
          <textarea name="notes" rows={3} defaultValue={card?.notes ?? ""} className={field} />
        </label>
        <label className={`${label} sm:col-span-2`}>
          Fotos reais da carta
          <input name="photos" type="file" accept="image/*" multiple className={field} />
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="is_foil" defaultChecked={card?.is_foil} /> Foil / Holo
        </label>
        <label className="flex items-center gap-2 text-sm">
          <input type="checkbox" name="featured" defaultChecked={card?.featured} /> Destaque
        </label>
        <button className="rounded-lg bg-violet-700 py-3 font-bold text-white sm:col-span-2">
          Salvar carta
        </button>
      </form>
    </div>
  );
}
